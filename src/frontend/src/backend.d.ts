import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface FileMetadata {
    columnNames: Array<string>;
    fileName: string;
    fileType: string;
    dataPreview: string;
    fileId: string;
    rowCount: bigint;
    uploadedAt: bigint;
}
export interface DashboardConfig {
    aiInsights: Array<string>;
    generatedAt: bigint;
    kpis: Array<KpiConfig>;
    chartConfigs: Array<ChartConfig>;
    fileId: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface KpiConfig {
    title: string;
    trend: string;
    value: string;
    change: string;
}
export interface ChatMessage {
    content: string;
    role: string;
}
export interface ChartConfig {
    title: string;
    chartType: string;
    data: string;
    xKey: string;
    yKeys: Array<string>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    getApiKey(): Promise<string | null>;
    getDashboardConfig(fileId: string): Promise<DashboardConfig | null>;
    getFileMetadata(fileId: string): Promise<FileMetadata | null>;
    getLatestDashboard(): Promise<DashboardConfig | null>;
    getLatestFileId(): Promise<string | null>;
    getUserFiles(): Promise<Array<FileMetadata>>;
    getVoiceLanguage(): Promise<string | null>;
    saveApiKey(apiKey: string): Promise<void>;
    saveDashboardConfig(config: DashboardConfig): Promise<void>;
    saveFileMetadata(metadata: FileMetadata): Promise<void>;
    saveVoiceLanguage(lang: string): Promise<void>;
    sendChatMessage(messages: Array<ChatMessage>, apiKey: string): Promise<string>;
    setLatestFileId(fileId: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
