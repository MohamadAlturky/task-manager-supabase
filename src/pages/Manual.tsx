import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// man
export default function Manual() {
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
        <h1 className="font-serif text-3xl sm:text-4xl italic text-foreground">How to work with the app</h1>
        <p className="mt-2 text-sm text-muted-foreground">A short manual for the Donut ledger.</p>

        <ol className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed list-decimal pl-5 marker:text-foreground/50">
          <li>
            <span className="text-foreground font-medium">Sign in.</span> Use the account you created at
            registration. You will land on the <span className="italic">Daily Record</span> for today.
          </li>
          <li>
            <span className="text-foreground font-medium">The Current Passage.</span> This is your list for
            today. Add a task with <span className="whitespace-nowrap">“New entry”</span> or the empty-state
            button. Mark a task done when you finish; you can move it to the backlog if it belongs there
            instead, or remove it. Priority order is respected in the list.
          </li>
          <li>
            <span className="text-foreground font-medium">The backlog (Unwritten intentions).</span> On a wide
            screen, the left column holds tasks you have not brought into today yet. Add with “Capture an
            intention” or from new-task as backlog. When you are ready, move a card into today. On a narrow
            screen, scroll the daily view: backlog appears above your today list so you always have access.
          </li>
          <li>
            <span className="text-foreground font-medium">Task details.</span> Open a task to add steps,
            edit the title, or go deeper. Use the back control to return to the main ledger.
          </li>
          <li>
            <span className="text-foreground font-medium">Annotated history.</span> A running log of creates,
            completions, and moves appears beside the list on very wide screens, or below your lists on
            phone. You can clear the log when you want a fresh page.
          </li>
          <li>
            <span className="text-foreground font-medium">Archived tasks.</span> Choose <span className="italic">Archived Tasks</span> in the
            sidebar to see items you have archived. You can unarchive from there if you need them back in play.
          </li>
          <li>
            <span className="text-foreground font-medium">Sign out.</span> Use <span className="italic">Close the volume</span> in
            the sidebar to leave the session.
          </li>
        </ol>
      </main>
    </div>
  );
}
