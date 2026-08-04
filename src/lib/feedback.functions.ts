import { createServerFn } from "@tanstack/react-start";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const FeedbackInput = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const FeedbackSchema = z.object({
  score: z.number(),
  praise: z.string(),
  improvement: z.string(),
  starAnswer: z.string(),
});

export type InterviewFeedback = z.infer<typeof FeedbackSchema>;

const SYSTEM_PROMPT = `You are a supportive, expert career coach. The user is practicing for a job interview. Review their answer to the provided question. Give them a "score" out of 10. Highlight one thing they did really well (praise). Point out one area where they can improve (constructive critique). Provide a rewritten 'ideal' version of their answer using the STAR method (Situation, Task, Action, Result) if applicable. Keep your tone warm, lovable, and highly encouraging.

Return: score (integer 1-10), praise (2-3 sentences of specific, genuine praise), improvement (2-3 sentences of kind, actionable critique), starAnswer (a rewritten model answer in the user's own voice, first person, 120-200 words, using the STAR method where it fits).`;

export const getInterviewFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FeedbackInput.parse(input))
  .handler(async ({ data }): Promise<InterviewFeedback> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI coaching is not configured yet.");

    const gateway = createLovableAiGatewayProvider(key);

    try {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system: SYSTEM_PROMPT,
        output: Output.object({ schema: FeedbackSchema }),
        prompt: `Interview question:\n${data.question}\n\nCandidate's answer:\n${data.answer}`,
      });

      const output = (await result.output) as InterviewFeedback;
      return {
        ...output,
        score: Math.max(1, Math.min(10, Math.round(output.score))),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The coach got tangled up writing that one. Please try again.");
      }
      const message = error instanceof Error ? error.message : "";
      if (message.includes("429")) {
        throw new Error("The coach is catching their breath — please try again in a moment.");
      }
      if (message.includes("402")) {
        throw new Error("AI credits have run out. Add more credits to keep practicing.");
      }
      throw new Error("Couldn't reach the coach just now. Please try again.");
    }
  });
