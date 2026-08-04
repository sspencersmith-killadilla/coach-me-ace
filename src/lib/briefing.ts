import { z } from "zod";
import { JobBriefSchema } from "./job-brief";
import { ResumeSchema } from "./resume";

export const BriefingInput = z.object({
  jobBrief: JobBriefSchema,
  resume: ResumeSchema,
});

export const BriefingSchema = z.object({
  fitScore: z.number(),
  fitSummary: z.string(),
  strengths: z.array(z.object({ point: z.string(), evidence: z.string() })),
  watchOuts: z.array(z.object({ gap: z.string(), howToHandle: z.string() })),
  likelyQuestions: z.array(z.object({ question: z.string(), whatItTests: z.string() })),
  toneAdvice: z.string(),
});

export type PreInterviewBriefing = z.infer<typeof BriefingSchema>;

export const BRIEFING_SYSTEM_PROMPT = `You are a candid, supportive interview coach. You have a candidate's resume and the job posting they're preparing for. Write a short pre-interview briefing that helps them walk in knowing how they fit and where they'll be pressed.

Return:
- fitScore: an honest integer 1-10 for how well this background matches this posting.
- fitSummary: one paragraph (3-5 sentences) on how the candidate fits — genuine, specific, and honest about the stretch.
- strengths: exactly 3 items. point = a must-have from the posting they clearly meet; evidence = the specific role, project or detail from the resume they should cite for it.
- watchOuts: 2-4 items. gap = a genuine gap or thin spot a panel will probe; howToHandle = one honest, non-defensive way to answer it (never advise inventing experience).
- likelyQuestions: 3-5 questions this specific pairing invites, each with whatItTests — one line on what the interviewer is really checking.
- toneAdvice: one or two sentences on the culture and voice the posting projects, and how the candidate should pitch themselves against it.

Be faithful to both documents. Never invent experience the resume does not contain.`;
