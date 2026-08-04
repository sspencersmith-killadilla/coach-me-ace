import { createServerFn } from "@tanstack/react-start";
import { ResumeInput } from "./resume";
import { parseResume } from "./resume.server";
import type { Resume } from "./resume";

export const buildResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResumeInput.parse(input))
  .handler(async ({ data }): Promise<Resume> => parseResume(data));
