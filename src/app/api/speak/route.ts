export const runtime = "nodejs";

type SpeakRequest = {
  text?: string;
  voiceId?: string;
  language?: string;
};

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;
  const body = (await request.json().catch(() => ({}))) as SpeakRequest;
  const text = cleanText(body.text);

  if (!text) {
    return Response.json({ ok: false, error: "Missing text." }, { status: 400 });
  }

  if (!apiKey) {
    return Response.json(
      { ok: false, error: "Missing XAI_API_KEY on the server." },
      { status: 503 },
    );
  }

  const response = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice_id: body.voiceId || process.env.XAI_TTS_VOICE_ID || "eve",
      language: body.language || "en",
      output_format: {
        codec: "mp3",
        sample_rate: 24000,
        bit_rate: 128000,
      },
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return Response.json(
      {
        ok: false,
        error:
          typeof payload?.error === "string"
            ? payload.error
            : `xAI TTS error ${response.status}`,
      },
      { status: response.status },
    );
  }

  const audio = await response.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
