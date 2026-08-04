import { Link } from "@tanstack/react-router";
import { JobBriefChip } from "@/components/interview/JobBriefChip";
import { ResumeChip } from "@/components/interview/ResumeChip";

type Props = {
  answered: number;
  total: number | null;
  averageScore: number | null;
};

export function SessionProgress({ answered, total, averageScore }: Props) {
  const progressText = total
    ? `${answered} / ${total} answered${averageScore !== null ? ` · avg ${averageScore.toFixed(1)}/10` : ""}`
    : `${answered} answered${averageScore !== null ? ` · avg ${averageScore.toFixed(1)}/10` : ""}`;

  return (
    <header className="border-b border-border bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
        <Link to="/" className="font-display text-lg font-semibold text-foreground">
          Mock Interview Coach
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <JobBriefChip />
          <ResumeChip />
        </div>
        <p className="text-sm text-muted-foreground">{progressText}</p>
      </div>
    </header>
  );
}
