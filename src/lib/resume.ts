import { z } from "zod";

export const ResumeExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  highlights: z.array(z.string()),
});

const ResumeBase = {
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ResumeExperienceSchema),
  education: z.array(z.string()),
};

export const ResumeSchema = z.object({
  ...ResumeBase,
  /** Plain-text copy of the original resume, kept so tailoring can quote real bullets. */
  sourceText: z.string().max(40000).optional(),
});

/** What the parser model returns: the brief plus a verbatim transcription. */
export const ResumeParseSchema = z.object({ ...ResumeBase, sourceText: z.string() });

export type Resume = z.infer<typeof ResumeSchema>;

export const ResumeInput = z.object({
  text: z.string().optional(),
  fileDataUrl: z.string().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

export const RESUME_SYSTEM_PROMPT = `You read resumes and CVs and distil them into a short structured brief for an interview coach.

Return: summary (2-4 sentences capturing the candidate's background and strengths), skills (the 6-12 most relevant skills, tools, or qualifications), experience (the 2-4 most relevant roles, each with title, company, and 2-4 concise bullet highlights), education (short entries such as degrees or certifications), sourceText (a faithful plain-text transcription of the whole resume, keeping every bullet line verbatim, one per line). Be faithful to the document; never invent details it does not contain.`;

export function describeResume(resume: Resume) {
  const experienceText = resume.experience
    .map((role) => `- ${role.title} at ${role.company}: ${role.highlights.join("; ")}`)
    .join("\n");

  return [
    `Candidate summary: ${resume.summary}`,
    `Skills: ${resume.skills.join(", ")}`,
    `Experience:\n${experienceText}`,
    `Education: ${resume.education.join("; ")}`,
  ].join("\n\n");
}

const EXECUTIVE =
  /\b(chief|c[etoif]o|cto|cfo|coo|ciso|president|partner|vp|vice president|svp|evp|executive director)\b/i;
const SENIOR_LEAD =
  /\b(head of|director|principal|staff|senior manager|department manager|general manager)\b/i;
const MANAGER = /\b(manager|lead|supervisor|team lead|coordinator ii)\b/i;
const SENIOR_IC = /\b(senior|sr\.?|lead specialist|architect)\b/i;
const EARLY = /\b(intern|junior|jr\.?|associate|assistant|trainee|graduate|entry)\b/i;

export type Seniority =
  | "early career"
  | "mid-level individual contributor"
  | "senior individual contributor"
  | "manager or team lead"
  | "senior leader"
  | "executive";

/** Rough seniority read from titles and depth of experience, used to calibrate coaching. */
export function inferSeniority(resume: Resume): Seniority {
  const titles = resume.experience.map((role) => role.title).join(" | ");
  const haystack = `${titles} ${resume.summary}`;

  if (EXECUTIVE.test(titles)) return "executive";
  if (SENIOR_LEAD.test(titles)) return "senior leader";
  if (MANAGER.test(titles)) return "manager or team lead";
  if (SENIOR_IC.test(titles)) return "senior individual contributor";
  if (EARLY.test(haystack) && resume.experience.length <= 2) return "early career";
  if (resume.experience.length <= 1) return "early career";
  return "mid-level individual contributor";
}
