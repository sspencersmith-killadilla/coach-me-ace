import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ToolPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground print:hidden"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to start
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground print:hidden">{intro}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function useCoachContext() {
  return null;
}
