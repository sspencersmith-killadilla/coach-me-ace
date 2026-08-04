# Make the coach genuinely useful for "the big interview"

The app already covers the core loop well: 136 questions, spoken answers, job/resume context, structured feedback, follow-ups, and session length. To move from "practice tool" to "interview prep coach," the next work should target the moments that matter most before a high-stakes interview: knowing what to improve, simulating real pressure, and building confidence.

## Proposed roadmap

### Phase 1 — Practice that targets real gaps (no backend needed)

1. **Category filter on the welcome screen**
   - Let users pick one or more categories (Leadership, Problem Solving, Setbacks, etc.) instead of random/sequential only.
   - Add a "Weakest first" mode that uses the running session scores to serve low-scoring categories more often.

2. **Full mock-interview mode**
   - A "Mock real interview" option: 5–10 questions back-to-back with a visible timer, no feedback until the end.
   - At the end, show a recap with per-question scores, common themes, and 2–3 prioritized things to work on.

3. **Spoken-answer polish**
   - Detect filler words ("um," "like," "you know") and long pauses from the transcript.
   - Surface a small "Vocal habits" note in the feedback card: count of fillers, pacing estimate, and one tip.

4. **Post-answer reflection**
   - After the user sees feedback, ask one quick question: "How confident did you feel?" (1–5).
   - Use confidence + score to flag answers worth revisiting.

### Phase 2 — Richer coaching (still no persistent backend)

5. **Company-specific question generator**
   - Use the parsed job brief + public company facts to generate 3–5 likely questions for that exact role/company.
   - Surface these as a "Questions to expect" card on the welcome screen.

6. **STAR method mini-lessons**
   - Add a "Learn the STAR method" expandable section with a 60-second example and a checklist.
   - Optionally score answers on STAR completeness (Situation, Task, Action, Result) and show which pieces were missing.

7. **Side-by-side answer comparison**
   - Show the user's original answer next to the rewritten STAR answer with inline highlights for what changed.

### Phase 3 — Long-term prep (requires backend / Lovable Cloud)

8. **Saved practice history**
   - Store answers, scores, and feedback per user so they can see progress across sessions.
   - Trend line of average score and confidence over time.

9. **Weak-area workouts**
   - Automatically suggest a focused 5-question drill based on the user's lowest-scoring categories from all prior sessions.

10. **Shareable prep report**
    - Generate a simple PDF/report of strengths, growth areas, and sample answers to review with a human coach or mentor before the interview.

## Recommended first step

Start with Phase 1, items 1–3. They keep the app stateless and lightweight while adding the most prep value: targeted categories, a realistic timed mock, and spoken-answer habit feedback.

## Technical notes

- Phase 1 can reuse existing session state and localStorage/sessionStorage.
- The "full mock" mode is mostly a UI/state change around the existing feedback loop.
- Filler-word detection can run client-side on the transcript string.
- Phase 3 should wait until there is a clear need for accounts and history, because it requires Lovable Cloud auth and database setup.
