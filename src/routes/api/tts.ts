import { createFileRoute } from "@tanstack/react-router";

const MAX_CHARS = 800;

const VOICES = {
  warm: {
    voice: "alloy",
    instructions:
      "Speak like a friendly, unhurried interviewer. Warm, encouraging, natural pacing, a small smile in the voice.",
  },
  tough: {
    voice: "onyx",
    instructions:
      "Speak like a cool, unimpressed senior panelist. Flat, measured, slightly clipped. Professional but not friendly. No warmth, no smile.",
  },
} as const;

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "Spoken questions are not configured yet." }, { status: 500 });
        }

        let payload: { text?: unknown; tone?: unknown };
        try {
          payload = (await request.json()) as { text?: unknown; tone?: unknown };
        } catch {
          return Response.json({ error: "Expected a question to read." }, { status: 400 });
        }

        const text = typeof payload.text === "string" ? payload.text.trim().slice(0, MAX_CHARS) : "";
        if (!text) {
          return Response.json({ error: "Nothing to read aloud." }, { status: 400 });
        }
        const tone = payload.tone === "tough" ? "tough" : "warm";
        const persona = VOICES[tone];

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice: persona.voice,
            instructions: persona.instructions,
            response_format: "mp3",
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          console.error("Text-to-speech failed", upstream.status, detail);
          const message =
            upstream.status === 429
              ? "The interviewer needs a moment — try again shortly."
              : upstream.status === 402
                ? "AI credits have run out. Add more credits to keep practicing."
                : "Couldn't read that question aloud just now.";
          return Response.json({ error: message }, { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
