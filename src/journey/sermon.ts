import { createServerFn } from "@tanstack/react-start";

type SplitOk = { ok: true; points: string[] };
type SplitErr = { ok: false; error: string };
export type SplitResult = SplitOk | SplitErr;

export const splitSermon = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => {
    const text = typeof input?.text === "string" ? input.text.trim() : "";
    return { text };
  })
  .handler(async ({ data }): Promise<SplitResult> => {
    const text = data.text;
    if (text.length < 40) return { ok: false, error: "A little more of the sermon is needed." };
    if (text.length > 12000) return { ok: false, error: "Keep it to one sitting of notes." };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "Breaking a recording into points is not available here yet." };

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
              "You extract the speaker's own points from a sermon or Christian podcast. Return JSON only: {\"points\":[\"...\"]}. 4 to 12 short points. Use the speaker's language. Do not add counsel, diagnosis, application, or verses they did not say. Do not moralise.",
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
      const parsed = JSON.parse(raw.slice(start, end + 1)) as { points?: unknown };
      const points = Array.isArray(parsed.points)
        ? parsed.points.map((p) => String(p).trim()).filter((p) => p.length > 0).slice(0, 12)
        : [];
      if (!points.length) return { ok: false, error: "Nothing clear enough to keep yet." };
      return { ok: true, points };
    } catch {
      return { ok: false, error: "Nothing clear enough to keep yet." };
    }
  });
