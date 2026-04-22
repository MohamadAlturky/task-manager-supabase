import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const schema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(40, "Keep it under 40 characters.")
      .regex(/^[A-Za-z0-9_.-]+$/, "Use letters, numbers, _ . - only."),
    password: z.string().min(6, "Password must be at least 6 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ username, password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const res = await register(parsed.data.username, parsed.data.password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || "Could not register.");
      return;
    }
    toast.success("Your volume is open.");
    navigate("/", { replace: true });
  }

  return (
    <AuthLayout
      subtitle="Create an account"
      title="Begin a new volume"
      footer={
        <>
          Already keeping records?{" "}
          <Link to="/login" className="text-foreground font-medium ink-underline hover:text-accent transition-colors">
            Sign in
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
          <p className="text-[11px] text-muted-foreground">3–40 characters · letters, numbers, _ . -</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Repeat your password"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full" size="lg">
          {submitting ? "Inscribing…" : "Create account"}
        </Button>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Donut is a single-user, local app. Your data is stored only in this browser.
        </p>
      </form>
    </AuthLayout>
  );
}