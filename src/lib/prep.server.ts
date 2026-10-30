import { NoObjectGeneratedError, Output, streamText } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { describeJobBrief, type JobBrief } from "./job-brief";
import { describePromotion, type Promotion } from "./promotion";
import { describeResume, type Resume } from "./resume";
import {
  AskQuestionsSchema,
  NegotiationTurnSchema,
  PANELISTS,
  PanelReviewSchema,
  type AskQuestions,
  type AskQuestionsInput,
  type NegotiationTurn,
  type NegotiationTurnInput,
  type PanelReview,
  type PanelReviewInput,
} from "./prep-schema";

type Ctx = { jobBrief?: JobBrief; resume?: Resume; promotion?: Promotion };

function background(ctx: Ctx) {
  const lines: string[] = [];
  if (ctx.jobBrief) lines.push(describeJobBrief(ctx.jobBrief));
  if (ctx.resume) lines.push(describeResume(ctx.resume));
  if (ctx.promotion?.isActive) lines.push(describePromotion(ctx.promotion));
  return lines.length ? `Background:\n${lines.join("\n\n")}` : "No job or resume was provided.";
}

async function runStructured<T>(system: string, prompt: string, schema: z.ZodType<T>) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI coaching is not configured yet.");
  const gateway = createLovableAiGatewayProvider(key, undefined, { structuredOutputs: true });
  try {
    const result = streamText({
      model: gateway("openai/gpt-6-astra"),
      system,
      prompt,
      output: Output.object({ schema }),
      providerOptions: { lovable: { reasoningEffort: "low" } },
    });
    return (await result.output) as T;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new Error("The coach got tangled up writing that one. Please try again.");
    }
    const message = error instanceof Error ? error.message : "";
    console.error("Prep coach call failed", message);
    if (message.includes("429")) {
      throw new Error("The coach is catching their breath — please try again in a moment.");
    }
    if (message.includes("402")) {
      throw new Error("AI credits have run out. Add more credits to keep practicing.");
    }
    throw new Error("Couldn't reach the coach just now. Please try again.");
  }
}

const HUMAN = "Write like a real person talks: contractions, plain words, no corporate jargon.";

export function generateAskQuestions(data: z.infer<typeof AskQuestionsInput>) {
  const drafts = data.drafts?.filter((d) => d.trim()) ?? [];
  return runStructured<AskQuestions>(
    `You are a supportive, sharp interview coach. Help the candidate prepare the questions THEY ask at the end of an interview. ${HUMAN}
- suggestions: 5 specific, smart questions tailored to this role, company and candidate (never generic ones like "what does a typical day look like"). whyItLands = one sentence on what it signals to the panel.
- graded: one entry per candidate draft (empty array if none). score 1-10, verdict = one honest sentence, sharperVersion = an improved rewrite.`,
    `${background(data)}\n\nCandidate drafts:\n${drafts.length ? drafts.map((d, i) => `${i + 1}. ${d}`).join("\n") : "(none)"}`,
    AskQuestionsSchema,
  );
}

export function generateNegotiationTurn(data: z.infer<typeof NegotiationTurnInput>) {
  const candidateTurns = data.transcript.filter((t) => t.speaker === "candidate").length;
  return runStructured<NegotiationTurn>(
    `You run a realistic salary negotiation role-play and coach the candidate.
You play a friendly but firm recruiter for the role "${data.setup.role}". The candidate wants about ${data.setup.target}${data.setup.floor ? ` and their walk-away floor is ${data.setup.floor}` : ""} (the recruiter does not know these numbers).
Flow: open by asking for salary expectations; then present an offer meaningfully below the target; respond realistically to counters (you can move some, but push back, mention budget bands or other benefits). End after the candidate's 4th reply at the latest, or earlier if a deal is clearly reached.
Return:
- recruiterLine: what the recruiter says next (1-3 sentences, natural speech). If done, the recruiter's closing line.
- coaching: null if the candidate hasn't spoken yet; otherwise coach their LAST reply: score 1-10, worked (one sentence), sharpen (one sentence), betterLine (how they could have said it).
- done: true when the negotiation is over.
- finalOutcome: when done, 2 sentences summarising where they landed vs their target and the biggest lesson; else null.
${HUMAN} The candidate has replied ${candidateTurns} time(s) so far.`,
    `${background(data)}\n\nTranscript so far:\n${
      data.transcript.length
        ? data.transcript.map((t) => `${t.speaker.toUpperCase()}: ${t.text}`).join("\n")
        : "(not started)"
    }`,
    NegotiationTurnSchema,
  );
}

export function generatePanelReview(data: z.infer<typeof PanelReviewInput>) {
  const roles = PANELISTS.map((p) => `- ${p.id} (${p.name}): ${p.priority}`).join("\n");
  return runStructured<PanelReview>(
    `You are debriefing a candidate after a three-person panel interview. Panelists and what each cares about:
${roles}
For each panelist who asked at least one question return: score 1-10 for how well the candidate satisfied THAT panelist's priority, concernAddressed (boolean), verdict (one honest sentence in that panelist's voice), fix (one concrete improvement).
overall: 2-3 sentences on how the panel as a whole likely leans and why. ${HUMAN}`,
    `${background(data)}\n\nPanel transcript:\n${data.exchanges
      .map((e) => `[${e.panelist}] Q: ${e.question}\nA: ${e.answer || "(no answer)"}`)
      .join("\n\n")}`,
    PanelReviewSchema,
  );
}
