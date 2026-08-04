import { Briefcase, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useJobBrief } from "@/lib/job-brief-context";

export function JobBriefChip() {
  const { brief, setBrief } = useJobBrief();
  if (!brief) return null;

  return (
    <div className="flex items-center gap-2 rounded-full bg-warm px-3 py-1.5 text-xs text-warm-foreground">
      <Briefcase className="size-3.5" aria-hidden />
      <span className="max-w-[16rem] truncate">
        Coaching for {brief.title} at {brief.company}
      </span>
      <Link to="/" className="underline underline-offset-2">
        change
      </Link>
      <button
        type="button"
        onClick={() => setBrief(null)}
        aria-label="Clear the job posting"
        className="rounded-full p-0.5 hover:bg-card"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
