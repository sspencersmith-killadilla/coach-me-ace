# Mock Interview Coach

A calm, encouraging web app for practicing job interviews: pick a question, answer it (typing or speaking), and get warm, specific AI coaching back.

## Two things worth flagging up front

- **No API key needed.** This project runs on Lovable's built-in AI, so there's nothing for you to paste in and no key to keep safe. I'll wire it up server-side.
- **No pasting questions either.** All 136 questions from your message get baked into the app as a question bank file.

## Design direction

Calming, mentor-like: slate blue as the primary, soft off-white canvas, a warm amber accent for encouragement moments. Generous spacing, rounded cards, gentle fade/slide transitions between question and feedback states. All colors defined as design tokens so the whole app stays consistent (light + dark).

## Screens & flow

1. **Welcome (`/`)** — short, friendly explanation of what the practice session does, a "Start Interview" button, and a choice of Random or Sequential order.
2. **Interview (`/practice`)**
   - Current question shown large and centered, with a progress indicator (e.g. "Question 12 of 136") and category label.
   - Big auto-growing text area for the answer.
   - Microphone button using the browser's Web Speech API for speech-to-text, appending transcribed words into the same text area (hidden gracefully on browsers that don't support it).
   - "Submit Answer" (disabled until there's text), plus "Skip" to move on.
   - While waiting on feedback: an encouraging loading state, not a bare spinner.
3. **Feedback** — appears in place of the answer box on the same screen:
   - Score out of 10 as a friendly dial/badge, never framed as a failure.
   - "What you did well" card.
   - "One thing to sharpen" card.
   - "An ideal STAR version" card with the rewritten answer.
   - Buttons: "Try this one again" and "Next Question".
4. **Session recap** — a light running tally in the header (questions answered, average score) so progress feels visible. Session-only, nothing stored on a server.

## Technical notes

- **Stack:** the project's fixed stack — React + TanStack Start + Tailwind. (React/Next/Tailwind was your ask; Next isn't available here, TanStack Start fills the same role.)
- **Question bank:** `src/data/questions.ts` — all 136 questions, cleaned of the line-break artifacts from the paste, each with an id and a category (Motivation & Fit, Company Knowledge, Skills & Work Style, Teamwork & Leadership, Problem Solving, Accomplishments, Career Goals, Life Outside Work, Setbacks & Criticism).
- **AI call:** a server function in `src/lib/feedback.functions.ts` calling Lovable AI (`google/gemini-3.6-flash`) with your coach system prompt, returning structured output: `score`, `praise`, `improvement`, `starAnswer`. Structured output means the UI renders reliable cards instead of parsing prose.
- **Error handling:** rate limit / credit / network failures surface as a gentle in-card message with a retry, never a blank screen.
- **Components:** `WelcomeHero`, `QuestionCard`, `AnswerComposer` (textarea + speech input), `FeedbackCard`, `SessionProgress` — separated from the API logic as requested.
- **State:** session state (order mode, current index, history) held in a React context; no database unless you later want saved history.
- Per-route SEO metadata on both pages.

## Not included (say the word and I'll add)

- Saved history across visits (needs a backend + login).
- Recording/playback of spoken answers as audio.
