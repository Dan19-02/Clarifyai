import React, { useState, useEffect, useRef } from "react";
import {
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
  Trash2,
  ExternalLink,
  Settings,
  Download,
  User,
  LogOut,
  MessageSquare,
  Loader2,
  Plus,
  Paperclip,
  X,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  StudyMode,
  ChatMessage,
  ChapterProgress,
  StudentProfile,
  Conversation
} from "./types";
import {
  float32ToInt16PCM,
  arrayBufferToBase64,
  base64ToFloat32PCM,
  parseTeachingSections,
  filesToAttachments,
  dataUrlToBase64,
  NotebookSection
} from "./utils";
import { useAuth } from "./AuthContext";
import { api, getToken } from "./api";
import { DEFAULT_CHAPTERS, makeDefaultProfile } from "./defaults";
import { Markdown } from "./Markdown";
import Login from "./Login";

const SUGGESTED_QUERIES = [
  { label: "Explain Photosynthesis", prompt: "Can you explain Photosynthesis and the light reactions from the start? Ask me a diagnostic question first!" },
  { label: "Newton's 2nd Law (JEE)", prompt: "Explain Newton's Second Law of Motion at a JEE exam level. Give me a good analogy!" },
  { label: "Cell Division (NEET)", prompt: "I am preparing for NEET. Let's study Cell Division (Mitosis vs Meiosis). Start with simple intuition." },
  { label: "Quadratic Equations", prompt: "Let's study Quadratic Equations and how to find their roots step-by-step with a worked example." }
];

const MAX_ATTACHMENTS = 6;

type MobileView = "study" | "chat";

