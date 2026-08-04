# Make the model answer sound human

Right now the "ideal answer" reads like a textbook STAR template because the prompt only asks for a STAR-structured rewrite in 120-200 words. The fix is prompt-level: teach the coach how a real, likable candidate actually talks.

## What changes

Rewrite the `starAnswer` instructions in the system prompt to require:

- **Natural spoken rhythm** — contractions, varied sentence length, an occasional short sentence or aside, the way someone actually speaks out loud rather than reads off a page.
- **Concrete specifics over jargon** — real names for the situation, plain numbers, a small human detail (what was hard, what they were worried about, what they learned).
- **The user's own voice** — reuse the details, vocabulary, and personality already in their answer; never invent a fancier candidate than the one who wrote it.
- **Banned corporate filler** — an explicit "avoid" list (leverage, spearheaded, synergy, "I am a highly motivated professional", "In this situation, my task was to…", labeling the STAR steps out loud).
- **STAR as invisible scaffolding** — the answer should follow situation → action → result in substance, but never announce the structure.
- **Slightly looser length** (roughly 100-180 words) so it doesn't pad to hit a word count.

Also add a one-line rule that if the user's own answer is already conversational, the rewrite should keep their phrasing and only tighten the structure.

## Technical notes

- Single file: `src/lib/feedback-schema.ts` — update `BASE_SYSTEM_PROMPT`, and the STAR sentence in `JOB_CONTEXT_PROMPT` so the job-specific rewrite stays conversational too.
- No schema, UI, or server-function changes.
- Verify by running one real question/answer through `/practice` and reading the generated model answer.
