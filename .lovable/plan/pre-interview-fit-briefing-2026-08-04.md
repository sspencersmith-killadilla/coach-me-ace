# Pre-interview fit briefing

When both a resume and a job posting are loaded, the welcome screen offers a short coaching read-out before any questions start: how you fit, what to lean on, and where you're likely to get pressed.

## What the user sees

- Once both uploads are confirmed, a new card appears on the welcome screen: "Your fit for this role" with a "Get my pre-interview briefing" button.
- Tapping it generates a briefing with:
  - A fit read (a 1-10 fit score plus one honest paragraph on how the background matches the posting).
  - Your strongest cards — 3 points from the resume that map directly to the posting's must-haves, each with the specific role/project to cite.
  - Watch-outs — 2-4 gaps or thin spots a panel will probe, each with a suggested way to answer it honestly.
  - Likely questions — 3-5 questions this specific pairing invites, each with a one-line note on what they're really testing.
  - One line on the tone/culture the posting projects and how to pitch yourself against it.
- Buttons at the bottom: "Practice these questions" (starts a session seeded with the briefing's likely questions) and "Start regular practice".
- The briefing is cached with the session (same browser-only storage as the job brief and resume) so it isn't regenerated on every visit; a "Regenerate" link refreshes it if the resume or posting changes.
- If only one of the two is uploaded, the card explains what's still missing instead of the button.
- Errors (rate limit, credits, model hiccup) surface in the card with a retry, matching existing coach error copy.

## Technical notes

- `src/lib/briefing.ts` — Zod `BriefingSchema` (`fitScore`, `fitSummary`, `strengths[] {point, evidence}`, `watchOuts[] {gap, howToHandle}`, `likelyQuestions[] {question, whatItTests}`, `toneAdvice`), `BriefingInput` (`jobBrief`, `resume`), and the system prompt. Prompt reuses `describeJobBrief`, `describeResume`, and `inferSeniority` so the briefing is calibrated to seniority the same way feedback is.
- `src/lib/briefing.server.ts` — `generateBriefing` using `streamText` + `Output.object` against `google/gemini-3.6-flash` via `createLovableAiGatewayProvider`, with the same `NoObjectGeneratedError` / 429 / 402 error mapping as `feedback.server.ts`.
- `src/lib/briefing.functions.ts` — thin `createServerFn` wrapper only (no runtime siblings), mirroring `feedback.functions.ts`.
- `src/lib/briefing-context.tsx` — provider storing the generated briefing plus a hash of the resume+brief in `sessionStorage`, hydrated in `useEffect`; mounted in `__root.tsx` inside the existing job-brief/resume providers.
- `src/components/interview/PreInterviewBriefing.tsx` — the card, rendered in `src/routes/index.tsx` after `ResumeUpload`. Uses `useServerFn(getPreInterviewBriefing)`, existing shadcn primitives and semantic tokens.
- "Practice these questions" passes the briefing's questions to `/practice` via search params or the briefing context; `practice.tsx` prepends them to the question queue before falling back to the normal bank, leaving existing modes untouched.
