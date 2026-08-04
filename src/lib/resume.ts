import { z } from "zod";

export const ResumeExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  highlights: z.array(z.string()),
});

export const ResumeSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ResumeExperienceSchema),
  education: z.array(z.string()),
});

export type Resume = z.infer<typeof ResumeSchema>;

export const ResumeInput = z.object({
  text: z.string().optional(),
  fileDataUrl: z.string().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

export const RESUME_SYSTEM_PROMPT = `You read resumes and CVs and distil them into a short structured brief for an interview coach.

Return: summary (2-4 sentences capturing the candidate's background and strengths), skills (the 6-12 most relevant skills, tools, or qualifications), experience (the 2-4 most relevant roles, each with title, company, and 2-4 concise bullet highlights), education (short entries such as degrees or certifications). Be faithful to the document; never invent details it does not contain.`;

export function describeResume(resume: Resume) {
  const experienceText = resume.experience
    .map(
      (role) =>
        `- ${role.title} at ${role.company}: ${role.highlights.join("; ")}`,
    )
    .join("\n");

  return [
    `Candidate summary: ${resume.summary}`,
    `Skills: ${resume.skills.join(", ")}`,
    `Experience:\n${experienceText}`,
    `Education: ${resume.education.join("; ")}`,
  ].join("\n\n");
}
