# Resume-aware coaching + session length

## What we're building

1. **Resume upload / paste**
   - Add a second card on the welcome screen for uploading or pasting a resume, alongside the existing job-posting card.
   - Parse the resume into a structured brief (summary, skills, work experience with 2–4 bullet highlights per role, education).
   - Persist it in session storage and surface it in the practice header.

2. **Resume-powered feedback**
   - Extend the feedback prompt with the resume so the coach can:
     - Rewrite the model answer using the candidate's real experience.
     - Suggest which past role or project to cite for this question.
     - Compare the resume against the job posting and flag the biggest gap.
   - Add two new feedback fields: `suggestedExperience` and `resumeGap`.
   - Render both in the feedback card when a resume is present.

3. **Session length setting**
   - Add a control on the welcome screen to choose a session size: 5, 10, 20, or all 136 questions.
   - Pass the choice to `/practice` via search params and stop the session when the limit is reached.
   - Update the progress header to show "answered / total" and add a completion screen with an option to start over.

## Why this helps

Right now the coach knows the target role but not the candidate's background. With a resume, the model answers can sound like the user's own stories instead of generic examples, and the coach can recommend which experience to lean on for each question. A session length removes the open-ended loop and gives the practice round a clear finish line.

## Technical outline

- New `src/lib/resume.ts` schema and prompt for parsing resumes.
- New `src/lib/resume-context.tsx` provider using `sessionStorage`, mirroring the job-brief context.
- New `src/components/interview/ResumeUpload.tsx` component with file/text tabs and drag-and-drop.
- Extend `src/lib/feedback-schema.ts` with `resume` input and new output fields.
- Update `src/lib/feedback.server.ts` to include resume context and a resume-vs-job comparison prompt.
- Update `src/components/interview/FeedbackCard.tsx` to show `suggestedExperience` and `resumeGap`.
- Update `src/routes/index.tsx` to add the resume card and session-length selector.
- Update `src/routes/practice.tsx` to accept `count` in search params, cap the session, and render a completion state.
- Update `src/components/interview/SessionProgress.tsx` to show "answered / count".

## Out of scope

- Saving resumes or sessions to a database; everything stays client-side/session-scoped like the existing job brief.
- Editing parsed resume details beyond re-pasting/re-uploading.
