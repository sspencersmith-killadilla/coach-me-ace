import { createServerFn } from "@tanstack/react-start";
import { AskQuestionsInput, NegotiationTurnInput, PanelReviewInput, ResumeTailorInput } from "./prep-schema";
import { generateAskQuestions, generateNegotiationTurn, generatePanelReview, generateResumeTailoring } from "./prep.server";

export const getAskQuestions = createServerFn({ method: "POST" })
  .validator((input: unknown) => AskQuestionsInput.parse(input))
  .handler(async ({ data }) => generateAskQuestions(data));

export const getNegotiationTurn = createServerFn({ method: "POST" })
  .validator((input: unknown) => NegotiationTurnInput.parse(input))
  .handler(async ({ data }) => generateNegotiationTurn(data));

export const getPanelReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => PanelReviewInput.parse(input))
  .handler(async ({ data }) => generatePanelReview(data));

export const getResumeTailoring = createServerFn({ method: "POST" })
  .validator((input: unknown) => ResumeTailorInput.parse(input))
  .handler(async ({ data }) => generateResumeTailoring(data));
