import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Brain,
  Search,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Send,
  RefreshCw,
  Play,
  Square,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkle,
  Settings,
  ChevronDown,
  ChevronUp,
  Download,
  Check,
  User,
  Heart,
  Calendar,
  Layers,
  BookMarked,
  LogOut,
  MessageSquare,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  StudyMode,
  ChatMessage,
  ChapterProgress,
  StudentProfile
} from "./types";
import {
  float32ToInt16PCM,
  arrayBufferToBase64,
  base64ToFloat32PCM,
  parseTeachingSections,
  NotebookSection
} from "./utils";
import { useAuth } from "./AuthContext";
import { api, getToken } from "./api";
import {
  DEFAULT_CHAPTERS,
  makeDefaultProfile,
  makeWelcomeMessage
} from "./defaults";
import { Markdown } from "./Markdown";
import Login from "./Login";

const SUGGESTED_QUERIES = [
  { label: "Explain Photosynthesis light reactions", prompt: "Can you explain Photosynthesis and light reactions from the start? Ask me a diagnostic question first!" },
  { label: "JEE: Newton's 2nd Law", prompt: "Explain Newton's Second Law of Motion at a JEE exam level. Give me a good analogy!" },
  { label: "NEET: Cell Division", prompt: "I am preparing for NEET. Let's study Cell Division (Mitosis vs Meiosis). Start with simple intuition." },
  { label: "Quadratic Equation Roots", prompt: "Let's study Quadratic Equations and how to find their roots step-by-step. Let's do a worked example." }
];

type MobileView = "study" | "chat" | "tools";

