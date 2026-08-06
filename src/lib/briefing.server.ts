import { NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  BRIEFING_SYSTEM_PROMPT,
  BriefingInput,
  BriefingSchema,
  PROMOTION_BRIEFING_SYSTEM_PROMPT,
  type PreInterviewBriefing,
} from "./briefing";
import { describeJobBrief } from "./job-brief";
import { describePromotion } from "./promotion";
import { describeResume, inferSeniority } from "./resume";

type Input = z.infer<typeof BriefingInput>;

export async function generateBriefing(data: Input): Promise<PreInterviewBriefing> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI coaching is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);

  const prompt = [
    "THE ROLE",
    describeJobBrief(data.jobBrief),
    "",
    "THE CANDIDATE",
    describeResume(data.resume),
    "",
    `Apparent seniority: ${inferSeniority(data.resume)}. Calibrate expectations to that level.`,
  ].join("\n");

  try {
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: BRIEFING_SYSTEM_PROMPT,
      output: Output.object({ schema: BriefingSchema }),
      prompt,
    });

    const output = (await result.output) as PreInterviewBriefing;
    return {
      ...output,
      fitScore: Math.max(1, Math.min(10, Math.round(output.fitScore))),
    };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("The coach got tangled up writing that briefing. Please try again.");
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
