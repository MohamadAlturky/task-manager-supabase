import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  user: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount using the stored refresh token.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user?.user_metadata?.username ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user?.user_metadata?.username ?? null);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,

      async register(username, password) {
        const u = username.trim().toLowerCase();
        if (u.length < 3)
          return { ok: false, error: "Username must be at least 3 characters." };
        if (!/^[a-z0-9_.-]+$/.test(u))
          return { ok: false, error: "Use letters, numbers, _ . - only." };
        if (password.length < 6)
          return { ok: false, error: "Password must be at least 6 characters." };

        const { error } = await supabase.auth.signUp({
          email: `${u}@masaj.app`,
          password,
          options: { data: { username: u } },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered"))
            return { ok: false, error: "That username is already taken." };
          return { ok: false, error: error.message };
        }

        return { ok: true };
      },

      async login(username, password) {
        const u = username.trim().toLowerCase();

        const { data: email, error: rpcError } = await supabase
          .rpc("get_email_by_username", { p_username: u });

        if (rpcError)
          return { ok: false, error: "Could not reach the server. Try again." };
        if (!email)
          return { ok: false, error: "No such account. Try registering." };

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials"))
            return { ok: false, error: "Incorrect password." };
          return { ok: false, error: error.message };
        }

        return { ok: true };
      },

      logout() {
        supabase.auth.signOut();
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
