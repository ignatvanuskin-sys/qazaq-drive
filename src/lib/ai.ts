import "server-only";
import { integrations } from "./integrations";
import { buildKnowledge, systemPrompt } from "./knowledge";
import type { Locale } from "./i18n";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AiResult =
  | { ok: true; content: string; usage?: { prompt: number; completion: number } }
  | { ok: false; error: string };

const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 22000);

/**
 * Provider-agnostic adapter for any OpenAI-compatible chat completions API.
 * Keys stay server-side: only AI_* environment variables are read here.
 */
export async function complete(
  messages: ChatTurn[],
  locale: Locale,
): Promise<AiResult> {
  if (!integrations.ai) return { ok: false, error: "ai_not_configured" };

  const knowledge = await buildKnowledge(locale);
  const payload = {
    model: process.env.AI_MODEL,
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.3),
    max_tokens: Number(process.env.AI_MAX_TOKENS ?? 500),
    messages: [
      { role: "system", content: systemPrompt(locale, knowledge) },
      ...messages.map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
    ],
  };

  try {
    const res = await fetch(`${process.env.AI_BASE_URL!.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[ai] provider error", res.status, text.slice(0, 300));
      return { ok: false, error: `ai_${res.status}` };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return { ok: false, error: "ai_empty" };

    return {
      ok: true,
      content,
      usage: {
        prompt: data.usage?.prompt_tokens ?? 0,
        completion: data.usage?.completion_tokens ?? 0,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[ai] request failed", message);
    return { ok: false, error: "ai_unreachable" };
  }
}

const LEAD_RE = /\[\[LEAD_READY:(\{[\s\S]*?\})\]\]/;

/** Extract the structured lead marker the model appends when it has enough data. */
export function extractLead(content: string): {
  text: string;
  lead: { name: string; phone: string; intent: string } | null;
} {
  const match = content.match(LEAD_RE);
  if (!match) return { text: content.trim(), lead: null };
  try {
    const parsed = JSON.parse(match[1]) as { name?: string; phone?: string; intent?: string };
    const text = content.replace(LEAD_RE, "").trim();
    if (!parsed.name || !parsed.phone) return { text, lead: null };
    return {
      text,
      lead: {
        name: String(parsed.name).slice(0, 80),
        phone: String(parsed.phone).slice(0, 30),
        intent: ["start", "price", "consult", "schedule"].includes(String(parsed.intent))
          ? String(parsed.intent)
          : "consult",
      },
    };
  } catch {
    return { text: content.replace(LEAD_RE, "").trim(), lead: null };
  }
}
