import type { DashboardConfig, FileMetadata, ParsedDataset } from "@/types";
import { create } from "zustand";

interface DataState {
  // ─── State ────────────────────────────────────────────────────────────────
  uploadedFiles: FileMetadata[];
  activeFileId: string | null;
  activeDashboard: DashboardConfig | null;
  parsedDataset: ParsedDataset | null;
  isLoading: boolean;
  isGenerating: boolean;
  uploadProgress: number;
  error: string | null;

  // ─── Actions ──────────────────────────────────────────────────────────────
  setFiles: (files: FileMetadata[]) => void;
  setActiveFileId: (id: string | null) => void;
  setActiveDashboard: (config: DashboardConfig | null) => void;
  setParsedDataset: (dataset: ParsedDataset | null) => void;
  setIsLoading: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;
  setUploadProgress: (v: number) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

const initialState = {
  uploadedFiles: [],
  activeFileId: null,
  activeDashboard: null,
  parsedDataset: null,
  isLoading: false,
  isGenerating: false,
  uploadProgress: 0,
  error: null,
};

export const useDataStore = create<DataState>((set) => ({
  ...initialState,

  setFiles: (files) => set({ uploadedFiles: files }),
  setActiveFileId: (id) => set({ activeFileId: id }),
  setActiveDashboard: (config) => set({ activeDashboard: config }),
  setParsedDataset: (dataset) => set({ parsedDataset: dataset }),
  setIsLoading: (v) => set({ isLoading: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setUploadProgress: (v) => set({ uploadProgress: v }),
  setError: (msg) => set({ error: msg }),
  reset: () => set(initialState),
}));
