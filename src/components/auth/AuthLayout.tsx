import { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-dvh paper-texture flex">
      {/* Left: brand panel */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-leather text-vellum">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,_white,_transparent_60%)]" />
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-sm bg-vellum/10 border border-vellum/20 grid place-items-center">
              <span className="font-serif text-xl text-vellum italic">C</span>
            </div>
            <span className="font-serif text-2xl italic tracking-tight">Donut</span>
          </div>

          <div className="space-y-6 max-w-md">
            <p className="text-xs uppercase tracking-[0.3em] text-vellum/50">Volume IV — MMXXVI</p>
            <h1 className="font-serif text-5xl xl:text-6xl leading-[1.05] italic">
              A quiet ledger<br />for a deliberate day.
            </h1>
            <p className="text-vellum/60 leading-relaxed max-w-sm">
              Capture intentions in the margin. Move them onto the page when the moment is right. Let
              the day write itself.
            </p>
          </div>

          <div className="font-serif italic text-vellum/40 text-sm">
            “The true work is not the task itself, but the intention behind the ink.”
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <div className="size-9 rounded-sm bg-leather grid place-items-center">
              <span className="font-serif text-xl text-vellum italic">C</span>
            </div>
            <span className="font-serif text-2xl italic">Donut</span>
          </div>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              {subtitle}
            </p>
            <h2 className="font-serif text-4xl italic leading-tight">{title}</h2>
          </div>

          {children}

          <div className="mt-8 text-sm text-muted-foreground">{footer}</div>

          <p className="mt-12 text-[11px] text-muted-foreground/70">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← Return to the cover
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
