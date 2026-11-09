# Resume tailoring suggestions

## What it does
When a resume and a job posting are both added, a new "Tailor my resume" card appears on the start page (next to the fit briefing). One click gives:

- **Match score** (1-10) for how well the resume reads against the posting right now.
- **Missing keywords**: important terms from the posting the resume doesn't use, each marked "you have this — say it" or "genuine gap".
- **Bullet rewrites**: 3-6 existing resume bullets shown before/after, reworded to match the posting's language. Each says why it's stronger.
- **Reorder advice**: which role, project, or skill to move up front.
- **Summary rewrite**: a new top-of-resume summary aimed at this job.
- **Cut or shrink**: items that take space without helping for this role.
- **Copy buttons** on each rewrite, plus "Copy all".

In promotion mode, the same card frames advice for an internal promotion packet instead.

## Honesty rules
The coach only rewords what's already on the resume. It never invents numbers, titles, or experience. Where a number would help, it writes a placeholder like "[add % improvement]" for the user to fill in.

## Privacy
Nothing is stored on our servers. Results are kept for the browser session, like the fit briefing, and refresh automatically if the resume or posting changes.

## Technical details
- New `src/lib/resume-tailor.ts`: zod input (jobBrief, resume, optional promotion) and output schema, plus system prompt.
- Add `generateResumeTailoring` to the shared `prep.server.ts` / `prep.functions.ts` module (reuses `runStructured`, so error handling stays consistent).
- Note: the parsed resume only keeps 2-4 roles and short highlights. To rewrite real bullets accurately, also keep the raw resume text in session storage when it is uploaded/pasted (`resume-context.tsx`, `ResumeUpload.tsx`) and send it along (capped at 40k chars). File uploads are re-read as text during parsing by returning a `rawText` field.
- New `src/components/interview/ResumeTailoring.tsx`, cached per session using the existing `briefingSignature` hash.
- Add the card to `src/routes/index.tsx`, shown only when both resume and posting exist.
- Update the user guide afterwards if wanted.

## Out of scope
Exporting a finished, formatted resume file (Word/PDF). Could be a follow-up.
