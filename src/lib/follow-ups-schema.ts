import { z } from "zod";
import { JobBriefSchema } from "./job-brief";
import { PromotionSchema } from "./promotion";
import { ResumeSchema } from "./resume";

export const FollowUpsInput = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  jobBrief: JobBriefSchema.optional(),
  resume: ResumeSchema.optional(),
  promotion: PromotionSchema.optional(),
});

export const FollowUpsSchema = z.object({
  followUps: z.array(
    z.object({
      question: z.string(),
      intent: z.string(),
    }),
  ),
});

export type FollowUps = z.infer<typeof FollowUpsSchema>;

export const FOLLOW_UPS_SYSTEM_PROMPT = `You are a supportive, expert career coach helping the user practice live interview dynamics.

Given the original interview question, the candidate's answer, and any background about the role, their resume, and (if provided) an internal promotion context, generate 2–3 natural follow-up questions a real interviewer might ask next. The questions should feel conversational and specific — not generic. Draw from details in the candidate's answer, the role's responsibilities, the industry, the resume, and the promotion context (current role, target role, company context, promotion packet).

For each follow-up, also include a one-sentence "intent" explaining what the interviewer is really probing for (e.g., "They want to see how you handle ambiguity" or "They're checking whether you can scale this approach").

Return: followUps (an array of 2–3 objects, each with question and intent). Keep questions concise — one sentence each.`;
