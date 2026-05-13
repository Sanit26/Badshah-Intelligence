import { Button } from "@/components/ui/button";
import { useBackend } from "@/hooks/useBackend";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ColumnStat } from "@/types";
import { streamChat } from "@/utils/openrouter";
import type { OpenRouterMessage } from "@/utils/openrouter";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Crown,
  SendHorizontal,
  Sparkles,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────
const GREETINGS = [
  "Jo hukum mere aaka ✨",
  "Farmaiye, mere aaka ✨",
  "Arz hai, mere aaka ✨",
  "Hukum kijiye, mere aaka ✨",
];

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const DATA_SUGGESTIONS = [
  "What are the key trends?",
  "What is the highest value?",
  "Summarize this data",
  "What should I focus on?",
];

// ─── Local types ──────────────────────────────────────────────────────────────
interface ChatMsg {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  greeting?: string;
  isStreaming?: boolean;
}

// ─── Chart renderer ──────────────────────────────────────────────────────────
function ChartCard({
  config,
  index,
}: {
  config: {
    chartType: string;
    title: string;
    xKey: string;
    yKeys: string[];
    data: string;
  };
  index: number;
}) {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(config.data) as Record<string, unknown>[];
    } catch {
      return [];
    }
  }, [config.data]);

  if (!parsed.length) return null;

  const renderChart = () => {
    switch (config.chartType) {
      case "bar":
        return (
          <BarChart data={parsed}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border) / 0.2)"
            />
            <XAxis
              dataKey={config.xKey}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--popover))",
                border: "1px solid oklch(var(--border) / 0.3)",
                borderRadius: "12px",
                color: "oklch(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {config.yKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={parsed}>
            <defs>
              {config.yKeys.map((key, i) => (
                <linearGradient
                  key={key}
                  id={`grad-${index}-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border) / 0.2)"
            />
            <XAxis
              dataKey={config.xKey}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--popover))",
                border: "1px solid oklch(var(--border) / 0.3)",
                borderRadius: "12px",
                color: "oklch(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {config.yKeys.map((key, i) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                fill={`url(#grad-${index}-${i})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={parsed}
              dataKey={config.yKeys[0] ?? "value"}
              nameKey={config.xKey}
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {parsed.map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: chart cells rely on index
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "oklch(var(--popover))",
                border: "1px solid oklch(var(--border) / 0.3)",
                borderRadius: "12px",
                color: "oklch(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        );
      default: // line
        return (
          <LineChart data={parsed}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--border) / 0.2)"
            />
            <XAxis
              dataKey={config.xKey}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--popover))",
                border: "1px solid oklch(var(--border) / 0.3)",
                borderRadius: "12px",
                color: "oklch(var(--foreground))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {config.yKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div
      className="glass-dark rounded-2xl p-4"
      data-ocid={`analysis.chart.item.${index + 1}`}
    >
      <h3 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        {config.title}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

// ─── Message bubbles ──────────────────────────────────────────────────────────
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({ msg }: { msg: ChatMsg }) {
  const isError = msg.role === "error";
  return (
    <div className="flex gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isError
            ? "bg-destructive/20 border border-destructive/30"
            : "gradient-accent genie-glow"
        }`}
      >
        <Crown
          className={`w-3.5 h-3.5 ${isError ? "text-destructive" : "text-primary-foreground"}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        {msg.greeting && !isError && (
          <p className="text-xs text-primary/80 font-display mb-1 font-medium">
            {msg.greeting}
          </p>
        )}
        <div
          className={`glass-dark rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isError
              ? "border-destructive/30 text-destructive"
              : "text-card-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          {msg.isStreaming && (
            <span className="inline-block w-1 h-4 bg-primary/70 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DataAnalysisPage() {
  const navigate = useNavigate();
  const { activeDashboard, parsedDataset, uploadedFiles, activeFileId } =
    useDataStore();
  const { apiKey } = useSettingsStore();
  // Initialize backend hook (ensures actor is ready, mirrors other pages)
  useBackend();

  const activeFile = useMemo(
    () =>
      uploadedFiles.find((f) => f.fileId === activeFileId) ??
      uploadedFiles[0] ??
      null,
    [uploadedFiles, activeFileId],
  );

  // ─── Chat state ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const greetingIndexRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Insert initial genie greeting when a dataset becomes available
  useEffect(() => {
    if (parsedDataset && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Data ready, mere aaka! 📊 I see ${parsedDataset.rows.length} rows and ${parsedDataset.headers.length} columns. Ask me anything about this dataset — trends, insights, summaries, aur kuch bhi! 🌟`,
          greeting: "Jo hukum mere aaka ✨",
        },
      ]);
      greetingIndexRef.current = 1;
    }
  }, [parsedDataset, messages.length]);

  const nextGreeting = useCallback(() => {
    const g = GREETINGS[greetingIndexRef.current % GREETINGS.length];
    greetingIndexRef.current += 1;
    return g;
  }, []);

  // Build system prompt with data context
  const buildSystemPrompt = useCallback(() => {
    if (!parsedDataset) return "";
    const colInfo = parsedDataset.columnStats
      .map((s: ColumnStat) => {
        let info = `${s.columnName} (${s.dataType})`;
        if (s.min !== undefined) info += ` min=${s.min}`;
        if (s.max !== undefined) info += ` max=${s.max}`;
        if (s.avg !== undefined) info += ` avg=${s.avg}`;
        return info;
      })
      .join("; ");

    return `You are Badshah Intelligence Genie, a magical data analyst.
The user has uploaded a dataset with ${parsedDataset.rows.length} rows.
Columns: ${parsedDataset.headers.join(", ")}.
Column stats: ${colInfo}.
Answer the user's questions about this data intelligently and magically.
Start each response with a short rotating Hinglish greeting like "Jo hukum mere aaka ✨", "Farmaiye, mere aaka ✨", "Arz hai, mere aaka ✨".
Be concise but insightful. Use bullet points and emojis naturally.`;
  }, [parsedDataset]);

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
            content:
              "Set your OpenRouter API key in Settings to chat with the Genie ✨",
          },
        ]);
        setInput("");
        return;
      }

      const userMsgId = `user-${Date.now()}`;
      const asstMsgId = `asst-${Date.now()}`;
      const greeting = nextGreeting();

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: trimmed },
        {
          id: asstMsgId,
          role: "assistant",
          content: "",
          greeting,
          isStreaming: true,
        },
      ]);
      setInput("");
      setIsStreaming(true);

      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map(
          (m): OpenRouterMessage => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }),
        );

      const apiMessages: OpenRouterMessage[] = [
        { role: "system", content: buildSystemPrompt() },
        ...history,
        { role: "user", content: trimmed },
      ];

      await streamChat(
        apiMessages,
        apiKey,
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === asstMsgId ? { ...m, content: m.content + token } : m,
            ),
          );
        },
        (_fullText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === asstMsgId ? { ...m, isStreaming: false } : m,
            ),
          );
          setIsStreaming(false);
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
        },
      );
    },
    [apiKey, isStreaming, messages, nextGreeting, buildSystemPrompt],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (!activeDashboard && !parsedDataset) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-8"
        data-ocid="analysis.empty_state"
      >
        <div className="glass-dark rounded-3xl p-10 max-w-md w-full text-center genie-glow">
          <div className="w-16 h-16 rounded-full gradient-accent mx-auto flex items-center justify-center mb-6">
            <Upload className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold gradient-text mb-2">
            No data yet, mere aaka
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Upload a CSV or PDF file to unlock AI-powered charts, insights, and
            your data Genie.
          </p>
          <Button
            type="button"
            className="gradient-accent text-primary-foreground rounded-xl hover:opacity-90 transition-smooth"
            onClick={() => navigate({ to: "/upload-data" })}
            data-ocid="analysis.upload.primary_button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Data
          </Button>
        </div>
      </div>
    );
  }

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex flex-col h-full gap-4" data-ocid="analysis.page">
      {/* ─── Top Banner ───────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 glass-dark rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-full gradient-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            {activeFile ? (
              <p className="font-display font-semibold text-foreground truncate">
                {activeFile.fileName}
              </p>
            ) : (
              <p className="font-display font-semibold gradient-text">
                Data Analysis
              </p>
            )}
            {parsedDataset && (
              <p className="text-xs text-muted-foreground">
                {parsedDataset.rows.length} rows, {parsedDataset.headers.length}{" "}
                columns
              </p>
            )}
            {activeDashboard && !parsedDataset && (
              <p className="text-xs text-muted-foreground">
                Dashboard ready · {activeDashboard.kpis.length} KPIs
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden sm:block text-xs text-primary/70 italic">
            Jo hukum mere aaka ✨ — Your data awaits analysis
          </p>
          <Link
            to="/upload-data"
            className="text-xs text-primary underline underline-offset-2 hover:text-accent transition-smooth flex items-center gap-1"
            data-ocid="analysis.upload.link"
          >
            <Upload className="w-3 h-3" /> Upload new file
          </Link>
        </div>
      </div>

      {/* ─── Main Two-Zone Layout ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0">
        {/* LEFT — Chart Gallery (45%) */}
        <div
          className="w-full lg:w-[45%] flex flex-col gap-4 overflow-y-auto pb-2 pr-1"
          data-ocid="analysis.charts.panel"
        >
          {/* Charts */}
          <div className="glass-dark rounded-2xl p-4">
            <h2 className="font-display text-base font-bold gradient-text mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Chart Gallery
            </h2>

            {activeDashboard && activeDashboard.chartConfigs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {activeDashboard.chartConfigs.map((cfg, i) => (
                  <ChartCard key={cfg.title} config={cfg} index={i} />
                ))}
              </div>
            ) : activeDashboard && activeDashboard.chartConfigs.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 text-center gap-3"
                data-ocid="analysis.charts.empty_state"
              >
                <span className="text-3xl" role="img" aria-label="genie">
                  🧞
                </span>
                <p className="text-sm text-muted-foreground max-w-xs">
                  No charts available for this dataset, mere aaka — try
                  uploading a CSV with numeric columns for automatic charts ✨
                </p>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-10 text-center"
                data-ocid="analysis.charts.loading_state"
              >
                <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">
                  Genie is preparing your charts…
                </p>
              </div>
            )}
          </div>

          {/* AI Insights */}
          {activeDashboard && activeDashboard.aiInsights.length > 0 && (
            <div
              className="glass-dark rounded-2xl p-4"
              data-ocid="analysis.insights.panel"
            >
              <h2 className="font-display text-base font-bold gradient-text mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Genie Insights
              </h2>
              <div className="flex flex-col gap-2">
                {activeDashboard.aiInsights.map((insight, i) => (
                  <div
                    key={insight}
                    className="glass rounded-xl px-4 py-3 border border-primary/20 genie-glow"
                    data-ocid={`analysis.insights.item.${i + 1}`}
                  >
                    <p className="text-sm text-card-foreground leading-relaxed">
                      <span className="text-primary mr-2">✨</span>
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Genie Chat (55%) */}
        <div
          className="w-full lg:w-[55%] flex flex-col glass-dark rounded-2xl overflow-hidden genie-glow"
          data-ocid="analysis.chat.panel"
        >
          {/* Chat header */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border/20">
            <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold gradient-text">
                Ask the Genie
              </h2>
              <p className="text-xs text-muted-foreground">
                Data-aware AI assistant
              </p>
            </div>
            {isStreaming && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-primary animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Thinking…
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Crown className="w-8 h-8 text-primary/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Ask me about your data…
                </p>
              </div>
            )}

            {messages.map((msg) =>
              msg.role === "user" ? (
                <UserBubble key={msg.id} content={msg.content} />
              ) : (
                <AssistantBubble key={msg.id} msg={msg} />
              ),
            )}

            {/* Quick suggestions */}
            {showSuggestions && parsedDataset && (
              <div
                className="flex flex-wrap gap-2 pt-1"
                data-ocid="analysis.suggestions.list"
              >
                {DATA_SUGGESTIONS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1.5 rounded-xl glass border border-primary/20 text-xs text-primary/80 hover:border-primary/50 hover:text-primary transition-smooth"
                    data-ocid={`analysis.suggestions.item.${i + 1}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-border/20 px-4 py-3">
            {!apiKey && (
              <div
                className="mb-2 text-xs text-muted-foreground"
                data-ocid="analysis.chat.error_state"
              >
                <span className="text-destructive mr-1">⚠️</span>
                Set your OpenRouter API key in{" "}
                <Link
                  to="/settings"
                  className="text-primary underline underline-offset-2"
                  data-ocid="analysis.settings.link"
                >
                  Settings
                </Link>{" "}
                to chat with the Genie ✨
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Apne data ke baare mein poochein…"
                disabled={isStreaming}
                className="flex-1 min-w-0 bg-background/40 border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-smooth"
                data-ocid="analysis.chat.input"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="flex-shrink-0 rounded-xl w-9 h-9 gradient-accent hover:opacity-90 transition-smooth disabled:opacity-40"
                aria-label="Send message"
                data-ocid="analysis.chat.submit_button"
              >
                <SendHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
