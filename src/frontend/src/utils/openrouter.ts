// ─── OpenRouter Streaming Chat Utility ───────────────────────────────────────

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function streamChat(
  messages: OpenRouterMessage[],
  apiKey: string,
  onToken: (token: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: Error) => void,
  model = DEFAULT_MODEL,
): Promise<void> {
  if (!apiKey) {
    onError(new Error("OpenRouter API key is not configured."));
    return;
  }

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Badshah Intelligence",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      onError(new Error(`OpenRouter error ${res.status}: ${errText}`));
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError(new Error("No response body"));
      return;
    }

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter((l) => l.trim().startsWith("data:"));

      for (const line of lines) {
        const data = line.slice(5).trim();
        if (data === "[DONE]") break;
        try {
          const json = JSON.parse(data) as {
            choices: Array<{ delta: { content?: string } }>;
          };
          const token = json.choices?.[0]?.delta?.content ?? "";
          if (token) {
            fullText += token;
            onToken(token);
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    onDone(fullText);
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
