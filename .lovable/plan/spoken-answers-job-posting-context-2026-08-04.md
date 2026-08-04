# Spoken answers + job-posting context

Two additions to the practice flow: real spoken answers with accurate transcription, and an optional job posting/brochure the coach reads before giving feedback.

## 1. Speak your answer, like a real interview

Today the mic uses the browser's built-in Web Speech API — free, but inaccurate, Chrome-only, and it silently drops words. Replace it with proper recording + AI transcription.

- Press "Answer out loud" to record; a live timer and a simple waveform/level meter show it's listening.
- Press stop, and the recording is transcribed by AI (streamed in, so words appear as they're recognized) and dropped into the answer box — still editable before submitting.
- Works in Safari and Firefox too, not just Chrome.
- Gentle errors for a denied mic, a silent/empty recording, or a transcription hiccup, each with a retry.
- Long recordings are split into chunks and transcribed in sequence, so nothing gets cut off.

## 2. Upload the job you're aiming for

- On the welcome screen: an optional "Add the job you're going for" panel — drop a PDF, an image of a brochure, or paste the text.
- The file is parsed once (PDF/image read by AI, text used as-is) into a short brief: role title, company, key responsibilities, must-have skills, and tone of the posting. That brief is shown back as an editable summary card so you can confirm it looks right.
- The brief travels with the session and is shown as a small chip in the practice header ("Coaching for: Product Designer at Acme") with a link to change or clear it.
- Feedback becomes job-specific: praise references the skills the posting asks for, the improvement points at gaps against the posting, and the STAR model answer is written toward that role's language.
- With no posting uploaded, everything works exactly as it does now.

Nothing is stored on a server — the posting lives in the browser session only.

## Technical notes

- **Recording:** replace `use-speech-input.ts` with a `use-audio-recorder` hook capturing PCM via Web Audio and encoding complete 16 kHz mono WAV blobs (avoids the fragmented-MP4/headerless-chunk failures of `MediaRecorder` timeslices). Guard against near-empty blobs before upload.
- **Transcription:** new server route `src/routes/api/transcribe.ts` accepting the WAV upload and proxying to Lovable AI `/v1/audio/transcriptions` with `openai/gpt-4o-mini-transcribe`, `stream: "true"`; the SSE body is passed through so the composer renders deltas live. Server-side size/MIME validation; the key never leaves the server.
- **Job brief parsing:** `src/lib/job-brief.functions.ts` — a `createServerFn` taking either pasted text or a base64 data URL (PDF/image), calling `google/gemini-3.6-flash` with `Output.object` for `{ title, company, responsibilities[], skills[], tone }`. Guarded with `NoObjectGeneratedError` fallback; no schema bounds.
- **State:** a `JobBriefContext` provider in `__root.tsx` backed by `sessionStorage`, hydrated in `useEffect` to avoid SSR mismatch.
- **Feedback prompt:** `getInterviewFeedback` gains an optional `jobBrief` input; when present, the system prompt instructs the coach to evaluate fit against the posting explicitly. Output schema unchanged, plus an optional `jobFit` line rendered in `FeedbackCard` when a brief exists.
- **New/changed components:** `JobPostingUpload`, `JobBriefChip`, updated `AnswerComposer` (recorder UI + live transcript), updated `SessionProgress`.
