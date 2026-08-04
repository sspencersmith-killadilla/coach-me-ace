import { Link } from "@tanstack/react-router";

type Props = {
  answered: number;
  averageScore: number | null;
};

export function SessionProgress({ answered, averageScore }: Props) {
  return (
    <header className="border-b border-border bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="font-display text-lg font-semibold text-foreground">
          Mock Interview Coach
        </Link>
        <p className="text-sm text-muted-foreground">
          {answered === 0
            ? "Session just started"
            : `${answered} answered${averageScore !== null ? ` · avg ${averageScore.toFixed(1)}/10` : ""}`}
        </p>
      </div>
    </header>
  );
}
