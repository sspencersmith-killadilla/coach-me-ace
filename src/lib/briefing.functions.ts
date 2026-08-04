import { createServerFn } from "@tanstack/react-start";
import { BriefingInput } from "./briefing";
import { generateBriefing } from "./briefing.server";
import type { PreInterviewBriefing } from "./briefing";

export type { PreInterviewBriefing };

export const getPreInterviewBriefing = createServerFn({ method: "POST" })
  .validator((input: unknown) => BriefingInput.parse(input))
  .handler(async ({ data }): Promise<PreInterviewBriefing> => generateBriefing(data));
