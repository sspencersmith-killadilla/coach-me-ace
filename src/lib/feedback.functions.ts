import { createServerFn } from "@tanstack/react-start";
import { FeedbackInput } from "./feedback-schema";
import { generateInterviewFeedback } from "./feedback.server";
import type { InterviewFeedback } from "./feedback-schema";

export type { InterviewFeedback };

export const getInterviewFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FeedbackInput.parse(input))
  .handler(async ({ data }): Promise<InterviewFeedback> => generateInterviewFeedback(data));
