import { heardMealTrigger } from "@/lib/trigger";

export const runtime = "nodejs";

type XaiSttResponse = {
  text?: string;
  language?: string;
  duration?: number;
  words?: Array<{ text: string; start: number; end: number }>;
  error?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        text: "",
        triggered: false,
        error: "Missing XAI_API_KEY on the server.",
      },
      { status: 500 },
    );
  }

  const incoming = await request.formData().catch(() => null);
  const file = incoming?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      {
        text: "",
        triggered: false,
        error: "Upload a non-empty audio file.",
      },
      { status: 400 },
    );
  }

  const language = String(incoming?.get("language") || "ja");

  const formData = new FormData();
  formData.append("format", "true");
  formData.append("language", language);
  formData.append("keyterm", "itadakimasu");
  formData.append("keyterm", "いただきます");
  formData.append("keyterm", "jal meokgetseumnida");
  formData.append("keyterm", "잘 먹겠습니다");
  formData.append("file", file, file.name || "trigger.webm");

  const response = await fetch("https://api.x.ai/v1/stt", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as XaiSttResponse;

  if (!response.ok) {
    return Response.json(
      {
        text: "",
        triggered: false,
        error: payload.error || `xAI STT error ${response.status}`,
      },
      { status: response.status },
    );
  }

  const text = payload.text ?? "";

  return Response.json({
    ...payload,
    text,
    triggered: heardMealTrigger(text),
  });
}
