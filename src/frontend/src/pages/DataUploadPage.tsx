import { Button } from "@/components/ui/button";
import { useBackend } from "@/hooks/useBackend";
import { useDataStore } from "@/stores/useDataStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type {
  ChartConfig,
  ColumnStat,
  DashboardConfig,
  FileMetadata,
  KpiConfig,
  ParsedDataset,
} from "@/types";
import { streamChat } from "@/utils/openrouter";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Microscope,
  UploadCloud,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

// ─── Upload phase types ───────────────────────────────────────────────────────
type Phase = "idle" | "reading" | "parsing" | "generating" | "done" | "error";

const HINGLISH_GREETINGS = [
  "Farmaiye mere aaka… Drop your data and I shall reveal its secrets ✨",
  "Jo hukum mere aaka… Share your data and I'll conjure insights ✨",
  "Arz hai, mere aaka… Upload your file and watch the magic unfold ✨",
  "Hukum kijiye mere aaka… Your data awaits my royal analysis ✨",
];

const randomGreeting = () =>
  HINGLISH_GREETINGS[Math.floor(Math.random() * HINGLISH_GREETINGS.length)];

// ─── CSV parser ───────────────────────────────────────────────────────────────
function parseCSV(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const vals = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = vals[i] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

// ─── Column statistics ────────────────────────────────────────────────────────
function computeColumnStats(
  headers: string[],
  rows: Record<string, string>[],
): ColumnStat[] {
  return headers.map((col) => {
    const vals = rows.map((r) => r[col] ?? "").filter((v) => v !== "");
    const nums = vals.map(Number).filter((n) => !Number.isNaN(n));
    if (nums.length > vals.length * 0.6 && nums.length > 0) {
      const sorted = [...nums].sort((a, b) => a - b);
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      return {
        columnName: col,
        dataType: "number" as const,
        min: String(sorted[0]),
        max: String(sorted[sorted.length - 1]),
        avg: avg.toFixed(2),
      };
    }
    const unique = [...new Set(vals)];
    if (unique.length <= 20) {
      return {
        columnName: col,
        dataType: "text" as const,
        uniqueValues: unique,
      };
    }
    return { columnName: col, dataType: "text" as const };
  });
}

// ─── Dashboard config builder ─────────────────────────────────────────────────
function buildDashboardConfig(
  fileId: string,
  columnStats: ColumnStat[],
  rows: Record<string, string>[],
): { config: Omit<DashboardConfig, "aiInsights">; numericCols: string[] } {
  const numericCols = columnStats
    .filter((c) => c.dataType === "number")
    .map((c) => c.columnName);

  const kpis: KpiConfig[] = numericCols.slice(0, 4).map((col) => {
    const stat = columnStats.find((c) => c.columnName === col)!;
    const lastVal =
      rows.length > 0
        ? (rows[rows.length - 1][col] ?? stat.max ?? "0")
        : (stat.max ?? "0");
    const first = rows.length > 0 ? Number(rows[0][col] ?? 0) : 0;
    const last = Number(lastVal);
    const pctChange =
      first !== 0
        ? (((last - first) / Math.abs(first)) * 100).toFixed(1)
        : "0.0";
    const trend: KpiConfig["trend"] =
      Number(pctChange) > 0 ? "up" : Number(pctChange) < 0 ? "down" : "neutral";
    return {
      title: col,
      value: last >= 1000 ? `${(last / 1000).toFixed(1)}K` : String(last),
      change: `${Number(pctChange) >= 0 ? "+" : ""}${pctChange}%`,
      trend,
    };
  });

  const chartConfigs: ChartConfig[] = [];
  if (numericCols.length >= 1) {
    const chartData = rows.slice(0, 20).map((r, i) => {
      const obj: Record<string, string | number> = { index: i + 1 };
      for (const c of numericCols.slice(0, 3)) {
        obj[c] = Number(r[c] ?? 0);
      }
      return obj;
    });
    if (numericCols.length >= 1) {
      chartConfigs.push({
        chartType: "line",
        title: `${numericCols[0]} Trend`,
        xKey: "index",
        yKeys: numericCols.slice(0, 2),
        data: JSON.stringify(chartData),
      });
    }
    if (numericCols.length >= 2) {
      chartConfigs.push({
        chartType: "bar",
        title: `${numericCols[0]} vs ${numericCols[1]}`,
        xKey: "index",
        yKeys: numericCols.slice(0, 2),
        data: JSON.stringify(chartData),
      });
    }
  }

  return {
    config: { fileId, kpis, chartConfigs, generatedAt: Date.now() },
    numericCols,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DataUploadPage() {
  const navigate = useNavigate();
  const { actor } = useBackend();
  const { apiKey } = useSettingsStore();
  const {
    setActiveDashboard,
    setParsedDataset,
    setActiveFileId,
    setIsGenerating,
    setUploadProgress,
    setFiles,
  } = useDataStore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [isDragOver, setIsDragOver] = useState(false);
  const [greeting] = useState(randomGreeting);
  const [statusMsg, setStatusMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    rows: number;
    cols: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "csv" && ext !== "pdf") {
        setErrorMsg("Sirf CSV ya PDF files accept hoti hain, mere aaka ✨");
        setPhase("error");
        return;
      }

      try {
        // ── READING ────────────────────────────────────────────────
        setPhase("reading");
        setStatusMsg("Reading your file...");
        setProgress(10);

        const text = await file.text();

        // ── PARSING ────────────────────────────────────────────────
        setPhase("parsing");
        setStatusMsg("Parsing your data...");
        setProgress(30);

        let headers: string[] = [];
        let rows: Record<string, string>[] = [];
        let dataPreview = "";
        const fileType = ext as "csv" | "pdf";

        if (ext === "csv") {
          const parsed = parseCSV(text);
          headers = parsed.headers;
          rows = parsed.rows;
          dataPreview = text.slice(0, 500);
        } else {
          // PDF: store raw text snippet
          headers = ["content"];
          rows = text
            .slice(0, 2000)
            .split(/\n+/)
            .filter((l) => l.trim())
            .map((l) => ({ content: l }));
          dataPreview = text.slice(0, 500);
        }

        setProgress(55);
        const columnStats = computeColumnStats(headers, rows);
        const dataset: ParsedDataset = { headers, rows, columnStats };
        setParsedDataset(dataset);

        // ── GENERATING ─────────────────────────────────────────────
        setPhase("generating");
        setIsGenerating(true);
        setStatusMsg("Genie is analyzing your data, mere aaka...");
        setProgress(65);
        setUploadProgress(65);

        const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const { config: dashBase } = buildDashboardConfig(
          fileId,
          columnStats,
          rows,
        );

        setProgress(80);
        setUploadProgress(80);

        // Generate AI insights
        let aiInsights: string[] = [];
        const statsJson = JSON.stringify(
          columnStats.slice(0, 8).map((c) => ({
            col: c.columnName,
            type: c.dataType,
            min: c.min,
            max: c.max,
            avg: c.avg,
            uniqueValues: c.uniqueValues?.slice(0, 5),
          })),
        );

        if (apiKey) {
          await new Promise<void>((resolve) => {
            let collected = "";
            streamChat(
              [
                {
                  role: "system",
                  content:
                    "You are Badshah Intelligence Genie. Return ONLY a JSON array of 3 short business insight strings. No markdown, no explanation.",
                },
                {
                  role: "user",
                  content: `Given this dataset summary: ${statsJson}, provide 3 short, magical business insights as a JSON array of strings. Keep each under 20 words.`,
                },
              ],
              apiKey,
              () => {},
              (full) => {
                collected = full;
                try {
                  const clean = collected.replace(/```[\w]*\n?/g, "").trim();
                  const parsed = JSON.parse(clean) as string[];
                  if (Array.isArray(parsed)) aiInsights = parsed.slice(0, 3);
                } catch {
                  // fallback below
                }
                resolve();
              },
              () => {
                resolve();
              },
            );
          });
        }

        // Fallback insights if AI failed or no key
        if (aiInsights.length === 0) {
          const numericCols = columnStats.filter(
            (c) => c.dataType === "number",
          );
          aiInsights = [
            numericCols.length > 0
              ? `${numericCols[0].columnName} ranges from ${numericCols[0].min} to ${numericCols[0].max} — notable variance detected ✨`
              : `Your dataset has ${headers.length} columns ready for deep analysis ✨`,
            `${rows.length} data rows loaded — pattern recognition primed ✨`,
            `${columnStats.filter((c) => c.dataType === "text").length} categorical dimensions found for segmentation ✨`,
          ];
        }

        setProgress(92);
        setUploadProgress(92);

        const finalDashboard: DashboardConfig = {
          ...dashBase,
          aiInsights,
          generatedAt: Date.now(),
        };

        // ── Metadata ───────────────────────────────────────────────
        const metadata: FileMetadata = {
          fileId,
          fileName: file.name,
          fileType,
          uploadedAt: Date.now(),
          rowCount: rows.length,
          columnNames: headers,
          dataPreview,
        };

        // ── Backend persistence ────────────────────────────────────
        if (actor) {
          try {
            await actor.saveFileMetadata({
              fileId: metadata.fileId,
              fileName: metadata.fileName,
              fileType: metadata.fileType,
              uploadedAt: BigInt(metadata.uploadedAt),
              rowCount: BigInt(metadata.rowCount),
              columnNames: metadata.columnNames,
              dataPreview: metadata.dataPreview,
            });
            await actor.saveDashboardConfig({
              fileId: finalDashboard.fileId,
              kpis: finalDashboard.kpis,
              chartConfigs: finalDashboard.chartConfigs.map((c) => ({
                ...c,
                yKeys: c.yKeys,
              })),
              aiInsights: finalDashboard.aiInsights,
              generatedAt: BigInt(finalDashboard.generatedAt),
            });
            await actor.setLatestFileId(fileId);
          } catch {
            // non-fatal: data is in store
          }
        }

        // ── Update store ───────────────────────────────────────────
        setActiveDashboard(finalDashboard);
        setActiveFileId(fileId);
        setFiles([metadata]);
        setIsGenerating(false);
        setProgress(100);
        setUploadProgress(100);

        setFileInfo({
          name: file.name,
          rows: rows.length,
          cols: headers.length,
        });
        setPhase("done");
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Kuch gadbad ho gayi, mere aaka 🙏",
        );
        setPhase("error");
        setIsGenerating(false);
      }
    },
    [
      actor,
      apiKey,
      setActiveDashboard,
      setActiveFileId,
      setFiles,
      setIsGenerating,
      setParsedDataset,
      setUploadProgress,
    ],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);

  const reset = () => {
    setPhase("idle");
    setProgress(0);
    setFileInfo(null);
    setErrorMsg("");
    setStatusMsg("");
  };

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-8 p-6 md:p-10"
      data-ocid="upload_data.page"
    >
      {/* Header */}
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-dark genie-glow mb-4">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold gradient-text mb-2">
          Data Upload
        </h1>
        <p className="text-muted-foreground text-sm">
          Upload your CSV or PDF — the Genie will conjure insights instantly
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-2xl glass-dark rounded-3xl p-6 md:p-8 genie-glow">
        {/* IDLE */}
        {phase === "idle" && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click();
            }}
            data-ocid="upload_data.dropzone"
            className={[
              "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer",
              "py-14 px-6 text-center transition-smooth",
              isDragOver
                ? "border-primary bg-primary/10 genie-glow scale-[1.01]"
                : "border-border hover:border-primary/60 hover:bg-primary/5",
            ].join(" ")}
          >
            <div
              className={[
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-smooth",
                isDragOver ? "gradient-accent" : "glass",
              ].join(" ")}
            >
              <UploadCloud
                className={[
                  "w-10 h-10 transition-smooth",
                  isDragOver ? "text-primary-foreground" : "text-primary",
                ].join(" ")}
              />
            </div>

            <div>
              <p className="font-display text-xl font-semibold text-foreground mb-1">
                Drop your CSV or PDF here
              </p>
              <p className="text-muted-foreground text-sm">
                or click to browse
              </p>
            </div>

            <p className="text-xs text-muted-foreground italic max-w-sm">
              ✨ {greeting}
            </p>

            <div className="flex gap-2 mt-1">
              <span className="px-3 py-1 rounded-full glass text-xs text-primary border border-primary/20">
                .CSV
              </span>
              <span className="px-3 py-1 rounded-full glass text-xs text-primary border border-primary/20">
                .PDF
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.pdf"
              className="hidden"
              data-ocid="upload_data.input"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        )}

        {/* READING / PARSING / GENERATING */}
        {(phase === "reading" ||
          phase === "parsing" ||
          phase === "generating") && (
          <div className="flex flex-col items-center gap-6 py-10">
            {/* Pulsing genie glow orb */}
            <div className="relative">
              <div
                className={[
                  "w-24 h-24 rounded-full flex items-center justify-center",
                  phase === "generating"
                    ? "gradient-accent genie-glow"
                    : "glass",
                  phase === "generating" ? "animate-pulse" : "",
                ].join(" ")}
              >
                {phase === "reading" && (
                  <FileText className="w-10 h-10 text-primary" />
                )}
                {phase === "parsing" && (
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                )}
                {phase === "generating" && (
                  <span
                    className="text-4xl float-genie"
                    role="img"
                    aria-label="genie"
                  >
                    🧞
                  </span>
                )}
              </div>
              {phase === "generating" && (
                <div className="absolute inset-0 rounded-full genie-glow animate-ping opacity-30" />
              )}
            </div>

            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground mb-1">
                {statusMsg}
              </p>
              {phase === "generating" && (
                <p className="text-muted-foreground text-sm">
                  Arz hai mere aaka… weaving insights from your data 🌟
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-sm">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {phase === "reading" && "Reading"}
                  {phase === "parsing" && "Detecting columns"}
                  {phase === "generating" && "Generating insights"}
                </span>
                <span className="text-xs text-primary font-mono">
                  {progress}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full gradient-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {phase === "parsing" && (
              <div className="flex gap-2 flex-wrap justify-center">
                {[
                  "Detecting headers",
                  "Computing statistics",
                  "Classifying types",
                ].map((s, i) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full glass text-xs text-muted-foreground"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DONE */}
        {phase === "done" && fileInfo && (
          <div
            className="flex flex-col items-center gap-6 py-6"
            data-ocid="upload_data.success_state"
          >
            <div className="w-20 h-20 rounded-full gradient-accent genie-glow flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
            </div>

            <div className="text-center">
              <p className="font-display text-2xl font-bold gradient-text mb-1">
                Your data is ready, mere aaka! ✨
              </p>
              <p className="text-muted-foreground text-sm">
                Aapka hukum sar aankhon par — the Genie has spoken
              </p>
            </div>

            {/* File summary card */}
            <div className="w-full rounded-2xl glass p-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold font-display gradient-text">
                  {fileInfo.rows.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Rows</p>
              </div>
              <div className="border-x border-border">
                <p className="text-2xl font-bold font-display gradient-text">
                  {fileInfo.cols}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Columns</p>
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm truncate max-w-[100px] mx-auto">
                  {fileInfo.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">File</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                className="gap-2"
                data-ocid="upload_data.view_dashboard_button"
                onClick={() => navigate({ to: "/dashboard" })}
              >
                <LayoutDashboard className="w-4 h-4" />
                View Dashboard
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                data-ocid="upload_data.analyze_button"
                onClick={() => navigate({ to: "/data-analysis" })}
              >
                <Microscope className="w-4 h-4" />
                Analyze Data
              </Button>
            </div>

            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              data-ocid="upload_data.upload_again_button"
              onClick={reset}
            >
              Upload another file
            </button>
          </div>
        )}

        {/* ERROR */}
        {phase === "error" && (
          <div
            className="flex flex-col items-center gap-4 py-10"
            data-ocid="upload_data.error_state"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center">
              <span className="text-2xl" role="img" aria-label="error">
                ⚠️
              </span>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-destructive mb-1">
                Kuch gadbad ho gayi
              </p>
              <p className="text-muted-foreground text-sm max-w-xs">
                {errorMsg}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={reset}
              data-ocid="upload_data.retry_button"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Tips footer */}
      {phase === "idle" && (
        <div className="flex gap-4 flex-wrap justify-center max-w-xl">
          {[
            { icon: "📊", text: "CSV files parsed instantly" },
            { icon: "📄", text: "PDF text extracted automatically" },
            { icon: "🧠", text: "AI insights generated by Genie" },
          ].map((tip) => (
            <div
              key={tip.text}
              className="flex items-center gap-2 glass rounded-xl px-4 py-2 text-xs text-muted-foreground"
            >
              <span>{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
