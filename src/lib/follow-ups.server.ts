import { NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { describeJobBrief } from "./job-brief";
import { describeResume } from "./resume";
import { FOLLOW_UPS_SYSTEM_PROMPT, FollowUpsSchema, type FollowUps } from "./follow-ups-schema";

type Input = z.infer<typeof import("./follow-ups-schema").FollowUpsInput>;

export async function generateFollowUps(data: Input): Promise<FollowUps> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI coaching is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);

  const contextLines: string[] = [];
  if (data.jobBrief) {
    contextLines.push(describeJobBrief(data.jobBrief));
  }
  if (data.resume) {
    contextLines.push(describeResume(data.resume));
  }

  const promptParts = [
    `Original interview question:\n${data.question}`,
    `Candidate's answer:\n${data.answer}`,
  ];
  if (contextLines.length) {
    promptParts.push(`Background:\n${contextLines.join("\n\n")}`);
  }

  try {
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: FOLLOW_UPS_SYSTEM_PROMPT,
      output: Output.object({ schema: FollowUpsSchema }),
      prompt: promptParts.join("\n\n"),
    });

    return (await result.output) as FollowUps;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("The coach got tangled up writing follow-ups. Please try again.");
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
