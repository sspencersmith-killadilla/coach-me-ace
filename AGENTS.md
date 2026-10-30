<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Project rules
- Prep tools (story bank, ask-them, negotiation, panel, cheat sheet) share one AI module (`src/lib/prep.server.ts` + `prep.functions.ts`) so prompts and error handling stay consistent.
- Story bank and saved questions live in localStorage (`src/lib/prep-store.ts`) and travel in the progress export file — no server storage, to keep the "nothing on our servers" promise.
