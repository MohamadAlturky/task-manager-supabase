import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { sha256 } from "@/lib/hash";
import type { StoredUser } from "@/types";

const USERS_KEY = "chronicle.users";
const SESSION_KEY = "chronicle.session";

interface AuthContextValue {
  user: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async register(username, password) {
        const u = username.trim().toLowerCase();
        if (u.length < 3) return { ok: false, error: "Username must be at least 3 characters." };
        if (!/^[a-z0-9_.-]+$/.test(u))
          return { ok: false, error: "Use letters, numbers, _ . - only." };
        if (password.length < 6)
          return { ok: false, error: "Password must be at least 6 characters." };
        const users = readUsers();
        if (users[u]) return { ok: false, error: "That username is already taken." };
        users[u] = {
          username: u,
          passwordHash: await sha256(password),
          createdAt: new Date().toISOString(),
        };
        writeUsers(users);
        localStorage.setItem(SESSION_KEY, u);
        setUser(u);
        return { ok: true };
      },
      async login(username, password) {
        const u = username.trim().toLowerCase();
        const users = readUsers();
        const record = users[u];
        if (!record) return { ok: false, error: "No such account. Try registering." };
        const hash = await sha256(password);
        if (hash !== record.passwordHash)
          return { ok: false, error: "Incorrect password." };
        localStorage.setItem(SESSION_KEY, u);
        setUser(u);
        return { ok: true };
      },
      logout() {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
