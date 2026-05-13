import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { VoiceLanguage } from "@/types";
import { streamChat } from "@/utils/openrouter";
import type { OpenRouterMessage } from "@/utils/openrouter";
import {
  JINN_VOICE_ID,
  clearQueue,
  enqueueSentence,
  isElevenLabsConfigured,
  isSpeechSupported,
  stopSpeech,
} from "@/utils/voice";
import { Link } from "@tanstack/react-router";
import { Crown, SendHorizontal, Trash2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Genie Greeting Rotation ─────────────────────────────────────────────────
const GREETINGS = [
  "Jo hukum mere aaka ✨",
  "Farmaiye, mere aaka ✨",
  "Arz hai, mere aaka ✨",
  "Hukum kijiye, mere aaka ✨",
];

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Badshah Intelligence (BI), an advanced AI assistant with a royal Genie (Jinn) personality inspired by the Aladdin Jinn.
Always start responses with a short Hinglish/Urdu genie greeting like "Jo hukum mere aaka ✨", "Farmaiye, mere aaka ✨", "Arz hai, mere aaka ✨", or "Hukum kijiye, mere aaka ✨".
Speak in a warm, dramatic, regal Hinglish tone — mix Hindi and English naturally. Use phrases like "mere aaka", "hukum", "farmaiye", "haazir hoon", "arz hai".
For business/analytics topics: give clear definitions, relatable analogies, small examples.
Keep responses concise (5-15 lines), use bullet points naturally.
Be elegantly wise like a loyal royal Jinn — dramatic but never cartoonish.
When speaking aloud your response will be in Hindi/Hinglish, so write it in a way that sounds natural when spoken.`;

// ─── Quick Start Suggestions ─────────────────────────────────────────────────
const SUGGESTIONS = [
  "What is KPI?",
  "Revenue kya hai?",
  "Help me analyze data",
  "Mujhe dashboard samjhao",
];

// ─── Sentence boundary regex ─────────────────────────────────────────────────
// Splits on . ! ? । — but not on decimals like 3.14
const SENTENCE_END = /(?<=[.!?।])\s+(?=[A-ZÀ-Ö\u0900-\u097F])|(?<=[.!?।])\s*$/;

/** Extract complete sentences from a buffer; return [sentences[], remainder] */
function extractSentences(buffer: string): [string[], string] {
  // Split on sentence boundaries
  const parts = buffer.split(/(?<=[.!?।])\s+/);
  if (parts.length <= 1) return [[], buffer];
  const complete = parts.slice(0, -1);
  const remainder = parts[parts.length - 1];
  return [complete, remainder];
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  greeting?: string;
  isStreaming?: boolean;
}

// ─── Message Bubbles ──────────────────────────────────────────────────────────
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({
  message,
  isSpeaking,
}: {
  message: Message;
  isSpeaking: boolean;
}) {
  const isError = message.role === "error";
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isError
            ? "bg-destructive/20 border border-destructive/30"
            : "gradient-accent genie-glow"
        }`}
      >
        <Crown
          className={`w-4 h-4 ${
            isError ? "text-destructive" : "text-primary-foreground"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        {message.greeting && !isError && (
          <p className="text-xs text-primary/80 font-display mb-1 font-medium">
            {message.greeting}
          </p>
        )}
        <div
          className={`glass-dark rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isError
              ? "border-destructive/30 text-destructive"
              : "text-card-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          {message.isStreaming && (
            <span className="inline-block w-1 h-4 bg-primary/70 animate-pulse ml-0.5 align-middle" />
          )}
        </div>

        {isSpeaking && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs text-muted-foreground">Jinn bol raha hai… 🎙️</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Assistant Page ───────────────────────────────────────────────────────────
export default function AssistantPage() {
  const { apiKey, elevenLabsKey, voiceLanguage, voiceEngine } = useSettingsStore();

  const usingElevenLabs = voiceEngine === "elevenlabs" && isElevenLabsConfigured(elevenLabsKey);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Main Badshah Intelligence hoon — aapka royal Jinn! 🧞‍♂️ Koi bhi business sawaal poochein, data ke baare mein jaanna chahein, ya analytics samajhna ho — main haazir hoon! Jo hukum mere aaka. 🌟",
      greeting: "Jo hukum mere aaka ✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const greetingIndexRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Buffer for partial sentence during streaming
  const sentenceBufferRef = useRef("");
  const currentMsgIdRef = useRef<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const nextGreeting = useCallback(() => {
    const g = GREETINGS[greetingIndexRef.current % GREETINGS.length];
    greetingIndexRef.current += 1;
    return g;
  }, []);

  /** Enqueue one sentence for immediate playback */
  const speakSentence = useCallback(
    (sentence: string, msgId: string, isFirst: boolean) => {
      enqueueSentence(sentence, {
        lang: voiceLanguage as "en-US" | "hi-IN",
        useElevenLabs: usingElevenLabs,
        apiKey: elevenLabsKey,
        voiceId: JINN_VOICE_ID,
        onStart: isFirst
          ? () => {
              setSpeakingMsgId(msgId);
              setIsSpeaking(true);
            }
          : undefined,
        onEnd: () => {
          setIsSpeaking(false);
          setSpeakingMsgId(null);
        },
      });
    },
    [voiceLanguage, usingElevenLabs, elevenLabsKey],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      if (!apiKey) {
        setMessages((prev) => [
          ...prev,
          { id: `user-${Date.now()}`, role: "user", content: trimmed },
          {
            id: `err-${Date.now()}`,
            role: "error",
            content: "Aapka OpenRouter API key nahin mila. Settings mein set karein.",
          },
        ]);
        return;
      }

      const userMsgId = `user-${Date.now()}`;
      const asstMsgId = `asst-${Date.now()}`;
      const greeting = nextGreeting();

      // Reset sentence buffer for new message
      sentenceBufferRef.current = "";
      currentMsgIdRef.current = asstMsgId;
      let firstSentenceSpoken = false;

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: trimmed },
        { id: asstMsgId, role: "assistant", content: "", greeting, isStreaming: true },
      ]);
      setInput("");
      setIsStreaming(true);

      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-9)
        .map((m): OpenRouterMessage => ({ role: m.role as "user" | "assistant", content: m.content }));

      const apiMessages: OpenRouterMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: trimmed },
      ];

      await streamChat(
        apiMessages,
        apiKey,
        // ── Token callback: detect sentences and speak immediately ──
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === asstMsgId ? { ...m, content: m.content + token } : m,
            ),
          );

          if (voiceEnabled) {
            sentenceBufferRef.current += token;
            const [sentences, remainder] = extractSentences(sentenceBufferRef.current);
            if (sentences.length > 0) {
              for (const sentence of sentences) {
                if (sentence.trim()) {
                  speakSentence(sentence.trim(), asstMsgId, !firstSentenceSpoken);
                  firstSentenceSpoken = true;
                }
              }
              sentenceBufferRef.current = remainder;
            }
          }
        },
        // ── Complete callback: speak any leftover text ──
        (_fullText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === asstMsgId ? { ...m, isStreaming: false } : m,
            ),
          );
          setIsStreaming(false);

          if (voiceEnabled) {
            const leftover = sentenceBufferRef.current.trim();
            if (leftover) {
              speakSentence(leftover, asstMsgId, !firstSentenceSpoken);
            }
            sentenceBufferRef.current = "";
          }
        },
        (_err) => {
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== asstMsgId),
            {
              id: `err-${Date.now()}`,
              role: "error",
              content: "Kuch masla ho gaya, mere aaka. Please try again. 🙏",
            },
          ]);
          setIsStreaming(false);
          clearQueue();
        },
      );
    },
    [apiKey, isStreaming, messages, voiceEnabled, speakSentence, nextGreeting],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = () => {
    clearQueue();
    setIsSpeaking(false);
    setSpeakingMsgId(null);
    sentenceBufferRef.current = "";
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Main Badshah Intelligence hoon — aapka royal Jinn! 🧞‍♂️ Koi bhi business sawaal poochein, data ke baare mein jaanna chahein, ya analytics samajhna ho — main haazir hoon! Jo hukum mere aaka. 🌟",
        greeting: "Jo hukum mere aaka ✨",
      },
    ]);
    greetingIndexRef.current = 1;
    setInput("");
    inputRef.current?.focus();
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      clearQueue();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }
    setVoiceEnabled((v) => !v);
  };

  const showSuggestions = messages.length === 1 && messages[0].id === "welcome";

  return (
    <div
      className="flex flex-col h-[calc(100vh-5rem)] lg:h-[calc(100vh-3rem)]"
      data-ocid="assistant.page"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold gradient-text">
            AI Assistant
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Badshah Intelligence — Your Royal Jinn 🧞‍♂️
          </p>
        </div>

        <div className="flex items-center gap-2">
          {voiceEnabled && (
            <Badge
              variant="outline"
              className={`text-xs gap-1.5 ${
                usingElevenLabs
                  ? "border-emerald-500/40 text-emerald-400"
                  : "border-primary/40 text-primary"
              }`}
            >
              🎙️ {usingElevenLabs ? "Jinn Voice (ElevenLabs)" : "Browser Voice"}
            </Badge>
          )}
          {isSpeaking && (
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/40 text-primary animate-pulse"
              data-ocid="assistant.speaking.loading_state"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Bol raha hai…
            </Badge>
          )}
          {isStreaming && (
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/40 text-primary"
              data-ocid="assistant.thinking.loading_state"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
              Soch raha hai…
            </Badge>
          )}
        </div>
      </div>

      {/* ElevenLabs setup nudge */}
      {voiceEnabled && !usingElevenLabs && (
        <div className="flex-shrink-0 mb-3 flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/15 rounded-xl px-4 py-2.5">
          <span>🎙️</span>
          <span>
            Asli Jinn awaaz ke liye{" "}
            <Link to="/settings" className="text-primary underline underline-offset-2">
              Settings mein ElevenLabs key lagaayein
            </Link>{" "}
            — free tier available at{" "}
            <a
              href="https://elevenlabs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              elevenlabs.io
            </a>
          </span>
        </div>
      )}

      {/* Chat Container */}
      <div
        className="flex-1 flex flex-col glass-dark rounded-2xl overflow-hidden genie-glow"
        data-ocid="assistant.panel"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scroll-smooth">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <UserBubble key={msg.id} content={msg.content} />
            ) : (
              <AssistantBubble
                key={msg.id}
                message={msg}
                isSpeaking={isSpeaking && speakingMsgId === msg.id}
              />
            ),
          )}

          {showSuggestions && (
            <div className="flex flex-wrap gap-2 pt-2" data-ocid="assistant.suggestions.list">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 rounded-xl glass border border-primary/20 text-sm text-primary/80 hover:border-primary/50 hover:text-primary transition-smooth"
                  data-ocid={`assistant.suggestions.item.${i + 1}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!apiKey && messages.some((m) => m.role === "error") && (
            <div className="flex justify-center">
              <Link
                to="/settings"
                className="text-xs text-primary underline underline-offset-2 hover:text-accent transition-smooth"
                data-ocid="assistant.settings.link"
              >
                ⚙️ Settings mein API key set karein →
              </Link>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 border-t border-border/20 px-4 py-3">
          {!apiKey && (
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground" data-ocid="assistant.error_state">
              <span className="text-destructive">⚠️</span>
              <span>
                OpenRouter API key nahin mila.{" "}
                <Link to="/settings" className="text-primary underline underline-offset-2" data-ocid="assistant.settings_link">
                  Settings mein set karein
                </Link>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Voice toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleVoice}
              aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
              title={voiceEnabled ? `Voice ON — ${usingElevenLabs ? "Jinn (ElevenLabs)" : "Browser"}` : "Enable Jinn Voice"}
              className={`flex-shrink-0 rounded-xl transition-smooth ${
                voiceEnabled
                  ? "text-primary bg-primary/10 border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="assistant.voice.toggle"
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hukum kijiye, mere aaka… 🧞‍♂️"
              disabled={isStreaming}
              className="flex-1 min-w-0 bg-background/40 border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-smooth"
              data-ocid="assistant.input"
            />

            {/* Send */}
            <Button
              type="button"
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 rounded-xl w-10 h-10 gradient-accent hover:opacity-90 transition-smooth disabled:opacity-40"
              aria-label="Send message"
              data-ocid="assistant.submit_button"
            >
              <SendHorizontal className="w-4 h-4" />
            </Button>

            {/* Clear */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              aria-label="Clear chat"
              className="flex-shrink-0 rounded-xl text-muted-foreground hover:text-destructive transition-smooth"
              data-ocid="assistant.delete_button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
