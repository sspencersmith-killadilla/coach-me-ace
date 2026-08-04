import { NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  BASE_SYSTEM_PROMPT,
  FeedbackSchema,
  JOB_CONTEXT_PROMPT,
  RESUME_CONTEXT_PROMPT,
  SENIORITY_PROMPT,
  TOUGH_TONE_PROMPT,
  type FeedbackInput,
  type InterviewFeedback,
} from "./feedback-schema";
import { describeJobBrief } from "./job-brief";
import { describeResume, inferSeniority } from "./resume";

type Input = z.infer<typeof FeedbackInput>;

export async function generateInterviewFeedback(data: Input): Promise<InterviewFeedback> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI coaching is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);

  const sections: string[] = [BASE_SYSTEM_PROMPT];
  if (data.jobBrief) {
    sections.push(JOB_CONTEXT_PROMPT);
    sections.push(describeJobBrief(data.jobBrief));
  }
  if (data.resume) {
    sections.push(RESUME_CONTEXT_PROMPT);
    sections.push(describeResume(data.resume));
    sections.push(SENIORITY_PROMPT(inferSeniority(data.resume)));
  }
  if (data.tone === "tough") {
    sections.push(TOUGH_TONE_PROMPT);
  }
  const system = sections.join("\n\n");


  try {
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system,
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
}
