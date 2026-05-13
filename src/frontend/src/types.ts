// ─── Shared Types ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UserSettings {
  apiKey: string;
  voiceLanguage: "en-US" | "hi-IN";
  theme: "dark" | "light" | "system";
}

export type VoiceLanguage = "en-US" | "hi-IN";
export type Theme = "dark" | "light" | "system";

export interface KpiData {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

// ─── Data Upload & Analysis Types ───────────────────────────────────────────

export interface FileMetadata {
  fileId: string;
  fileName: string;
  fileType: "csv" | "pdf";
  uploadedAt: number;
  rowCount: number;
  columnNames: string[];
  dataPreview: string;
}

export interface KpiConfig {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface ChartConfig {
  chartType: "line" | "bar" | "area" | "pie";
  title: string;
  xKey: string;
  yKeys: string[];
  data: string;
}

export interface DashboardConfig {
  fileId: string;
  kpis: KpiConfig[];
  chartConfigs: ChartConfig[];
  aiInsights: string[];
  generatedAt: number;
}

export interface ColumnStat {
  columnName: string;
  dataType: "number" | "text" | "date";
  min?: string;
  max?: string;
  avg?: string;
  uniqueValues?: string[];
}

export interface ParsedDataset {
  headers: string[];
  rows: Record<string, string>[];
  columnStats: ColumnStat[];
}
