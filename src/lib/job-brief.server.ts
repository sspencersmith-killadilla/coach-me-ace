import { NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { JOB_BRIEF_SYSTEM_PROMPT, JobBriefInput, JobBriefSchema, type JobBrief } from "./job-brief";

type Input = z.infer<typeof JobBriefInput>;

type UserPart =
  | { type: "text"; text: string }
  | { type: "image"; image: string }
  | { type: "file"; data: string; mediaType: string; filename?: string };

function buildParts(data: Input): UserPart[] {
  const parts: UserPart[] = [
    {
      type: "text",
      text: "Summarise this job posting or recruitment brochure into the brief described above.",
    },
  ];

  if (data.fileDataUrl && data.mimeType) {
    if (data.mimeType.startsWith("image/")) {
      parts.push({ type: "image", image: data.fileDataUrl });
    } else {
      parts.push({
        type: "file",
        data: data.fileDataUrl,
        mediaType: data.mimeType,
        filename: data.fileName ?? "job-posting",
      });
    }
  }

  if (data.text?.trim()) {
    parts.push({ type: "text", text: data.text.trim().slice(0, 40000) });
  }

  return parts;
}

export async function parseJobBrief(data: Input): Promise<JobBrief> {
  if (!data.text?.trim() && !data.fileDataUrl) {
    throw new Error("Add the posting text or upload a file first.");
  }

  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);

  try {
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: JOB_BRIEF_SYSTEM_PROMPT,
      output: Output.object({ schema: JobBriefSchema }),
      messages: [{ role: "user", content: buildParts(data) as never }],
    });

    return (await result.output) as JobBrief;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("We couldn't make sense of that document. Try pasting the text instead.");
    }
    const message = error instanceof Error ? error.message : "";
    if (message.includes("429")) {
      throw new Error("Things are busy right now — please try again in a moment.");
    }
    if (message.includes("402")) {
      throw new Error("AI credits have run out. Add more credits to keep practicing.");
    }
    throw new Error("We couldn't read that posting. Please try again.");
  }
}
