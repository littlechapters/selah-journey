import { createServerFn } from "@tanstack/react-start";

type SplitOk = { ok: true; points: string[]; title: string };
type SplitErr = { ok: false; error: string };
export type SplitResult = SplitOk | SplitErr;

export const splitSermon = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => {
    const text = typeof input?.text === "string" ? input.text.trim() : "";
    return { text };
  })
  .handler(async ({ data }): Promise<SplitResult> => {
    const text = data.text;
    if (text.length < 40) return { ok: false, error: "A little more of what was said is needed." };
    if (text.length > 12000) return { ok: false, error: "Keep it to one sitting of notes." };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Breaking this into points is not available here yet." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 900,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              'You extract the speaker\'s own points from a sermon or Christian podcast. Return JSON only: {"title":"...","points":["..."]}. Title: 2 to 7 words, from their language, no slogan. 4 to 12 short points. Use the speaker\'s language. Do not add counsel, diagnosis, application, or verses they did not say. Do not moralise. Do not invent action items.',
          },
          { role: "user", content: text },
        ],
      }),
    });

    if (!res.ok) return { ok: false, error: "The notes could not be broken up just now." };

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return { ok: false, error: "Nothing clear enough to keep yet." };
    try {
      const parsed = JSON.parse(raw.slice(start, end + 1)) as { points?: unknown; title?: unknown };
      const points = Array.isArray(parsed.points)
        ? parsed.points.map((p) => String(p).trim()).filter((p) => p.length > 0).slice(0, 12)
        : [];
      if (!points.length) return { ok: false, error: "Nothing clear enough to keep yet." };
      const title = typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim().slice(0, 80) : "What was said";
      return { ok: true, points, title };
    } catch {
      return { ok: false, error: "Nothing clear enough to keep yet." };
    }
  });

type TranscribeOk = { ok: true; text: string };
type TranscribeErr = { ok: false; error: string };
export type TranscribeResult = TranscribeOk | TranscribeErr;

export const transcribeSermon = createServerFn({ method: "POST" })
  .validator((input: { wav: string }) => {
    const wav = typeof input?.wav === "string" ? input.wav : "";
    return { wav };
  })
  .handler(async ({ data }): Promise<TranscribeResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Hearing this back is not available here yet." };
    if (data.wav.length < 800) return { ok: false, error: "Nothing was heard yet." };
    if (data.wav.length > 16_000_000) return { ok: false, error: "Keep this sitting a little shorter." };

    let bytes: Uint8Array;
    try {
      bytes = Uint8Array.from(atob(data.wav), (c) => c.charCodeAt(0));
    } catch {
      return { ok: false, error: "The recording could not be read." };
    }

    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const form = new FormData();
    form.append("file", new Blob([copy], { type: "audio/wav" }), "sitting.wav");
    form.append("language", "en");
    form.append("format", "true");

    const res = await fetch("https://api.x.ai/v1/stt", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) return { ok: false, error: "The words could not be taken down just now." };

    const body = (await res.json()) as { text?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (text.length < 8) return { ok: false, error: "Nothing clear enough to keep yet." };
    return { ok: true, text: text.slice(0, 12000) };
  });
