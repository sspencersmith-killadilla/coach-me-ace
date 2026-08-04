import { FileUser, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useResume } from "@/lib/resume-context";

export function ResumeChip() {
  const { resume, setResume } = useResume();
  if (!resume) return null;

  const latestRole = resume.experience[0];
  const label = latestRole
    ? `${latestRole.title} at ${latestRole.company}`
    : resume.summary.slice(0, 40);

  return (
    <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">
      <FileUser className="size-3.5" aria-hidden />
      <span className="max-w-[16rem] truncate">Using resume: {label}</span>
      <Link to="/" className="underline underline-offset-2">
        change
      </Link>
      <button
        type="button"
        onClick={() => setResume(null)}
        aria-label="Clear the resume"
        className="rounded-full p-0.5 hover:bg-card"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
