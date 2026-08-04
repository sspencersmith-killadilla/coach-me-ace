import { z } from "zod";

export const JobBriefSchema = z.object({
  title: z.string(),
  company: z.string(),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
  tone: z.string(),
});

export type JobBrief = z.infer<typeof JobBriefSchema>;

export const JobBriefInput = z.object({
  text: z.string().optional(),
  fileDataUrl: z.string().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

export const JOB_BRIEF_SYSTEM_PROMPT = `You read job postings, recruitment brochures, and role descriptions, and distil them into a short brief for an interview coach.

Return: title (the role title, or "the role" if unclear), company (the hiring organisation, or "the company" if unclear), responsibilities (the 3-6 most important day-to-day responsibilities, each a short phrase), skills (the 4-8 must-have skills, qualities or qualifications, each a short phrase), tone (one sentence describing the voice and culture the posting projects). Be faithful to the document; never invent details it does not contain.`;

export function describeJobBrief(brief: JobBrief) {
  return [
    `Role: ${brief.title}`,
    `Company: ${brief.company}`,
    `Key responsibilities: ${brief.responsibilities.join("; ")}`,
    `Must-have skills: ${brief.skills.join("; ")}`,
    `Tone of the posting: ${brief.tone}`,
  ].join("\n");
}
