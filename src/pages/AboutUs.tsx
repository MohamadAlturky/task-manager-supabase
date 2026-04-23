import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-dvh bg-background paper-texture flex flex-col">
      <header className="border-b border-border bg-background/70 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 h-16 flex items-center">
          <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="size-4" />
              The ledger
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14">
        <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground">About us</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          <span className="font-serif italic text-foreground/90">Donut</span> is a small, deliberate space for
          the tasks that matter today — a daily record you can hold in one glance, with room to set aside what
          can wait and to revisit what you have archived. We built it for people who like paper, margins, and
          quiet focus more than noise.
        </p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Your list stays yours: sign in, work through the day, and leave a trace in the log only when
          you act. If something helps you feel steadier, we are glad to share the volume with you.
        </p>
      </main>
    </div>
  );
}
