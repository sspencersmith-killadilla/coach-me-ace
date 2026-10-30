# Build and publish prep features 1–7

## What gets built

1. **Story bank:** Save any answer as a named story and tag what it proves (leadership, conflict, failure, and so on). A coverage view shows which question types each story handles and where the gaps are.
2. **"Questions to ask them" coach:** Get role-specific questions to ask at the end of the interview, based on the job posting, resume, or promotion details. You can also write your own and get them graded.
3. **Salary and offer practice:** A short negotiation role-play covering salary expectations, a lowball offer, and a counter. Each reply is scored with coaching.
4. **Timed answer drill:** Pick a 60, 90, or 120 second limit. A visible countdown runs while you answer and gives a gentle cutoff warning.
5. **Panel interview simulation:** Three interviewers (hiring manager, HR, peer) take turns, each with their own voice and priorities. At the end, you see whether each one's concern was addressed.
6. **Re-answer comparison:** After a retry, your first and second attempts show side by side with the score change and what improved.
7. **Day-before cheat sheet:** A printable one-pager with your fit briefing, top stories, weak spots to watch, and your questions to ask.

The welcome screen gets entry points for the story bank, questions coach, negotiation practice, panel mode, the timed drill option, and the cheat sheet. Once everything works, the app is published to your live site.

## Technical notes

- The story bank and comparison history are saved on the device and included in the progress export/import file. Nothing is stored on a server.
- New AI server functions are added for the questions coach, negotiation turns and scoring, and panel feedback. They reuse the existing gateway helper and the job, resume, and promotion details.
- Panel mode adds a new `panel` session mode with rotating interviewer personas and voices through the existing text-to-speech route.
- New pages for the story bank, questions coach, negotiation, and cheat sheet. The cheat sheet uses browser print-to-PDF.
- Each new AI call is checked once live, and the main flows are tested in the browser before publishing.
