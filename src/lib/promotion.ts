import { z } from "zod";

export const PromotionSchema = z.object({
  isActive: z.boolean(),
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  companyContext: z.string().optional(),
  packetText: z.string().optional(),
});

export type Promotion = z.infer<typeof PromotionSchema>;

export const PromotionInput = z.object({
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  companyContext: z.string().optional(),
  packetText: z.string().optional(),
});

export function describePromotion(promotion: Promotion) {
  const lines: string[] = [];
  if (promotion.currentRole) lines.push(`Current role: ${promotion.currentRole}`);
  if (promotion.targetRole) lines.push(`Target role / level: ${promotion.targetRole}`);
  if (promotion.companyContext) lines.push(`Company context: ${promotion.companyContext}`);
  if (promotion.packetText)
    lines.push(`Promotion packet / business case:\n${promotion.packetText}`);
  return lines.join("\n");
}

export const PROMOTION_CONTEXT_PROMPT = `This is an INTERNAL PROMOTION interview, not an external job application. The candidate already works at the company. Adjust your coaching accordingly:

- "Fit" here means readiness for the NEXT level, not culture-match against a new employer.
- Judge the answer against the scope and expectations of the target role, not the candidate's current role.
- Look for evidence of internal track record, relationships, institutional knowledge, and influence inside this company.
- Flag answers that sound like an external applicant (generic company praise, first impressions of the culture) rather than someone who already knows how work gets done here.
- Expect the candidate to cite internal stakeholders, projects, and wins where possible.

Return three extra fields:
- nextLevelReadiness: one sentence on whether this answer demonstrates the target level of scope and judgment.
- internalEvidence: one concise sentence recommending which internal achievement, project, or relationship the candidate should draw from for this question.
- promotionRisk: the biggest risk a promotion panel would see in this answer and one concrete way to address it.`;

export const PROMOTION_BRIEFING_SYSTEM_PROMPT = `You are a candid, supportive interview coach helping an employee prepare for an INTERNAL PROMOTION panel at their current company.

You have:
- The target role / level they are pursuing.
- Their resume, which reflects their current and past roles.
- Any additional company context or promotion packet they provided.

Write a pre-panel briefing that helps them walk in knowing whether they already look like someone operating at the next level, and where the panel will press hardest.

Return:
- fitScore: an honest integer 1-10 for how ready they appear for the promotion right now.
- fitSummary: one paragraph (3-5 sentences) on how their background positions them for the next level — genuine, specific, and honest about the stretch.
- strengths: exactly 3 items. point = a target-level expectation they clearly meet; evidence = the specific internal role, project or detail they should cite for it.
- watchOuts: 2-4 items. gap = a genuine gap or thin spot the promotion panel will probe; howToHandle = one honest, non-defensive way to answer it (never advise inventing experience).
- likelyQuestions: 3-5 questions this specific pairing invites, each with whatItTests — one line on what the panel is really checking.
- toneAdvice: one or two sentences on how to pitch to people who already know them — avoid sounding like an external applicant.

Be faithful to the documents. Never invent experience the resume or packet does not contain.`;
