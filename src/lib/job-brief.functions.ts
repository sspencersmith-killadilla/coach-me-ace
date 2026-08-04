import { createServerFn } from "@tanstack/react-start";
import { JobBriefInput } from "./job-brief";
import { parseJobBrief } from "./job-brief.server";
import type { JobBrief } from "./job-brief";

export const buildJobBrief = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => JobBriefInput.parse(input))
  .handler(async ({ data }): Promise<JobBrief> => parseJobBrief(data));
