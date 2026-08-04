# Making the coach remember, speak, and push back

All nine pieces of feedback are buildable on the current architecture — no accounts, no server storage. Two of them (progress file, spoken questions) do the heavy lifting; the rest ride on top.

## Priority 1 — Ship first

### 1. Progress file (export / import)
- A `coach-progress.json` file the user downloads at the end of any session and re-uploads on the welcome screen next time.
- Contents: per-question history (question, category, score, confidence, filler count, date), rolling category averages, and session summaries.
- Welcome screen gains a "Your progress" card: sessions completed, average score trend, filler-word trend, weakest categories — all read from the loaded file.
- Held in memory + sessionStorage during a session; nothing leaves the browser, so the "nothing on our servers" claim stays true. A one-line prompt at session end nudges the download.

### 2. The interviewer speaks
- Each question is read aloud via text-to-speech through the existing AI gateway, streamed so it starts speaking almost immediately.
- Auto-plays when a question appears (with a persistent mute toggle), plus a replay button.
- Voice choice tied to the interviewer personality below: warm for supportive, flatter and clipped for the tough panelist.

## Priority 2 — Make the mock feel real

### 3. Live follow-ups inside Full Mock
- After each mock answer, the existing follow-up generator runs silently; roughly half the time the interviewer immediately asks one on the spot before moving on.
- The follow-up is spoken like any other question and its answer is graded in the recap, so the transcript shows the real back-and-forth.

### 4. Second interviewer personality
- A "Tough panelist" toggle on the welcome screen. Same scoring rubric, colder delivery: shorter praise, blunt critique, more frequent on-the-spot follow-ups, flatter TTS voice.
- Supportive stays the default; the tough mode is opt-in and clearly labelled as practice for the worst-case room.

### 5. Live pacing counter
- While recording or typing, a small counter shows elapsed speaking time and word count, turning amber past ~90 seconds and red past ~2 minutes.
- Replaces after-the-fact "this ran long" with in-the-moment awareness; the post-answer vocal habits card stays.

## Priority 3 — Continuity and calibration

### 6. Filler words tracked across questions
- Vocal habits card gains a trend line: this answer's filler rate versus the session average and, when a progress file is loaded, versus previous sessions.
- Explicit callouts like "down from 15 'um's on question one."

### 7. Weak spots that remember
- "Focus my weak spots" reads category averages from the loaded progress file first, falling back to current-session scores.
- Welcome screen shows the top three weak categories from history before the session starts.

### 8. Difficulty calibration from the resume
- The resume parser also infers a seniority level (early career / mid / senior / executive).
- That level steers question depth and the model answer's register — a new grad gets scope-appropriate expectations, a VP candidate gets pushed on strategy, org design, and trade-offs.
- Manual override on the welcome screen for anyone who skips the resume upload.

## Technical notes

- Progress file: plain JSON with a version field, validated on import; a helper module owns serialise/parse/merge, and a context provider exposes history to the welcome and practice screens.
- TTS: a server route streams from the AI gateway (`openai/gpt-4o-mini-tts`, SSE + PCM) and the client plays chunks as they arrive; questions are short, so a per-question cache avoids re-billing replays.
- Personality and seniority become extra fields on the feedback and follow-up prompts — one rubric, different delivery, no schema churn.
- Live pacing counter is client-only, driven by the existing recorder timer and the transcript string.
- Mock follow-ups reuse `follow-ups.functions.ts` as-is; only the mock loop's state machine changes.

## Suggested build order

Progress file → spoken questions → live pacing counter → cross-question filler trend → history-aware weak spots → mock follow-ups → tough panelist → seniority calibration.