export default function App() {
  const { account, loading: authLoading, logout } = useAuth();

  // Profile, study log, and chat — loaded from the backend for the signed-in user.
  const [profile, setProfile] = useState<StudentProfile>(() => makeDefaultProfile());
  const [chapters, setChapters] = useState<ChapterProgress[]>(DEFAULT_CHAPTERS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([makeWelcomeMessage()]);
  const [dataLoading, setDataLoading] = useState(true);
  const loadedRef = useRef(false);

  // Generated diagrams stay device-local (Firebase Storage is the future home).
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string }[]>(() => {
    const saved = localStorage.getItem("clarify_images");
    return saved ? JSON.parse(saved) : [];
  });

  // UI Interactive States
  const [inputText, setInputText] = useState("");
  const [studyMode, setStudyMode] = useState<StudyMode>("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const [deepVerify, setDeepVerify] = useState(false);

  // Custom image generator state
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Add Custom Chapter Modal / Form
  const [newChapterName, setNewChapterName] = useState("");
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  // Settings Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<StudentProfile>({ ...profile });
  const [selectedVoice, setSelectedVoice] = useState<"Kore" | "Zephyr" | "Puck" | "Charon" | "Fenrir">("Kore");

  // Audio / TTS playing states
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // WebSocket / Live Audio states
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>("Disconnected");
  const liveWsRef = useRef<WebSocket | null>(null);

  // Audio Input & Output elements for Live session
  const micCtxRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const liveInterruptedRef = useRef<boolean>(false);

  // Auto scroll
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Seed profile + study log from the account, then load chat history.
  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    loadedRef.current = false;
    setDataLoading(true);
    setProfile(account.profile);
    setChapters(account.chapters || []);

    api
      .getMessages()
      .then(({ messages }) => {
        if (cancelled) return;
        if (messages.length > 0) {
          setChatHistory(messages);
        } else {
          const welcome = makeWelcomeMessage();
          setChatHistory([welcome]);
          api.addMessage(welcome).catch(() => {});
        }
      })
      .catch((err) => console.error("Failed to load your study data:", err))
      .finally(() => {
        if (!cancelled) {
          setDataLoading(false);
          loadedRef.current = true;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [account?.id]);

  // Debounced save of profile + study log to the backend.
  useEffect(() => {
    if (!account || !loadedRef.current) return;
    const t = setTimeout(() => {
      api.updateMe({ ...profile, chapters }).catch((e) => console.error("Save failed:", e));
    }, 700);
    return () => clearTimeout(t);
  }, [profile, chapters, account?.id]);

  // Generated images remain in localStorage (per-device gallery).
  useEffect(() => {
    localStorage.setItem("clarify_images", JSON.stringify(generatedImages));
  }, [generatedImages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  // Clean up audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      stopLiveSession();
    };
  }, []);

  // Handle message send
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString(),
      mode: studyMode
    };

    setChatHistory((prev) => [...prev, userMsg]);
    api.addMessage(userMsg).catch(() => {});
    setIsGenerating(true);

    try {
      // Prepare chat history to feed backend context
      const serverHistory = chatHistory.slice(-10).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const data = await api.chat({
        message: text,
        history: serverHistory,
        mode: studyMode,
        board: profile.board,
        grade: profile.grade,
        language: profile.language,
        preferredAnalogy: profile.preferredAnalogy,
        deepVerify
      });

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
        mode: studyMode,
        sources: data.sources || []
      };

      setChatHistory((prev) => [...prev, modelMsg]);
      api.addMessage(modelMsg).catch(() => {});
    } catch (error: any) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `⚠️ **I encountered a small hiccup:** ${error.message || "Something went wrong while connecting to Clarify.AI."}\n\nThis is a very common issue when API limits are exceeded or the environment is busy. Let's try sending the message again!`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle TTS playback
  const handleSpeak = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      // Stop currently playing
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingMessageId(null);
      return;
    }

    // Stop previous player
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const cachedMsgIndex = chatHistory.findIndex(m => m.id === messageId);
    if (cachedMsgIndex !== -1 && chatHistory[cachedMsgIndex].audioBase64) {
      // Play from cache
      playBase64Audio(chatHistory[cachedMsgIndex].audioBase64!, messageId);
      return;
    }

    setPlayingMessageId(messageId);

    try {
      // Extract clean text (strip markdown to make speech fluid)
      const cleanText = text
        .replace(/[*_#`~\[\]()\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 500); // Speak the first 500 chars for clean pacing and quick loading

      const data = await api.tts({ text: cleanText, voice: selectedVoice });
      if (data.audio) {
        // Cache audio in memory only (not persisted, to avoid storage bloat)
        setChatHistory(prev => prev.map(m => m.id === messageId ? { ...m, audioBase64: data.audio } : m));
        playBase64Audio(data.audio, messageId);
      }
    } catch (err) {
      console.error("TTS synthesis failed", err);
      setPlayingMessageId(null);
    }
  };

  const playBase64Audio = (base64: string, messageId: string) => {
    const audioUrl = `data:audio/wav;base64,${base64}`;
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setPlayingMessageId(messageId);

    audio.onended = () => {
      setPlayingMessageId(null);
    };

    audio.onerror = () => {
      setPlayingMessageId(null);
    };

    audio.play().catch(err => {
      console.error("Audio playback interrupted", err);
      setPlayingMessageId(null);
    });
  };

  // Concept Illustrator diagram generator
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const data = await api.generateImage({ prompt: imagePrompt, size: imageSize });
      if (data.imageUrl) {
        setGeneratedImages(prev => [{ url: data.imageUrl, prompt: imagePrompt }, ...prev]);
        setImagePrompt("");
      }
    } catch (err: any) {
      setImageError(err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Add custom studied chapter
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;

    const newCh: ChapterProgress = {
      id: `ch-${Date.now()}`,
      name: newChapterName,
      mastery: "developing",
      confidenceScore: 50,
      lastStudied: new Date().toISOString().split("T")[0]
    };

    setChapters(prev => [newCh, ...prev]);
    setNewChapterName("");
    setIsAddingChapter(false);
    setMobileView("chat");

    // Friendly prompt injection to study this new chapter
    handleSendMessage(`Let's study the new chapter: "${newCh.name}". Can you start with a short diagnostic check to gauge my level?`);
  };

  const handleUpdateMastery = (id: string, newMastery: "weak" | "developing" | "strong") => {
    let score = 50;
    if (newMastery === "strong") score = 85;
    if (newMastery === "weak") score = 25;

    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, mastery: newMastery, confidenceScore: score } : ch));
  };

  const handleDeleteChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChapters(prev => prev.filter(ch => ch.id !== id));
  };

  // Save student profile modifications
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editProfileForm);
    setIsEditingProfile(false);
  };

  // Real-time voice conversation session (Live API)
  const startLiveSession = async () => {
    try {
      setLiveStatus("Initializing microphone...");

      // Initialize Audio Player context for 24kHz output
      const playCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      playCtxRef.current = playCtx;
      nextPlayTimeRef.current = playCtx.currentTime;
      liveInterruptedRef.current = false;

      // Ask for mic stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup Web Socket (with JWT so the backend can authorize)
      const token = getToken();
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/live${token ? `?token=${encodeURIComponent(token)}` : ""}`;

      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;
      setIsLiveActive(true);

      ws.onopen = () => {
        setLiveStatus("Connected. Say hello to Clarify.AI!");
        // Send initial start signal to trigger connection to Gemini Live
        ws.send(JSON.stringify({ type: "start" }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "ready") {
            setLiveStatus("Clarify.AI is listening to your voice!");
          } else if (msg.type === "audio") {
            if (liveInterruptedRef.current) return; // Ignore audio chunk if interrupted

            // Play back PCM 24kHz chunk gaplessly
            const float32PCM = base64ToFloat32PCM(msg.audio);
            playLiveAudioChunk(float32PCM);
          } else if (msg.type === "interrupted") {
            // Immediately stop sound playback
            liveInterruptedRef.current = true;
            nextPlayTimeRef.current = playCtxRef.current?.currentTime || 0;
          } else if (msg.type === "error") {
            setLiveStatus(`Error: ${msg.error}`);
            stopLiveSession();
          }
        } catch (e) {
          console.error("WebSocket client parsing error:", e);
        }
      };

      ws.onclose = () => {
        setLiveStatus("Closed");
        stopLiveSession();
      };

      ws.onerror = (err) => {
        setLiveStatus("Socket Error");
        console.error("Live WebSocket Error", err);
      };

      // Mic setup for 16kHz
      const micCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      micCtxRef.current = micCtx;

      const source = micCtx.createMediaStreamSource(stream);
      const processor = micCtx.createScriptProcessor(2048, 1, 1);
      micProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(micCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const channelData = e.inputBuffer.getChannelData(0);
          const pcmBuffer = float32ToInt16PCM(channelData);
          const base64PCM = arrayBufferToBase64(pcmBuffer);

          ws.send(JSON.stringify({ audio: base64PCM }));
        }
      };

    } catch (err: any) {
      console.error(err);
      setLiveStatus("Microphone Permission Denied. Please ensure mic is connected or open in a new tab.");
      setIsLiveActive(false);
    }
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    setLiveStatus("Disconnected");

    // Close WebSocket
    if (liveWsRef.current) {
      liveWsRef.current.close();
      liveWsRef.current = null;
    }

    // Stop recording mic
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }
    if (micCtxRef.current) {
      micCtxRef.current.close();
      micCtxRef.current = null;
    }

    // Stop playback
    if (playCtxRef.current) {
      playCtxRef.current.close();
      playCtxRef.current = null;
    }
  };

  const playLiveAudioChunk = (float32Array: Float32Array) => {
    const playCtx = playCtxRef.current;
    if (!playCtx) return;

    const audioBuffer = playCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = playCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(playCtx.destination);

    // Schedule playback gaplessly
    const currentTime = playCtx.currentTime;
    let startTime = nextPlayTimeRef.current;

    if (startTime < currentTime) {
      startTime = currentTime + 0.05; // Guard lag spikes
    }

    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;
  };

  // Pre-fill student inquiry prompt from logs or chips, then jump to the chat.
  const selectSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
    setMobileView("chat");
  };

  // Custom visual block text renderer which handles beautiful bento tab sections
  const renderMessageContent = (message: ChatMessage) => {
    const sections = parseTeachingSections(message.text);

    if (sections.length > 0) {
      return <NotebookViewer sections={sections} messageId={message.id} rawText={message.text} />;
    }

    // Default: full markdown + math + mermaid rendering
    return <Markdown>{message.text}</Markdown>;
  };

  // --- Gated rendering: wait for auth, then require sign-in ---
  if (authLoading || (account && dataLoading)) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-editorial-ivory text-editorial-charcoal">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-editorial-sage">
          <span className="font-serif text-2xl italic leading-none text-editorial-ivory">C</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-editorial-charcoal/50">
          <Loader2 size={15} className="animate-spin" />
          Preparing your study desk…
        </div>
      </div>
    );
  }

  if (!account) {
    return <Login />;
  }

  return (
    <div className="min-h-[100dvh] bg-editorial-ivory text-editorial-charcoal font-sans flex flex-col antialiased selection:bg-editorial-sage/20 selection:text-editorial-charcoal">
      {/* Premium Header */}
      <nav className="flex justify-between items-center px-4 py-4 md:px-8 md:py-6 lg:px-12 lg:py-8 border-b border-editorial-line bg-editorial-ivory">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-editorial-sage flex items-center justify-center shrink-0">
            <span className="text-editorial-ivory font-serif italic text-lg leading-none">C</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif italic text-xl md:text-2xl tracking-tight text-editorial-charcoal">Clarify.AI</span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] font-mono bg-editorial-sage/10 text-editorial-sage px-2 py-0.5 rounded">Mentor v3.1</span>
          </div>
        </div>

        {/* Setup options & Diagnostic Info */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-60">Studying as: {profile.name}</p>
            <p className="text-[9px] text-editorial-sage font-mono tracking-wider">{profile.board} • {profile.grade}</p>
          </div>
          <button
            onClick={() => {
              setEditProfileForm({ ...profile });
              setIsEditingProfile(true);
            }}
            className="flex items-center gap-2 px-3 md:px-6 py-2 rounded-full border border-editorial-line text-xs uppercase tracking-widest hover:bg-editorial-sage hover:text-white transition-all cursor-pointer font-semibold"
            id="btn-settings-profile"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Study Preferences</span>
          </button>
          {account && (
            <button
              onClick={() => logout()}
              title="Sign out"
              aria-label="Sign out"
              className="w-9 h-9 rounded-full border border-editorial-line flex items-center justify-center text-editorial-charcoal/60 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all cursor-pointer shrink-0"
              id="btn-logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </nav>

      {/* Main Study Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1700px] w-full mx-auto pb-16 lg:pb-0">

        {/* LEFT COLUMN: Study Progress and History Logs */}
        <aside className={`${mobileView === "study" ? "flex" : "hidden"} lg:flex w-full lg:w-80 flex-1 lg:flex-none border-r border-editorial-line p-5 md:p-8 flex-col gap-6 bg-editorial-ivory overflow-y-auto`}>

          {/* Student Status Card */}
          <div className="bg-white border border-editorial-line-light rounded-[24px] p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-editorial-sage/10 flex items-center justify-center text-editorial-sage">
                <User size={15} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-editorial-charcoal font-sans">{profile.name}</h3>
                <p className="text-[10px] uppercase tracking-wider text-editorial-charcoal/50">{profile.grade} • {profile.language}</p>
              </div>
            </div>
            <div className="text-xs text-editorial-charcoal/70 leading-relaxed border-t border-editorial-line-light pt-3">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-editorial-sage block mb-1">Exam Goal</span>
              <p className="font-serif italic text-xs">"{profile.examGoals || "Learn deeply with real analogies"}"</p>
            </div>

            {/* Preferred analogy tag */}
            <div className="flex items-center gap-1.5 text-[10px] text-editorial-sage bg-editorial-stone/60 px-3 py-1.5 rounded-full mt-1 border border-editorial-line-light font-serif italic">
              <Sparkle size={10} className="text-editorial-sage animate-pulse" />
              <span>Analogy Style: <strong>{profile.preferredAnalogy}</strong></span>
            </div>
          </div>

          {/* Chapters Study Log / Weak vs Strong Tracker */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookMarked size={14} className="text-editorial-sage" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-editorial-sage">
                  My Study Log
                </h3>
              </div>
              <button
                onClick={() => setIsAddingChapter(true)}
                className="w-6 h-6 rounded-full bg-editorial-sage/10 text-editorial-sage hover:bg-editorial-sage/20 flex items-center justify-center transition-colors cursor-pointer border border-editorial-sage/15"
                title="Add a studied chapter"
                id="btn-add-chapter"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Quick add chapter form */}
            {isAddingChapter && (
              <motion.form
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAddChapter}
                className="bg-white border border-editorial-line p-4 rounded-[20px] flex flex-col gap-2.5 shadow-sm"
              >
                <input
                  type="text"
                  required
                  placeholder="Chapter/Topic Name..."
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className="px-3 py-2 border border-editorial-line rounded-xl text-xs bg-editorial-ivory/50 focus:outline-none focus:ring-1 focus:ring-editorial-sage placeholder-editorial-charcoal/35"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingChapter(false)}
                    className="px-2.5 py-1 text-[10px] text-editorial-charcoal/60 hover:bg-editorial-stone rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[10px] bg-editorial-sage text-editorial-ivory rounded hover:bg-editorial-sage/90 font-medium"
                  >
                    Add & Study
                  </button>
                </div>
              </motion.form>
            )}

            {/* List of chapters with mastery configuration */}
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => selectSuggestedPrompt(`Explain the concept of "${ch.name}". Start with a short diagnostic check to gauge my level.`)}
                  className="group bg-white border border-editorial-line-light p-4 rounded-[20px] flex flex-col gap-3 hover:border-editorial-sage/40 transition-all cursor-pointer shadow-sm relative hover:shadow animate-fade-in"
                >
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-xs font-serif font-semibold text-editorial-charcoal leading-tight pr-5">
                      {ch.name}
                    </h4>
                    <button
                      onClick={(e) => handleDeleteChapter(ch.id, e)}
                      className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-editorial-charcoal/40 hover:text-red-700 transition-opacity"
                      title="Remove studied log"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[9px] uppercase tracking-wider font-semibold">
                    <div className="flex gap-1">
                      {/* Mastery selection tags */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateMastery(ch.id, "weak");
                        }}
                        className={`px-2 py-0.5 rounded-full transition-colors ${
                          ch.mastery === "weak"
                            ? "bg-red-50 text-red-800 border border-red-200"
                            : "text-editorial-charcoal/40 hover:bg-editorial-stone"
                        }`}
                      >
                        Weak
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateMastery(ch.id, "developing");
                        }}
                        className={`px-2 py-0.5 rounded-full transition-colors ${
                          ch.mastery === "developing"
                            ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                            : "text-editorial-charcoal/40 hover:bg-editorial-stone"
                        }`}
                      >
                        Dev
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateMastery(ch.id, "strong");
                        }}
                        className={`px-2 py-0.5 rounded-full transition-colors ${
                          ch.mastery === "strong"
                            ? "bg-emerald-50/70 text-emerald-800 border border-emerald-200"
                            : "text-editorial-charcoal/40 hover:bg-editorial-stone"
                        }`}
                      >
                        Strong
                      </button>
                    </div>

                    <span className="text-[9px] text-editorial-charcoal/40 font-mono">
                      Conf: {ch.confidenceScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core teaching philosophy prompt cards */}
          <div className="border-t border-editorial-line pt-6 mt-auto flex flex-col gap-2 text-center">
            <p className="text-[11px] opacity-40 uppercase tracking-[0.1em]">Learning Companion</p>
            <p className="font-serif italic text-lg text-editorial-sage font-medium">Warm • Patient • Curious</p>
          </div>
        </aside>

        {/* CENTER COLUMN: Clarify.AI Interactive Desk */}
        <main className={`${mobileView === "chat" ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-white/40 p-4 md:p-8 lg:p-12 overflow-hidden`}>

          {/* Study Mode Selector & Status Header */}
          <div className="bg-white border border-editorial-line-light rounded-[24px] md:rounded-[32px] p-4 md:p-6 mb-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">

            {/* Left side mode detail */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <div className={`w-3.5 h-3.5 rounded-full ${isGenerating ? 'bg-editorial-sage animate-ping' : 'bg-editorial-sage/60'} absolute -top-0.5 -right-0.5`} />
                <div className="w-10 h-10 rounded-full bg-editorial-stone border border-editorial-line-light flex items-center justify-center text-editorial-sage">
                  {studyMode === "thinking" ? (
                    <Brain className="animate-pulse" size={20} />
                  ) : studyMode === "search" ? (
                    <Search size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-editorial-sage">Desk Mode</p>
                <h2 className="text-sm font-serif font-medium text-editorial-charcoal">
                  {studyMode === "thinking"
                    ? "Deep Thinking (Reasoning Mode)"
                    : studyMode === "search"
                    ? "Google Grounded Research"
                    : "Standard Warm Mentoring"}
                </h2>
              </div>
            </div>

            {/* Interactive Mode toggle chips */}
            <div className="flex bg-editorial-stone/40 p-1 rounded-full border border-editorial-line-light w-full md:w-auto justify-between md:justify-start gap-1">
              <button
                onClick={() => setStudyMode("standard")}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  studyMode === "standard"
                    ? "bg-white text-editorial-charcoal shadow-sm border border-editorial-line"
                    : "text-editorial-charcoal/50 hover:text-editorial-charcoal"
                }`}
                title="Slower, conversational model using gemini-3.5-flash"
                id="mode-standard"
              >
                <Sparkles size={13} />
                Standard
              </button>

              <button
                onClick={() => setStudyMode("thinking")}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  studyMode === "thinking"
                    ? "bg-editorial-sage text-white shadow-sm border border-editorial-sage"
                    : "text-editorial-charcoal/50 hover:text-editorial-charcoal"
                }`}
                title="Uses gemini-3.1-pro-preview with HIGH thinking level for deep STEM analysis"
                id="mode-thinking"
              >
                <Brain size={13} />
                Thinking
              </button>

              <button
                onClick={() => setStudyMode("search")}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  studyMode === "search"
                    ? "bg-editorial-charcoal text-white shadow-sm border border-editorial-charcoal"
                    : "text-editorial-charcoal/50 hover:text-editorial-charcoal"
                }`}
                title="Uses Search Grounding to fetch up to date web facts"
                id="mode-search"
              >
                <Search size={13} />
                <span className="whitespace-nowrap">Google Search</span>
              </button>
            </div>
          </div>

          {/* Active Voice live conversation widget */}
          <div className={`border rounded-[24px] md:rounded-[32px] p-4 md:p-6 mb-4 transition-all duration-300 ${
            isLiveActive
              ? "bg-editorial-stone/80 border-editorial-sage shadow-md ring-1 ring-editorial-sage/20"
              : "bg-white border-editorial-line-light"
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  isLiveActive ? "bg-editorial-sage animate-pulse" : "bg-editorial-sage/30 text-editorial-sage"
                }`}>
                  <Mic size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-editorial-charcoal flex items-center gap-1 font-sans">
                    Live Audio Dialogue (Gemini Live API)
                    {isLiveActive && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
                  </h3>
                  <p className="text-[10px] text-editorial-charcoal/50 font-mono uppercase tracking-wider">
                    Status: <span className={isLiveActive ? "text-editorial-sage font-bold" : ""}>{liveStatus}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                {isLiveActive ? (
                  <button
                    onClick={stopLiveSession}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-800 hover:bg-red-900 text-white text-xs font-semibold shadow transition-all w-full sm:w-auto justify-center font-serif italic"
                    id="btn-stop-live"
                  >
                    <MicOff size={13} />
                    Stop Voice Dialogue
                  </button>
                ) : (
                  <button
                    onClick={startLiveSession}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-editorial-sage hover:bg-editorial-sage/90 text-white text-xs font-semibold shadow transition-all w-full sm:w-auto justify-center font-serif italic"
                    id="btn-start-live"
                  >
                    <Mic size={13} />
                    Start Voice Dialogue
                  </button>
                )}
              </div>
            </div>

            {/* Glowing audio wave visualization if live conversation is listening/answering */}
            {isLiveActive && (
              <div className="mt-3 flex items-center justify-center gap-1 py-1 bg-[#FAF9F6] rounded-lg">
                {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: [10, val * 4, 10] }}
                    transition={{ duration: 1 + idx * 0.1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-editorial-sage rounded-full"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Chat Messages Desk */}
          <div className="flex-1 bg-[#FAF9F6]/30 border border-editorial-line-light rounded-[24px] md:rounded-[32px] p-4 md:p-6 overflow-y-auto flex flex-col gap-6 shadow-inner min-h-[300px]">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col max-w-[92%] md:max-w-[85%] ${
                  message.role === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {/* Chat bubble label info */}
                <div className="flex items-center gap-2 mb-1.5 text-[10px] text-editorial-charcoal/40 font-mono uppercase tracking-wider">
                  <span>{message.role === "user" ? "You" : "Clarify.AI"}</span>
                  <span>•</span>
                  <span>{message.timestamp}</span>
                  {message.mode && (
                    <span className="bg-editorial-stone text-editorial-charcoal/60 px-2 py-0.5 rounded font-sans font-semibold text-[9px]">
                      {message.mode}
                    </span>
                  )}
                </div>

                {/* Message container */}
                <div
                  className={`p-4 md:p-6 relative shadow-sm border ${
                    message.role === "user"
                      ? "bg-editorial-stone border-editorial-line rounded-[24px] rounded-tr-none text-editorial-charcoal font-serif italic text-sm md:text-base"
                      : "bg-white border-editorial-line-light rounded-[24px] md:rounded-[32px] rounded-tl-none text-editorial-charcoal text-sm md:text-base leading-relaxed"
                  }`}
                  id={`msg-bubble-${message.id}`}
                >
                  {renderMessageContent(message)}

                  {/* Grounded references indicator */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-editorial-line-light flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] text-editorial-charcoal/50 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Search size={10} className="text-editorial-sage" />
                        Grounded Sources:
                      </span>
                      {message.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-[#FAF9F6] text-editorial-sage font-mono px-2.5 py-1 rounded-full border border-editorial-line-light flex items-center gap-1 hover:bg-editorial-sage/10 transition-colors"
                        >
                          {src.title}
                          <ExternalLink size={8} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Actions (Text to speech trigger) */}
                  {message.role === "model" && (
                    <div className="mt-4 flex justify-end gap-2 border-t border-editorial-line-light pt-3">
                      <button
                        onClick={() => handleSpeak(message.id, message.text)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all font-serif italic ${
                          playingMessageId === message.id
                            ? "bg-editorial-sage text-white"
                            : "bg-editorial-stone hover:bg-editorial-sage/10 text-editorial-sage border border-editorial-line-light"
                        }`}
                        title="Say this response out loud"
                        id={`btn-tts-${message.id}`}
                      >
                        {playingMessageId === message.id ? (
                          <>
                            <VolumeX size={12} className="animate-pulse" />
                            <span>Mute</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Micro waveform indicating TTS audio playing */}
                {playingMessageId === message.id && (
                  <div className="flex gap-0.5 mt-1.5 px-3 py-1 rounded-full bg-editorial-stone self-start items-center border border-editorial-line-light">
                    <span className="text-[9px] text-editorial-sage font-mono uppercase tracking-wider mr-1.5 font-bold">Playing Audio</span>
                    {[2, 4, 1, 3, 2].map((h, i) => (
                      <span
                        key={i}
                        className="w-0.5 bg-editorial-sage rounded-full animate-bounce"
                        style={{ height: `${h * 3}px`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="self-start max-w-[85%] flex flex-col items-start">
                <div className="text-[10px] text-editorial-charcoal/40 font-mono uppercase tracking-wider mb-1">
                  Clarify.AI is organizing concepts...
                </div>
                <div className="p-5 rounded-[24px] bg-[#FAF9F6] border border-editorial-line rounded-tl-none flex items-center gap-3 animate-pulse">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-editorial-sage/40 animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-2 h-2 rounded-full bg-editorial-sage/70 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 rounded-full bg-editorial-sage animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <span className="text-xs text-editorial-sage font-serif italic">
                    {studyMode === "thinking" ? "Engaging deep reasoning path..." : "Building student notebook..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick study start suggestions */}
          {chatHistory.length <= 1 && (
            <div className="mt-4">
              <p className="text-[10px] text-editorial-sage font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-1">
                <Sparkles size={11} className="text-editorial-sage" />
                Suggested Mastery Check-ins
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSuggestedPrompt(q.prompt)}
                    className="text-left px-5 py-3.5 rounded-full border border-editorial-line bg-white text-xs hover:bg-editorial-sage hover:text-white transition-all text-editorial-charcoal/80 shadow-sm font-medium uppercase tracking-wider text-center cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deep-verify toggle: a second examiner pass that double-checks accuracy (slower) */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setDeepVerify((v) => !v)}
              title="Runs a second 'examiner' pass that double-checks facts and calculations. Slower, best for important problems."
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                deepVerify
                  ? "bg-editorial-sage text-white border-editorial-sage shadow-sm"
                  : "bg-white text-editorial-charcoal/60 border-editorial-line hover:bg-editorial-stone"
              }`}
              id="btn-deepverify"
            >
              <CheckCircle2 size={13} />
              Deep-check {deepVerify ? "On" : "Off"}
            </button>
          </div>

          {/* User Chat Input panel */}
          <div className="mt-2 bg-white border border-editorial-line rounded-[28px] md:rounded-[32px] p-2.5 md:p-3 flex items-center gap-2 shadow-sm focus-within:border-editorial-sage focus-within:ring-1 focus-within:ring-editorial-sage/30 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything... (e.g. 'Explain valency with cooking')"
              className="flex-1 px-3 md:px-4 py-2 bg-transparent text-editorial-charcoal focus:outline-none text-sm md:text-base placeholder-editorial-charcoal/30"
              disabled={isGenerating}
              id="input-chat"
            />
            <button
              onClick={() => handleSendMessage()}
              className="w-11 h-11 bg-editorial-sage hover:bg-editorial-sage/90 text-white rounded-full flex items-center justify-center shadow transition-colors shrink-0 disabled:bg-editorial-stone disabled:text-editorial-charcoal/30 cursor-pointer"
              disabled={isGenerating || !inputText.trim()}
              id="btn-send-chat"
            >
              <Send size={16} />
            </button>
          </div>
        </main>

        {/* RIGHT COLUMN: Study Tool Panel / Diagram Generator & Profile Settings */}
        <aside className={`${mobileView === "tools" ? "flex" : "hidden"} lg:flex w-full lg:w-80 flex-1 lg:flex-none border-l border-editorial-line p-5 md:p-8 flex-col gap-6 bg-editorial-ivory overflow-y-auto`}>

          {/* Custom Concept Illustrator */}
          <div className="flex flex-col gap-4 bg-white border border-editorial-line-light p-6 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-editorial-sage animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-editorial-sage font-sans">
                Illustrator
              </h3>
            </div>

            <p className="text-[11px] text-editorial-charcoal/60 leading-normal font-serif italic">
              Need a clear diagram for visual study? Describe it below to create a high-quality visual representation.
            </p>

            <div className="flex flex-col gap-3">
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="e.g., Structure of an animal cell, labelled, vector style diagram"
                className="w-full min-h-24 px-3 py-2 border border-editorial-line rounded-xl text-xs bg-editorial-ivory/30 focus:outline-none focus:ring-1 focus:ring-editorial-sage placeholder-editorial-charcoal/30 resize-none text-editorial-charcoal"
              />

              {/* Quality size selector */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-editorial-charcoal/50 uppercase tracking-wider font-semibold">Quality:</span>
                <div className="flex gap-1 bg-editorial-stone/40 p-0.5 rounded-full border border-editorial-line-light">
                  {(["1K", "2K", "4K"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setImageSize(sz)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider transition-colors cursor-pointer ${
                        imageSize === sz
                          ? "bg-editorial-sage text-white"
                          : "text-editorial-charcoal/40 hover:text-editorial-charcoal"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-white text-xs font-bold transition-all shadow disabled:bg-editorial-stone disabled:text-editorial-charcoal/30 cursor-pointer"
                id="btn-generate-image"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Draw Study Diagram
                  </>
                )}
              </button>

              {imageError && (
                <div className="text-red-700 bg-red-50 text-[11px] p-3 rounded-xl border border-red-100 font-sans leading-normal">
                  {imageError}
                </div>
              )}
            </div>

            {/* Generated Visual Diagram view */}
            {generatedImages.length > 0 && (
              <div className="mt-3 border-t border-editorial-line pt-3 flex flex-col gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-charcoal/40 font-sans">
                  Gallery ({generatedImages.length})
                </span>
                <div className="flex flex-col gap-3">
                  {generatedImages.slice(0, 3).map((img, i) => (
                    <div key={i} className="bg-editorial-stone/50 border border-editorial-line-light p-2.5 rounded-xl flex flex-col gap-1.5">
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full aspect-square object-cover rounded-lg border border-editorial-line-light shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex justify-between items-center text-[10px] text-editorial-charcoal">
                        <span className="font-serif italic truncate max-w-40" title={img.prompt}>{img.prompt}</span>
                        <a
                          href={img.url}
                          download={`clarify-diagram-${i}.png`}
                          className="p-1 rounded-full bg-white hover:bg-editorial-stone border border-editorial-line-light text-editorial-sage transition-colors"
                          title="Download diagram"
                        >
                          <Download size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick study check tools (Board presets checklist) */}
          <div className="flex flex-col gap-4 bg-white border border-editorial-line-light p-6 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-editorial-sage" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-editorial-sage font-sans">
                Simulator
              </h3>
            </div>
            <p className="text-[11px] text-editorial-charcoal/60 leading-relaxed font-serif italic">
              Dynamically simulate board level or competitive exam practice items.
            </p>

            <div className="flex flex-col gap-2">
              {[
                { name: "CBSE Board Practice", prompt: "I would like some CBSE board sample practice questions on light reaction photosynthesis. Keep them graded!" },
                { name: "ICSE Board Mock", prompt: "Generate some ICSE-style structured questions about physics force diagrams. Guide me step-by-step!" },
                { name: "JEE Main Tough Quiz", prompt: "Quiz me on an advanced JEE level physics problem about friction and Newton's laws. Show hints only when requested!" },
                { name: "NEET Biology MCQ", prompt: "Simulate a high-yield NEET MCQ about mitochondria and ATP generation. Don't reveal the answer immediately!" }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestedPrompt(item.prompt)}
                  className="w-full text-left px-4 py-2.5 rounded-full text-xs bg-white border border-editorial-line hover:bg-editorial-sage hover:text-white transition-all text-editorial-charcoal/80 font-medium uppercase tracking-wider text-center cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-editorial-line bg-editorial-ivory/95 backdrop-blur-sm">
        {([
          { k: "study", label: "Study Log", icon: <BookMarked size={18} /> },
          { k: "chat", label: "Teacher", icon: <MessageSquare size={18} /> },
          { k: "tools", label: "Tools", icon: <Layers size={18} /> }
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setMobileView(t.k)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              mobileView === t.k ? "text-editorial-sage" : "text-editorial-charcoal/40 hover:text-editorial-charcoal"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      {/* MODAL: Preferences & Preferences Form Setup */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 bg-[#1e1e1a]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-editorial-ivory border border-editorial-line w-full max-w-lg rounded-[32px] p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-editorial-sage" />
                  <h3 className="text-base font-serif font-medium text-editorial-charcoal">Study Preferences</h3>
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-editorial-charcoal/40 hover:text-editorial-charcoal font-serif text-2xl cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">

                {/* Student Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-editorial-sage">My Name</label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                    className="px-4 py-2.5 border border-editorial-line rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-editorial-sage text-editorial-charcoal"
                  />
                </div>

                {/* Target Exam Board */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-editorial-sage">Target Board/Exam</label>
                    <select
                      value={editProfileForm.board}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, board: e.target.value })}
                      className="px-4 py-2.5 border border-editorial-line rounded-xl text-xs bg-white focus:outline-none text-editorial-charcoal"
                    >
                      <option value="None">General Study</option>
                      <option value="CBSE">CBSE Board</option>
                      <option value="ICSE">ICSE Board</option>
                      <option value="State Board">State Board</option>
                      <option value="JEE">JEE Prep</option>
                      <option value="NEET">NEET Prep</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-editorial-sage">Grade / Level</label>
                    <input
                      type="text"
                      value={editProfileForm.grade}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, grade: e.target.value })}
                      className="px-4 py-2.5 border border-editorial-line rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-editorial-sage text-editorial-charcoal"
                    />
                  </div>
                </div>

                {/* Language Preference */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-editorial-sage">Language</label>
                    <select
                      value={editProfileForm.language}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, language: e.target.value })}
                      className="px-4 py-2.5 border border-editorial-line rounded-xl text-xs bg-white focus:outline-none text-editorial-charcoal"
                    >
                      <option value="English">Pure English</option>
                      <option value="Hinglish">Hinglish (Hindi + English)</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>

                  {/* Analogy types */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-editorial-sage">Preferred Analogy Type</label>
                    <select
                      value={editProfileForm.preferredAnalogy}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, preferredAnalogy: e.target.value })}
                      className="px-4 py-2.5 border border-editorial-line rounded-xl text-xs bg-white focus:outline-none text-editorial-charcoal"
                    >
                      <option value="Daily Life">Daily Life / Everyday objects</option>
                      <option value="Sports">Sports / Cricket / Football</option>
                      <option value="Cooking">Cooking & Kitchen recipes</option>
                      <option value="Bicycles & Trains">Bicycles, Trains & Transportation</option>
                      <option value="Mobile Phones & Tech">Mobile Phones, Games & Apps</option>
                    </select>
                  </div>
                </div>

                {/* TTS Voice Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-editorial-sage">Soft Voice Settings (Text-To-Speech)</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(["Kore", "Zephyr", "Puck", "Charon", "Fenrir"] as const).map((vc) => (
                      <button
                        key={vc}
                        type="button"
                        onClick={() => setSelectedVoice(vc)}
                        className={`py-2 px-1 rounded-full text-[10px] font-bold text-center border transition-colors cursor-pointer ${
                          selectedVoice === vc
                            ? "bg-editorial-sage border-editorial-sage text-white shadow-sm"
                            : "bg-white border-editorial-line-light hover:bg-editorial-stone text-editorial-charcoal"
                        }`}
                      >
                        {vc}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-editorial-charcoal/40 font-mono">
                    Kore and Zephyr are soft-spoken and encouraging voices, ideal for learning.
                  </span>
                </div>

                {/* Study Exam Goals */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-editorial-sage">Exam Goals & Targets</label>
                  <textarea
                    rows={2}
                    value={editProfileForm.examGoals}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, examGoals: e.target.value })}
                    className="px-4 py-3 border border-editorial-line rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-editorial-sage placeholder-editorial-charcoal/30 resize-none text-editorial-charcoal"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-5 py-2.5 border border-editorial-line text-editorial-charcoal hover:bg-editorial-stone rounded-full text-xs font-serif italic transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-white font-serif italic rounded-full text-xs transition-colors cursor-pointer"
                  >
                    Save & Apply Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Visual Notebook Component that parses structured teacher responses into beautiful multi-tabbed visual sections
interface NotebookViewerProps {
  sections: NotebookSection[];
  messageId: string;
  rawText: string;
}

function NotebookViewer({ sections, messageId, rawText }: NotebookViewerProps) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  return (
    <div className="flex flex-col gap-4 max-w-full my-2">
      {/* Visual Journal Header */}
      <div className="bg-editorial-stone border border-editorial-line-light p-4 rounded-[20px] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <BookOpen size={15} className="text-editorial-sage shrink-0" />
          <span className="text-xs font-bold text-editorial-charcoal tracking-[0.2em] uppercase font-sans">
            Clarify Study Notebook
          </span>
        </div>
        <span className="text-[10px] text-white font-bold bg-editorial-sage px-3 py-1 rounded-full">
          {sections.length} Concept Blocks
        </span>
      </div>

      {/* Desktop Multi-Tabs layout / Mobile expandable lists */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch min-h-[250px] max-w-full">
        {/* Navigation Sidebar */}
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto pb-1.5 md:pb-0 shrink-0 md:w-44 border-b md:border-b-0 md:border-r border-editorial-line-light pr-0 md:pr-3 scrollbar-none">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTabIdx(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-left text-xs font-semibold transition-all shrink-0 md:w-full border cursor-pointer ${
                activeTabIdx === idx
                  ? "bg-editorial-sage text-white border-editorial-sage shadow-sm"
                  : "bg-white text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-stone/50 border-editorial-line-light"
              }`}
            >
              <span className="text-sm shrink-0">{sec.emoji}</span>
              <span className="truncate">{sec.title}</span>
            </button>
          ))}
        </div>

        {/* Selected Notebook Section Page */}
        <div className="flex-1 bg-white border border-editorial-line rounded-[24px] p-5 md:p-6 flex flex-col gap-2 shadow-sm min-w-0 max-w-full relative overflow-y-auto">
          {sections[activeTabIdx] && (
            <motion.div
              key={activeTabIdx}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col h-full justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-editorial-line-light mb-4">
                  <span className="text-xl">{sections[activeTabIdx].emoji}</span>
                  <h4 className="text-sm font-serif font-bold text-editorial-charcoal tracking-tight">
                    {sections[activeTabIdx].title}
                  </h4>
                </div>

                {/* Render content block with full markdown / math / mermaid support */}
                <div className="max-w-full overflow-x-auto">
                  <Markdown>{sections[activeTabIdx].content}</Markdown>
                </div>
              </div>

              {/* Progress pagination indicators */}
              <div className="mt-6 pt-4 border-t border-editorial-line-light flex items-center justify-between text-[10px] text-editorial-charcoal/40 uppercase tracking-wider">
                <span>Concept Segment {activeTabIdx + 1} of {sections.length}</span>
                <div className="flex gap-1.5">
                  <button
                    disabled={activeTabIdx === 0}
                    onClick={() => setActiveTabIdx(prev => prev - 1)}
                    className="px-3 py-1 rounded-full bg-editorial-stone hover:bg-editorial-sage/10 text-editorial-charcoal hover:text-editorial-sage border border-editorial-line-light font-serif italic text-[11px] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    disabled={activeTabIdx === sections.length - 1}
                    onClick={() => setActiveTabIdx(prev => prev + 1)}
                    className="px-3 py-1 rounded-full bg-editorial-stone hover:bg-editorial-sage/10 text-editorial-charcoal hover:text-editorial-sage border border-editorial-line-light font-serif italic text-[11px] disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
