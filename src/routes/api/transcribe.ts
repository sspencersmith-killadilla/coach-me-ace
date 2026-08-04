import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["audio/wav", "audio/wave", "audio/x-wav"];

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "Transcription is not configured yet." }, { status: 500 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Expected an audio upload." }, { status: 400 });
        }

        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) {
          return Response.json({ error: "No audio was received." }, { status: 400 });
        }
        if (file.size > MAX_BYTES) {
          return Response.json({ error: "That recording is too long to transcribe." }, { status: 413 });
        }
        if (file.type && !ALLOWED_TYPES.includes(file.type)) {
          return Response.json({ error: "Unsupported audio format." }, { status: 400 });
        }

        const upstreamBody = new FormData();
        upstreamBody.append("model", "openai/gpt-4o-mini-transcribe");
        upstreamBody.append("file", file, "recording.wav");
        upstreamBody.append("stream", "true");

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstreamBody,
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("Transcription failed", upstream.status, detail);
          const message =
            upstream.status === 429
              ? "The coach is catching their breath — try again in a moment."
              : upstream.status === 402
                ? "AI credits have run out. Add more credits to keep practicing."
                : "We couldn't transcribe that recording. Please try again.";
          return Response.json({ error: message }, { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
