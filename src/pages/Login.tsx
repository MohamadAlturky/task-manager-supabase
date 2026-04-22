import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const schema = z.object({
  username: z.string().trim().min(1, "Enter your username").max(40),
  password: z.string().min(1, "Enter your password").max(200),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ username, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const res = await login(parsed.data.username, parsed.data.password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || "Could not sign in.");
      return;
    }
    toast.success("Welcome back.");
    navigate("/", { replace: true });
  }

  return (
    <AuthLayout
      subtitle="Sign in"
      title="Open the ledger"
      footer={
        <>
          New to Chronicle?{" "}
          <Link to="/register" className="text-foreground font-medium ink-underline hover:text-accent transition-colors">
            Begin a new volume
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="your.handle"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full" size="lg">
          {submitting ? "Opening…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
