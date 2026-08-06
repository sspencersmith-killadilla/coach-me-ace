# Internal Promotion Interview Mode

## What we're building

A dedicated **Internal Promotion** practice mode that treats a promotion panel as a distinct interview type from an external job application. The coach will evaluate the candidate against the next level inside their current organization, not just against an external job posting.

1. **Promotion setup on the welcome screen**
   - Add a new "Internal Promotion" card alongside the existing job-posting and resume cards.
   - Let the user choose the data source:
     - **Reuse existing inputs**: a toggle on the current job-brief/resume flow that marks the target role as a promotion inside the user's current company.
     - **Separate promotion form**: inputs for current role, target role/level, company context, and an optional promotion packet or business-case document/text.
   - Persist the promotion context in session storage alongside the job brief and resume.

2. **Promotion-aware question pool**
   - Add a new mode `promotion` to the practice mode selector.
   - Filter or prioritize questions that test promotion dynamics: scope expansion, leading without authority, cross-functional influence, strategic thinking, internal stakeholder management, and "ready now vs. ready soon" judgment.
   - Reuse the existing question bank where possible; add a small set of promotion-specific questions if needed.

3. **Promotion-calibrated feedback**
   - Extend the feedback prompt with a `PROMOTION_CONTEXT_PROMPT` that tells the coach:
     - The candidate already works at the company, so "fit" means readiness for the next level, not culture-match against a new employer.
     - Judge answers against the target role's scope, not the current role's scope.
     - Look for evidence of internal track record, relationships, and institutional knowledge.
     - Flag when an answer sounds like an external applicant rather than someone who knows the company.
   - Add new feedback fields:
     - `nextLevelReadiness`: one sentence on whether the answer demonstrates the target level.
     - `internalEvidence`: a recommendation for which internal achievement or relationship to cite.
     - `promotionRisk`: the biggest risk a promotion panel would see in this answer and how to address it.
   - Render the new fields in `FeedbackCard` when promotion context is active.

4. **Promotion pre-interview briefing**
   - Extend the existing fit briefing to support a "current role → target role" comparison.
   - When promotion context is present, generate:
     - readiness score (1-10) for the promotion,
     - strengths mapped to the target level,
     - watch-outs specific to internal promotion panels (e.g., "you sound like you're interviewing externally," "you didn't cite internal stakeholders"),
     - likely promotion-panel questions,
     - tone advice for pitching to people who already know you.

5. **Mode integration**
   - Update `src/lib/session.ts` to include `promotion` in `Mode`.
   - Update `src/routes/practice.tsx` to accept a promotion flag in search params and route questions/feedback through the promotion path.
   - Update `src/routes/index.tsx` to surface the promotion setup card and briefing.

## Why this helps

Promotion interviews are different from external interviews. The panel already knows the candidate's current work, so generic "fit with the company" answers fall flat. They are looking for evidence that the person is already operating at the next level: broader scope, stronger stakeholder influence, strategic judgment, and leadership inside the company's specific context. A dedicated mode lets the coach ask the right questions, judge answers against the target level, and surface the internal track record the candidate should lean on.

## Technical outline

```text
src/lib/promotion.ts                    # schema + prompts for promotion context
src/lib/promotion-context.tsx           # sessionStorage provider for promotion state
src/components/interview/PromotionSetup.tsx   # card + form on welcome screen
src/lib/feedback-schema.ts              # add PROMOTION_CONTEXT_PROMPT + new output fields
src/lib/feedback.server.ts              # wire promotion context into feedback generation
src/lib/briefing.ts                     # extend briefing schema for promotion comparison
src/lib/briefing.server.ts              # generate promotion briefing when context present
src/components/interview/PromotionBriefing.tsx  # render promotion briefing card
src/components/interview/FeedbackCard.tsx     # render nextLevelReadiness, internalEvidence, promotionRisk
src/lib/session.ts                      # add "promotion" to Mode + pool logic
src/routes/index.tsx                    # add promotion setup + briefing card
src/routes/practice.tsx                 # accept promotion search param + mode handling
```

## Out of scope

- Database persistence for promotion context; it stays session-scoped like the job brief and resume.
- Multi-user or manager/HR review workflows; this is still a solo practice tool.
- Automatic extraction of promotion packets beyond the existing document/text parsing pipeline.
