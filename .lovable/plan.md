# Next-level interview prep: ideas and proposed first phase

The app already covers practice, feedback, memory, spoken questions, tough panelists, briefings, and promotions. These are the biggest remaining gaps between "good practice" and "walks in ready."

## Ideas, ranked by impact

1. **Story bank** — Candidates reuse 6–8 core stories in real interviews. Save the best answers as named stories (e.g. "the vendor turnaround"), tag what each proves (leadership, conflict, failure), and show which question types each story covers and where gaps remain.
2. **"Questions to ask them" coach** — Every interview ends with "Any questions for us?" Generate sharp, role-specific questions from the job posting and grade the ones the user writes.
3. **Salary and offer practice** — A short negotiation role-play: the interviewer asks for salary expectations or makes a lowball offer, and the coach scores how the candidate responds.
4. **Answer-length drill (60/90/120 seconds)** — A countdown with a gentle cutoff that trains people to land the point on time, instead of just reporting length after the fact.
5. **Panel interview simulation** — Two or three interviewer voices with different priorities (hiring manager, HR, peer) who take turns, with feedback on whether each one's concern was addressed.
6. **Re-answer comparison** — After a retry, show the first and second attempts side by side, with the score change and what improved.
7. **Day-before cheat sheet** — A one-page printable/PDF made from the briefing, the strongest stories, the weak spots to watch, and the questions to ask.
8. **Body language and delivery (camera)** — Optional webcam check for eye contact and pacing. Higher effort and privacy-sensitive, so best saved for later.

## Proposed first phase

Build 1, 2, 4 and 7: the story bank, the "questions to ask them" coach, timed answer drills, and the day-before cheat sheet. All four reuse what's already built and keep everything stored on the user's device.

## Technical notes

- The story bank is saved locally and included in the existing progress export/import file.
- The questions coach and cheat sheet each get a new AI server function that uses the existing job, resume, and promotion details.
- The timed drill is a new session option, handled entirely in the answer box. No AI is needed.
- The cheat sheet uses the browser's print-to-PDF, so no new library is needed.