export default function App() {
  const { account, loading: authLoading, logout } = useAuth();

  // Profile + study log come from the signed-in account.
  const [profile, setProfile] = useState<StudentProfile>(() => makeDefaultProfile());
  const [chapters, setChapters] = useState<ChapterProgress[]>(DEFAULT_CHAPTERS);
  const [dataLoading, setDataLoading] = useState(true);
  const loadedRef = useRef(false);

  // Conversations = separate chat windows. Only the active one's messages load.
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Generated diagrams stay device-local.
  const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string }[]>(() => {
    const saved = localStorage.getItem("clarify_images");
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<{ dataUrl: string; mimeType: string; name: string; isImage: boolean }[]>([]);
  const [studyMode, setStudyMode] = useState<StudyMode>("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const [deepVerify, setDeepVerify] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  // Concept illustrator
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Add chapter
  const [newChapterName, setNewChapterName] = useState("");
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  // Profile edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<StudentProfile>({ ...profile });
  const [selectedVoice, setSelectedVoice] = useState<"Kore" | "Zephyr" | "Puck" | "Charon" | "Fenrir">("Kore");

  // TTS playback
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Live voice
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>("Disconnected");
  const liveWsRef = useRef<WebSocket | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const liveInterruptedRef = useRef<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load profile, study log, conversations, and the active chat for the user.
  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    loadedRef.current = false;
    setDataLoading(true);
    setProfile(account.profile);
    setChapters(account.chapters || []);

    (async () => {
      try {
        const { conversations } = await api.listConversations(); // backend guarantees ≥1
        if (cancelled) return;
        setConversations(conversations);
        const first = conversations[0]?.id || null;
        setActiveId(first);
        if (first) {
          const { messages } = await api.getMessages(first);
          if (!cancelled) setChatHistory(messages);
        } else {
          setChatHistory([]);
        }
      } catch (err) {
        console.error("Failed to load your study data:", err);
      } finally {
        if (!cancelled) {
          setDataLoading(false);
          loadedRef.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [account?.id]);

  // Debounced save of profile + study log.
  useEffect(() => {
    if (!account || !loadedRef.current) return;
    const t = setTimeout(() => {
      api.updateMe({ ...profile, chapters }).catch((e) => console.error("Save failed:", e));
    }, 700);
    return () => clearTimeout(t);
  }, [profile, chapters, account?.id]);

  useEffect(() => {
    localStorage.setItem("clarify_images", JSON.stringify(generatedImages));
  }, [generatedImages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      stopLiveSession();
    };
  }, []);

  // ---- Conversation management ----
  const openConversation = async (id: string) => {
    setMobileView("chat");
    if (id === activeId) return;
    setActiveId(id);
    setInputText("");
    setAttachments([]);
    try {
      const { messages } = await api.getMessages(id);
      setChatHistory(messages);
    } catch (e) {
      console.error("Could not open conversation:", e);
      setChatHistory([]);
    }
  };

  const handleNewChat = async () => {
    try {
      const { conversation } = await api.createConversation();
      setConversations((prev) => [conversation, ...prev]);
      setActiveId(conversation.id);
      setChatHistory([]);
      setInputText("");
      setAttachments([]);
      setMobileView("chat");
    } catch (e) {
      console.error("Could not start a new chat:", e);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    api.deleteConversation(id).catch(() => {});
    if (activeId === id) {
      if (remaining.length > 0) {
        setActiveId(null); // force openConversation to reload
        openConversation(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Float the active conversation to the top after a new message.
  const bumpConversation = (id: string, patch: Partial<Conversation> = {}) => {
    setConversations((prev) => {
      const item = prev.find((c) => c.id === id);
      if (!item) return prev;
      const updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
      return [updated, ...prev.filter((c) => c.id !== id)];
    });
  };

  // ---- File upload ----
  const handleFilesPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const next = await filesToAttachments(files);
    setAttachments((prev) => [...prev, ...next].slice(0, MAX_ATTACHMENTS));
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const imageFiles = Array.from(e.clipboardData.files || []).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    e.preventDefault();
    const next = await filesToAttachments(imageFiles);
    setAttachments((prev) => [...prev, ...next].slice(0, MAX_ATTACHMENTS));
  };

  const removeAttachment = (idx: number) => setAttachments((prev) => prev.filter((_, i) => i !== idx));

  // ---- Send a message ----
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    const atts = attachments;
    if ((!text && atts.length === 0) || !activeId || isGenerating) return;
    const convId = activeId;
    const isFirstMessage = chatHistory.length === 0;

    setInputText("");
    setAttachments([]);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
      mode: studyMode,
      attachments: atts
    };

    setChatHistory((prev) => [...prev, userMsg]);
    api.addMessage(convId, userMsg).catch(() => {});

    // Name the chat after its first message.
    if (isFirstMessage && text) {
      const title = text.length > 48 ? text.slice(0, 48) + "…" : text;
      bumpConversation(convId, { title, messageCount: 1 });
      api.renameConversation(convId, title).catch(() => {});
    } else {
      bumpConversation(convId);
    }

    setIsGenerating(true);

    try {
      const serverHistory = chatHistory.slice(-10).map((m) => ({ role: m.role, text: m.text }));
      const images = atts.map((a) => ({ data: dataUrlToBase64(a.dataUrl), mimeType: a.mimeType }));

      const data = await api.chat({
        message: text,
        history: serverHistory,
        mode: studyMode,
        board: profile.board,
        grade: profile.grade,
        language: profile.language,
        preferredAnalogy: profile.preferredAnalogy,
        deepVerify,
        images
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
      api.addMessage(convId, modelMsg).catch(() => {});
    } catch (error: any) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `⚠️ **I hit a small hiccup:** ${error.message || "Something went wrong while connecting to Clarify.AI."}\n\nThis often happens when API limits are exceeded. Let's try again in a moment!`,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- TTS ----
  const handleSpeak = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setPlayingMessageId(null);
      return;
    }
    if (audioPlayerRef.current) audioPlayerRef.current.pause();

    const cached = chatHistory.find((m) => m.id === messageId);
    if (cached?.audioBase64) {
      playBase64Audio(cached.audioBase64, messageId);
      return;
    }

    setPlayingMessageId(messageId);
    try {
      const cleanText = text
        .replace(/[*_#`~\[\]()\-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 500);
      const data = await api.tts({ text: cleanText, voice: selectedVoice });
      if (data.audio) {
        setChatHistory((prev) => prev.map((m) => (m.id === messageId ? { ...m, audioBase64: data.audio } : m)));
        playBase64Audio(data.audio, messageId);
      }
    } catch (err) {
      console.error("TTS synthesis failed", err);
      setPlayingMessageId(null);
    }
  };

  const playBase64Audio = (base64: string, messageId: string) => {
    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    audioPlayerRef.current = audio;
    setPlayingMessageId(messageId);
    audio.onended = () => setPlayingMessageId(null);
    audio.onerror = () => setPlayingMessageId(null);
    audio.play().catch((err) => {
      console.error("Audio playback interrupted", err);
      setPlayingMessageId(null);
    });
  };

  // ---- Concept illustrator ----
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const data = await api.generateImage({ prompt: imagePrompt, size: imageSize });
      if (data.imageUrl) {
        setGeneratedImages((prev) => [{ url: data.imageUrl, prompt: imagePrompt }, ...prev]);
        setImagePrompt("");
      }
    } catch (err: any) {
      setImageError(err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // ---- Chapters ----
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
    setChapters((prev) => [newCh, ...prev]);
    setNewChapterName("");
    setIsAddingChapter(false);
    handleSendMessage(`Let's study the new chapter: "${newCh.name}". Can you start with a short diagnostic check to gauge my level?`);
  };

  const handleUpdateMastery = (id: string, newMastery: "weak" | "developing" | "strong") => {
    const score = newMastery === "strong" ? 85 : newMastery === "weak" ? 25 : 50;
    setChapters((prev) => prev.map((ch) => (ch.id === id ? { ...ch, mastery: newMastery, confidenceScore: score } : ch)));
  };

  const handleDeleteChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChapters((prev) => prev.filter((ch) => ch.id !== id));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editProfileForm);
    setIsEditingProfile(false);
  };

  // ---- Live voice ----
  const startLiveSession = async () => {
    try {
      setLiveStatus("Initializing microphone...");
      const playCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      playCtxRef.current = playCtx;
      nextPlayTimeRef.current = playCtx.currentTime;
      liveInterruptedRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const token = getToken();
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/live${token ? `?token=${encodeURIComponent(token)}` : ""}`;

      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;
      setIsLiveActive(true);

      ws.onopen = () => {
        setLiveStatus("Connected. Say hello to Clarify.AI!");
        ws.send(JSON.stringify({ type: "start" }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "ready") {
            setLiveStatus("Clarify.AI is listening to your voice!");
          } else if (msg.type === "audio") {
            if (liveInterruptedRef.current) return;
            playLiveAudioChunk(base64ToFloat32PCM(msg.audio));
          } else if (msg.type === "interrupted") {
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

      const micCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      micCtxRef.current = micCtx;
      const source = micCtx.createMediaStreamSource(stream);
      const processor = micCtx.createScriptProcessor(2048, 1, 1);
      micProcessorRef.current = processor;
      source.connect(processor);
      processor.connect(micCtx.destination);
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const base64PCM = arrayBufferToBase64(float32ToInt16PCM(e.inputBuffer.getChannelData(0)));
          ws.send(JSON.stringify({ audio: base64PCM }));
        }
      };
    } catch (err: any) {
      console.error(err);
      setLiveStatus("Microphone permission denied. Please allow mic access and try again.");
      setIsLiveActive(false);
    }
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    setLiveStatus("Disconnected");
    if (liveWsRef.current) {
      liveWsRef.current.close();
      liveWsRef.current = null;
    }
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }
    if (micCtxRef.current) {
      micCtxRef.current.close();
      micCtxRef.current = null;
    }
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
    const currentTime = playCtx.currentTime;
    let startTime = nextPlayTimeRef.current;
    if (startTime < currentTime) startTime = currentTime + 0.05;
    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;
  };

  const selectSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
    setMobileView("chat");
  };

  const renderMessageContent = (message: ChatMessage) => {
    const sections = parseTeachingSections(message.text);
    if (sections.length > 0) {
      return <NotebookViewer sections={sections} />;
    }
    return <Markdown>{message.text}</Markdown>;
  };

  // --- Gated rendering ---
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

  const MODES: { key: StudyMode; label: string; icon: React.ReactNode }[] = [
    { key: "standard", label: "Standard", icon: <Sparkles size={13} /> },
    { key: "thinking", label: "Thinking", icon: <Brain size={13} /> },
    { key: "search", label: "Search", icon: <Search size={13} /> }
  ];

  return (
    <div className="min-h-[100dvh] bg-editorial-ivory text-editorial-charcoal font-sans flex flex-col antialiased">
      {/* Header */}
      <nav className="flex justify-between items-center px-4 py-3 md:px-8 border-b border-editorial-line bg-editorial-ivory">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-editorial-sage flex items-center justify-center shrink-0">
            <span className="text-editorial-ivory font-serif italic text-lg leading-none">C</span>
          </div>
          <span className="font-serif italic text-xl tracking-tight text-editorial-charcoal">Clarify.AI</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:block text-xs text-editorial-charcoal/50 mr-1">
            {profile.name} · {profile.board}
          </span>
          <button
            onClick={() => {
              setEditProfileForm({ ...profile });
              setIsEditingProfile(true);
            }}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-editorial-line text-xs hover:bg-editorial-stone transition-colors cursor-pointer"
            id="btn-settings-profile"
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Preferences</span>
          </button>
          <button
            onClick={() => logout()}
            title="Sign out"
            aria-label="Sign out"
            className="w-9 h-9 rounded-full border border-editorial-line flex items-center justify-center text-editorial-charcoal/60 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all cursor-pointer shrink-0"
            id="btn-logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      {/* Two-panel workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1500px] w-full mx-auto pb-14 lg:pb-0">

        {/* LEFT: Study panel */}
        <aside className={`${mobileView === "study" ? "flex" : "hidden"} lg:flex w-full lg:w-80 lg:shrink-0 border-r border-editorial-line p-4 md:p-5 flex-col gap-4 bg-editorial-ivory overflow-y-auto`}>

          {/* New chat */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-editorial-charcoal text-white text-sm font-medium hover:bg-editorial-charcoal/90 transition-colors cursor-pointer shadow-sm"
            id="btn-new-chat"
          >
            <Plus size={16} />
            New chat
          </button>

          {/* Profile details */}
          <div className="bg-white border border-editorial-line-light rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-editorial-sage/10 flex items-center justify-center text-editorial-sage shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-editorial-charcoal truncate">{profile.name}</h3>
                <p className="text-xs text-editorial-charcoal/50">{profile.grade} · {profile.language}</p>
              </div>
            </div>
            <p className="text-xs text-editorial-charcoal/70 font-serif italic border-t border-editorial-line-light pt-2.5">
              "{profile.examGoals || "Learn deeply with real analogies"}"
            </p>
          </div>

          {/* Illustrator — just below the profile details */}
          <div className="flex flex-col gap-3 bg-white border border-editorial-line-light p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <ImageIcon size={15} className="text-editorial-sage" />
              <h3 className="text-sm font-semibold text-editorial-charcoal">Illustrator</h3>
            </div>
            <p className="text-xs text-editorial-charcoal/55 leading-relaxed">Describe a diagram and I'll draw it for visual study.</p>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="e.g. Labelled diagram of an animal cell"
              className="w-full min-h-16 px-3 py-2 border border-editorial-line rounded-xl text-xs bg-editorial-ivory/40 focus:outline-none focus:ring-1 focus:ring-editorial-sage resize-none text-editorial-charcoal placeholder-editorial-charcoal/30"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-editorial-stone/40 p-0.5 rounded-full border border-editorial-line-light">
                {(["1K", "2K", "4K"] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setImageSize(sz)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                      imageSize === sz ? "bg-editorial-sage text-white" : "text-editorial-charcoal/40 hover:text-editorial-charcoal"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-white text-xs font-medium transition-all disabled:bg-editorial-stone disabled:text-editorial-charcoal/30 cursor-pointer"
                id="btn-generate-image"
              >
                {isGeneratingImage ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Draw
              </button>
            </div>
            {imageError && (
              <div className="text-red-700 bg-red-50 text-[11px] p-2.5 rounded-lg border border-red-100">{imageError}</div>
            )}
            {generatedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {generatedImages.slice(0, 3).map((img, i) => (
                  <a key={i} href={img.url} download={`clarify-diagram-${i}.png`} title={img.prompt} className="relative group">
                    <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover rounded-lg border border-editorial-line-light" referrerPolicy="no-referrer" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                      <Download size={14} />
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* My Study Log = conversations */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-editorial-sage" />
                <h3 className="text-sm font-semibold text-editorial-charcoal">My Study Log</h3>
              </div>
              <button
                onClick={handleNewChat}
                title="Start a new chat"
                className="w-6 h-6 rounded-full bg-editorial-sage/10 text-editorial-sage hover:bg-editorial-sage/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {conversations.length === 0 && (
                <p className="text-xs text-editorial-charcoal/40 px-1 py-2">No chats yet — start one above.</p>
              )}
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer border transition-all ${
                    activeId === c.id
                      ? "bg-editorial-sage/10 border-editorial-sage/30"
                      : "bg-white border-editorial-line-light hover:border-editorial-sage/30"
                  }`}
                >
                  <MessageSquare size={13} className={activeId === c.id ? "text-editorial-sage shrink-0" : "text-editorial-charcoal/40 shrink-0"} />
                  <span className="flex-1 text-xs text-editorial-charcoal truncate">{c.title || "New chat"}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    title="Delete chat"
                    className="opacity-0 group-hover:opacity-100 text-editorial-charcoal/40 hover:text-red-700 transition-all shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chapter mastery — collapsible, secondary */}
          <div className="flex flex-col gap-2 border-t border-editorial-line pt-3 mt-auto">
            <button
              onClick={() => setShowChapters((v) => !v)}
              className="flex items-center justify-between px-1 cursor-pointer text-editorial-charcoal"
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                {showChapters ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Chapter mastery
              </span>
              <span className="text-[10px] text-editorial-charcoal/40">{chapters.length}</span>
            </button>

            {showChapters && (
              <>
                <button
                  onClick={() => setIsAddingChapter((v) => !v)}
                  className="flex items-center gap-1.5 self-start px-2.5 py-1 text-[11px] text-editorial-sage hover:bg-editorial-sage/10 rounded-full transition-colors cursor-pointer"
                >
                  <Plus size={12} /> Add chapter
                </button>

                {isAddingChapter && (
                  <form onSubmit={handleAddChapter} className="bg-white border border-editorial-line p-3 rounded-xl flex flex-col gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Chapter / topic name…"
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      className="px-3 py-1.5 border border-editorial-line rounded-lg text-xs bg-editorial-ivory/50 focus:outline-none focus:ring-1 focus:ring-editorial-sage placeholder-editorial-charcoal/35"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button type="button" onClick={() => setIsAddingChapter(false)} className="px-2.5 py-1 text-[10px] text-editorial-charcoal/60 hover:bg-editorial-stone rounded">Cancel</button>
                      <button type="submit" className="px-3 py-1 text-[10px] bg-editorial-sage text-white rounded font-medium">Add & study</button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                  {chapters.map((ch) => (
                    <div
                      key={ch.id}
                      onClick={() => selectSuggestedPrompt(`Explain the concept of "${ch.name}". Start with a short diagnostic check to gauge my level.`)}
                      className="group bg-white border border-editorial-line-light p-3 rounded-xl flex flex-col gap-2 hover:border-editorial-sage/40 transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-medium text-editorial-charcoal leading-tight pr-4">{ch.name}</h4>
                        <button onClick={(e) => handleDeleteChapter(ch.id, e)} className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-editorial-charcoal/40 hover:text-red-700 transition-opacity">
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-semibold">
                        {(["weak", "developing", "strong"] as const).map((m) => (
                          <button
                            key={m}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateMastery(ch.id, m);
                            }}
                            className={`px-2 py-0.5 rounded-full transition-colors capitalize ${
                              ch.mastery === m
                                ? m === "weak"
                                  ? "bg-red-50 text-red-800 border border-red-200"
                                  : m === "developing"
                                  ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                                  : "bg-emerald-50/70 text-emerald-800 border border-emerald-200"
                                : "text-editorial-charcoal/40 hover:bg-editorial-stone"
                            }`}
                          >
                            {m === "developing" ? "Dev" : m}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* RIGHT: Chat panel */}
        <main className={`${mobileView === "chat" ? "flex" : "hidden"} lg:flex flex-1 flex-col bg-white/40 p-3 md:p-6 overflow-hidden`}>

          {/* Slim toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex bg-editorial-stone/50 p-1 rounded-full border border-editorial-line-light">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setStudyMode(m.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    studyMode === m.key ? "bg-white text-editorial-charcoal shadow-sm border border-editorial-line" : "text-editorial-charcoal/50 hover:text-editorial-charcoal"
                  }`}
                  id={`mode-${m.key}`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <button
              onClick={() => setDeepVerify((v) => !v)}
              title="Runs a second 'examiner' pass that double-checks facts and calculations. Slower, best for important problems."
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                deepVerify ? "bg-editorial-sage text-white border-editorial-sage" : "bg-white text-editorial-charcoal/60 border-editorial-line hover:bg-editorial-stone"
              }`}
              id="btn-deepverify"
            >
              <CheckCircle2 size={13} />
              Deep-check
            </button>

            <button
              onClick={isLiveActive ? stopLiveSession : startLiveSession}
              title="Talk to Clarify.AI with your voice"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isLiveActive ? "bg-red-800 text-white border-red-800" : "bg-white text-editorial-charcoal/60 border-editorial-line hover:bg-editorial-stone"
              }`}
              id="btn-voice"
            >
              {isLiveActive ? <MicOff size={13} /> : <Mic size={13} />}
              {isLiveActive ? "Stop" : "Voice"}
            </button>
          </div>

          {/* Live status strip */}
          {isLiveActive && (
            <div className="mb-3 flex items-center gap-3 px-4 py-2 rounded-xl bg-editorial-stone/80 border border-editorial-sage/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" />
              <span className="text-xs text-editorial-charcoal/70 flex-1 truncate">{liveStatus}</span>
              <div className="flex items-center gap-0.5">
                {[3, 6, 9, 6, 3].map((val, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ height: [4, val * 2, 4] }}
                    transition={{ duration: 0.9 + idx * 0.1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-0.5 bg-editorial-sage rounded-full"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 bg-[#FAF9F6]/40 border border-editorial-line-light rounded-2xl p-3 md:p-5 overflow-y-auto flex flex-col gap-5 min-h-[280px]">
            {chatHistory.length === 0 && !isGenerating && (
              <div className="m-auto text-center max-w-md flex flex-col items-center gap-4 py-8">
                <div className="w-12 h-12 rounded-full bg-editorial-sage/10 flex items-center justify-center text-editorial-sage">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="font-serif italic text-lg text-editorial-charcoal mb-1">What would you like to learn today?</h2>
                  <p className="text-sm text-editorial-charcoal/55">Ask anything, or upload a photo of a question you're stuck on.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-1">
                  {SUGGESTED_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSuggestedPrompt(q.prompt)}
                      className="text-left px-4 py-2.5 rounded-xl border border-editorial-line bg-white text-xs hover:border-editorial-sage/40 hover:bg-editorial-sage/5 transition-all text-editorial-charcoal/80 cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((message) => (
              <div key={message.id} className={`flex flex-col max-w-[92%] md:max-w-[85%] ${message.role === "user" ? "self-end items-end" : "self-start items-start"}`}>
                <div className="flex items-center gap-2 mb-1 text-[10px] text-editorial-charcoal/40">
                  <span>{message.role === "user" ? "You" : "Clarify.AI"}</span>
                  <span>·</span>
                  <span>{message.timestamp}</span>
                </div>

                <div
                  className={`p-4 md:p-5 relative shadow-sm border ${
                    message.role === "user"
                      ? "bg-editorial-stone border-editorial-line rounded-2xl rounded-tr-sm text-editorial-charcoal text-sm md:text-base"
                      : "bg-white border-editorial-line-light rounded-2xl rounded-tl-sm text-editorial-charcoal text-sm md:text-base leading-relaxed"
                  }`}
                  id={`msg-bubble-${message.id}`}
                >
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {message.attachments.map((att, i) =>
                        att.isImage ? (
                          <img key={i} src={att.dataUrl} alt={att.name} className="max-h-44 rounded-xl border border-editorial-line-light object-cover" />
                        ) : (
                          <a
                            key={i}
                            href={att.dataUrl}
                            download={att.name}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-editorial-line-light text-xs text-editorial-charcoal hover:bg-editorial-stone"
                          >
                            <FileText size={14} className="text-editorial-sage" />
                            <span className="truncate max-w-40">{att.name}</span>
                          </a>
                        )
                      )}
                    </div>
                  )}

                  {message.text && renderMessageContent(message)}

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-editorial-line-light flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] text-editorial-charcoal/50 flex items-center gap-1">
                        <Search size={10} className="text-editorial-sage" /> Sources:
                      </span>
                      {message.sources.map((src, sIdx) => (
                        <a key={sIdx} href={src.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-[#FAF9F6] text-editorial-sage px-2.5 py-1 rounded-full border border-editorial-line-light flex items-center gap-1 hover:bg-editorial-sage/10">
                          {src.title}
                          <ExternalLink size={8} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Listen */}
                  {message.role === "model" && message.text && (
                    <div className="mt-3 flex justify-end border-t border-editorial-line-light pt-2.5">
                      <button
                        onClick={() => handleSpeak(message.id, message.text)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                          playingMessageId === message.id ? "bg-editorial-sage text-white" : "bg-editorial-stone hover:bg-editorial-sage/10 text-editorial-sage border border-editorial-line-light"
                        }`}
                        id={`btn-tts-${message.id}`}
                      >
                        {playingMessageId === message.id ? <><VolumeX size={12} /> Mute</> : <><Volume2 size={12} /> Listen</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="self-start max-w-[85%] flex flex-col items-start">
                <div className="text-[10px] text-editorial-charcoal/40 mb-1">Clarify.AI is thinking…</div>
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-editorial-line rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-editorial-sage/40 animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-2 h-2 rounded-full bg-editorial-sage/70 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 rounded-full bg-editorial-sage animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Attachment preview */}
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div key={i} className="relative group">
                  {att.isImage ? (
                    <img src={att.dataUrl} alt={att.name} className="h-16 w-16 object-cover rounded-lg border border-editorial-line" />
                  ) : (
                    <div className="h-16 w-16 flex flex-col items-center justify-center gap-1 rounded-lg border border-editorial-line bg-white text-editorial-sage px-1">
                      <FileText size={18} />
                      <span className="text-[8px] text-editorial-charcoal/60 truncate w-full text-center">{att.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-editorial-charcoal text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                    title="Remove"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="mt-3 bg-white border border-editorial-line rounded-2xl p-2 flex items-center gap-1.5 shadow-sm focus-within:border-editorial-sage focus-within:ring-1 focus-within:ring-editorial-sage/30 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFilesPicked}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating || attachments.length >= MAX_ATTACHMENTS}
              title="Upload an image or file"
              className="w-10 h-10 flex items-center justify-center rounded-full text-editorial-charcoal/50 hover:bg-editorial-stone hover:text-editorial-sage transition-colors shrink-0 disabled:opacity-30 cursor-pointer"
              id="btn-upload"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              onPaste={handlePaste}
              placeholder="Ask anything, or paste / upload a photo of a question…"
              className="flex-1 px-2 py-2 bg-transparent text-editorial-charcoal focus:outline-none text-sm md:text-base placeholder-editorial-charcoal/30"
              disabled={isGenerating}
              id="input-chat"
            />
            <button
              onClick={() => handleSendMessage()}
              className="w-10 h-10 bg-editorial-sage hover:bg-editorial-sage/90 text-white rounded-full flex items-center justify-center transition-colors shrink-0 disabled:bg-editorial-stone disabled:text-editorial-charcoal/30 cursor-pointer"
              disabled={isGenerating || (!inputText.trim() && attachments.length === 0)}
              id="btn-send-chat"
            >
              <Send size={16} />
            </button>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — 2 tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch border-t border-editorial-line bg-editorial-ivory/95 backdrop-blur-sm">
        {([
          { k: "study", label: "Study Log", icon: <MessageSquare size={18} /> },
          { k: "chat", label: "Chat", icon: <Sparkles size={18} /> }
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setMobileView(t.k)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              mobileView === t.k ? "text-editorial-sage" : "text-editorial-charcoal/40 hover:text-editorial-charcoal"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      {/* Preferences modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 bg-[#1e1e1a]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-editorial-ivory border border-editorial-line w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-editorial-sage" />
                  <h3 className="text-base font-serif font-medium text-editorial-charcoal">Study Preferences</h3>
                </div>
                <button onClick={() => setIsEditingProfile(false)} className="text-editorial-charcoal/40 hover:text-editorial-charcoal text-2xl cursor-pointer leading-none">&times;</button>
              </div>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-editorial-charcoal/70">My name</label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                    className="px-4 py-2.5 border border-editorial-line rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-editorial-sage text-editorial-charcoal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-editorial-charcoal/70">Board / Exam</label>
                    <select value={editProfileForm.board} onChange={(e) => setEditProfileForm({ ...editProfileForm, board: e.target.value })} className="px-4 py-2.5 border border-editorial-line rounded-xl text-sm bg-white focus:outline-none text-editorial-charcoal">
                      <option value="None">General Study</option>
                      <option value="CBSE">CBSE Board</option>
                      <option value="ICSE">ICSE Board</option>
                      <option value="State Board">State Board</option>
                      <option value="JEE">JEE Prep</option>
                      <option value="NEET">NEET Prep</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-editorial-charcoal/70">Grade / Level</label>
                    <input type="text" value={editProfileForm.grade} onChange={(e) => setEditProfileForm({ ...editProfileForm, grade: e.target.value })} className="px-4 py-2.5 border border-editorial-line rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-editorial-sage text-editorial-charcoal" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-editorial-charcoal/70">Language</label>
                    <select value={editProfileForm.language} onChange={(e) => setEditProfileForm({ ...editProfileForm, language: e.target.value })} className="px-4 py-2.5 border border-editorial-line rounded-xl text-sm bg-white focus:outline-none text-editorial-charcoal">
                      <option value="English">Pure English</option>
                      <option value="Hinglish">Hinglish (Hindi + English)</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-editorial-charcoal/70">Preferred analogy</label>
                    <select value={editProfileForm.preferredAnalogy} onChange={(e) => setEditProfileForm({ ...editProfileForm, preferredAnalogy: e.target.value })} className="px-4 py-2.5 border border-editorial-line rounded-xl text-sm bg-white focus:outline-none text-editorial-charcoal">
                      <option value="Daily Life">Daily Life / Everyday objects</option>
                      <option value="Sports">Sports / Cricket / Football</option>
                      <option value="Cooking">Cooking & Kitchen recipes</option>
                      <option value="Bicycles & Trains">Bicycles, Trains & Transportation</option>
                      <option value="Mobile Phones & Tech">Mobile Phones, Games & Apps</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-editorial-charcoal/70">Voice (for spoken answers)</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(["Kore", "Zephyr", "Puck", "Charon", "Fenrir"] as const).map((vc) => (
                      <button key={vc} type="button" onClick={() => setSelectedVoice(vc)} className={`py-2 px-1 rounded-full text-[11px] font-medium text-center border transition-colors cursor-pointer ${selectedVoice === vc ? "bg-editorial-sage border-editorial-sage text-white" : "bg-white border-editorial-line-light hover:bg-editorial-stone text-editorial-charcoal"}`}>
                        {vc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-editorial-charcoal/70">Exam goals</label>
                  <textarea rows={2} value={editProfileForm.examGoals} onChange={(e) => setEditProfileForm({ ...editProfileForm, examGoals: e.target.value })} className="px-4 py-3 border border-editorial-line rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-editorial-sage resize-none text-editorial-charcoal" />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 border border-editorial-line text-editorial-charcoal hover:bg-editorial-stone rounded-full text-sm transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-editorial-charcoal hover:bg-editorial-charcoal/90 text-white rounded-full text-sm transition-colors cursor-pointer">Save changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Visual notebook: parses structured teacher responses into tabbed sections.
interface NotebookViewerProps {
  sections: NotebookSection[];
}

function NotebookViewer({ sections }: NotebookViewerProps) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  return (
    <div className="flex flex-col gap-4 max-w-full my-1">
      <div className="bg-editorial-stone border border-editorial-line-light p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-editorial-sage shrink-0" />
          <span className="text-xs font-semibold text-editorial-charcoal">Study Notebook</span>
        </div>
        <span className="text-[10px] text-white font-medium bg-editorial-sage px-2.5 py-0.5 rounded-full">{sections.length} parts</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch min-h-[240px] max-w-full">
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto pb-1.5 md:pb-0 shrink-0 md:w-44 border-b md:border-b-0 md:border-r border-editorial-line-light pr-0 md:pr-3 scrollbar-none">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTabIdx(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-left text-xs font-medium transition-all shrink-0 md:w-full border cursor-pointer ${
                activeTabIdx === idx ? "bg-editorial-sage text-white border-editorial-sage" : "bg-white text-editorial-charcoal/60 hover:text-editorial-charcoal hover:bg-editorial-stone/50 border-editorial-line-light"
              }`}
            >
              <span className="text-sm shrink-0">{sec.emoji}</span>
              <span className="truncate">{sec.title}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-editorial-line rounded-2xl p-4 md:p-5 flex flex-col gap-2 min-w-0 max-w-full relative overflow-y-auto">
          {sections[activeTabIdx] && (
            <motion.div key={activeTabIdx} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-3 border-b border-editorial-line-light mb-3">
                  <span className="text-xl">{sections[activeTabIdx].emoji}</span>
                  <h4 className="text-sm font-serif font-bold text-editorial-charcoal">{sections[activeTabIdx].title}</h4>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <Markdown>{sections[activeTabIdx].content}</Markdown>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-editorial-line-light flex items-center justify-between text-[10px] text-editorial-charcoal/40">
                <span>Part {activeTabIdx + 1} of {sections.length}</span>
                <div className="flex gap-1.5">
                  <button disabled={activeTabIdx === 0} onClick={() => setActiveTabIdx((p) => p - 1)} className="px-3 py-1 rounded-full bg-editorial-stone hover:bg-editorial-sage/10 text-editorial-charcoal hover:text-editorial-sage border border-editorial-line-light text-[11px] disabled:opacity-30 cursor-pointer transition-colors">Prev</button>
                  <button disabled={activeTabIdx === sections.length - 1} onClick={() => setActiveTabIdx((p) => p + 1)} className="px-3 py-1 rounded-full bg-editorial-stone hover:bg-editorial-sage/10 text-editorial-charcoal hover:text-editorial-sage border border-editorial-line-light text-[11px] disabled:opacity-30 cursor-pointer transition-colors">Next</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
