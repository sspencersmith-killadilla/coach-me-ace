import { z } from "zod";
import { JobBriefSchema } from "./job-brief";
import { PromotionSchema } from "./promotion";
import { ResumeSchema } from "./resume";

const Context = {
  jobBrief: JobBriefSchema.optional(),
  resume: ResumeSchema.optional(),
  promotion: PromotionSchema.optional(),
};

/* ---------- Questions to ask them ---------- */

export const AskQuestionsInput = z.object({
  ...Context,
  /** Questions the candidate drafted; when present they get graded. */
  drafts: z.array(z.string().max(500)).max(10).optional(),
});

export const AskQuestionsSchema = z.object({
  suggestions: z.array(z.object({ question: z.string(), whyItLands: z.string() })),
  graded: z.array(
    z.object({
      question: z.string(),
      score: z.number(),
      verdict: z.string(),
      sharperVersion: z.string(),
    }),
  ),
});
export type AskQuestions = z.infer<typeof AskQuestionsSchema>;

/* ---------- Negotiation ---------- */

export const NegotiationTurnInput = z.object({
  ...Context,
  setup: z.object({
    role: z.string().max(200),
    target: z.string().max(100),
    floor: z.string().max(100).optional(),
  }),
  transcript: z
    .array(z.object({ speaker: z.enum(["recruiter", "candidate"]), text: z.string().max(3000) }))
    .max(20),
});

export const NegotiationTurnSchema = z.object({
  recruiterLine: z.string(),
  coaching: z
    .object({ score: z.number(), worked: z.string(), sharpen: z.string(), betterLine: z.string() })
    .nullable(),
  done: z.boolean(),
  finalOutcome: z.string().nullable(),
});
export type NegotiationTurn = z.infer<typeof NegotiationTurnSchema>;

/* ---------- Panel ---------- */

export const PANELISTS = [
  {
    id: "manager",
    name: "Hiring manager",
    priority: "Can you actually do the job and deliver results on my team?",
  },
  {
    id: "hr",
    name: "HR partner",
    priority: "Values, motivation, how you treat people, and whether you'll stay.",
  },
  {
    id: "peer",
    name: "Future peer",
    priority: "Are you easy to work with day to day, and will you pull your weight?",
  },
] as const;
export type PanelistId = (typeof PANELISTS)[number]["id"];

export const PanelReviewInput = z.object({
  ...Context,
  exchanges: z
    .array(
      z.object({
        panelist: z.enum(["manager", "hr", "peer"]),
        question: z.string().max(1000),
        answer: z.string().max(6000),
      }),
    )
    .min(1)
    .max(12),
});

export const PanelReviewSchema = z.object({
  overall: z.string(),
  panelists: z.array(
    z.object({
      panelist: z.enum(["manager", "hr", "peer"]),
      score: z.number(),
      concernAddressed: z.boolean(),
      verdict: z.string(),
      fix: z.string(),
    }),
  ),
});
export type PanelReview = z.infer<typeof PanelReviewSchema>;
