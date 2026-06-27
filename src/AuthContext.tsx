/**
 * Auth context backed by the Express + JWT backend.
 * Holds the signed-in account (profile + study log), restores the session from
 * a stored token on load, and exposes login / signup / logout.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, type Account, type SignupInput } from "./api";

interface AuthContextValue {
  account: Account | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  setAccount: (a: Account) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(getToken()));

  // Restore session from a stored token.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setAccount(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setAccount(user);
  };

  const signup = async (input: SignupInput) => {
    const { token, user } = await api.signup(input);
    setToken(token);
    setAccount(user);
  };

  const logout = () => {
    setToken(null);
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ account, loading, login, signup, logout, setAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
