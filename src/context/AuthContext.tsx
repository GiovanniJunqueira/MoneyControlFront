import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";
import { AuthResponse, User } from "../api/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: { betsEnabled: boolean }) => Promise<void>;
  updateWhatsAppPhone: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("financeiro_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("financeiro_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    localStorage.setItem("financeiro_token", res.data.token);
    setUser(res.data.user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
    localStorage.setItem("financeiro_token", res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem("financeiro_token");
    setUser(null);
  }

  async function updateSettings(settings: { betsEnabled: boolean }) {
    const res = await api.put<User>("/auth/settings", settings);
    setUser(res.data);
  }

  async function updateWhatsAppPhone(phone: string) {
    const res = await api.put<User>("/auth/whatsapp", { phone });
    setUser(res.data);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateSettings, updateWhatsAppPhone }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de um AuthProvider");
  return ctx;
}
