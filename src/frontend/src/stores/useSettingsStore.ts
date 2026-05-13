import type { Theme, VoiceLanguage } from "@/types";
import { create } from "zustand";
 
const LS_KEY = "bi_settings";
 
interface SettingsState {
  apiKey: string;
  elevenLabsKey: string;
  voiceLanguage: VoiceLanguage;
  theme: Theme;
  voiceEngine: "elevenlabs" | "browser";
  setApiKey: (key: string) => void;
  setElevenLabsKey: (key: string) => void;
  setVoiceLanguage: (lang: VoiceLanguage) => void;
  setTheme: (theme: Theme) => void;
  setVoiceEngine: (engine: "elevenlabs" | "browser") => void;
  loadFromStorage: () => void;
}
 
const save = (
  state: Pick<SettingsState, "apiKey" | "elevenLabsKey" | "voiceLanguage" | "theme" | "voiceEngine">,
) => {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        apiKey: state.apiKey,
        elevenLabsKey: state.elevenLabsKey,
        voiceLanguage: state.voiceLanguage,
        theme: state.theme,
        voiceEngine: state.voiceEngine,
      }),
    );
  } catch {
    // ignore storage errors
  }
};
 
export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: "",
  elevenLabsKey: "",
  voiceLanguage: "hi-IN",   // default to Hindi for Jinn voice
  theme: "dark",
  voiceEngine: "browser",   // user switches to "elevenlabs" after adding key
 
  setApiKey: (apiKey) => {
    set({ apiKey });
    save({ ...get(), apiKey });
  },
 
  setElevenLabsKey: (elevenLabsKey) => {
    set({ elevenLabsKey, voiceEngine: elevenLabsKey.trim() ? "elevenlabs" : "browser" });
    save({ ...get(), elevenLabsKey, voiceEngine: elevenLabsKey.trim() ? "elevenlabs" : "browser" });
  },
 
  setVoiceLanguage: (voiceLanguage) => {
    set({ voiceLanguage });
    save({ ...get(), voiceLanguage });
  },
 
  setTheme: (theme) => {
    set({ theme });
    save({ ...get(), theme });
  },
 
  setVoiceEngine: (voiceEngine) => {
    set({ voiceEngine });
    save({ ...get(), voiceEngine });
  },
 
  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<SettingsState>;
      set({
        apiKey: data.apiKey ?? "",
        elevenLabsKey: data.elevenLabsKey ?? "",
        voiceLanguage: data.voiceLanguage ?? "hi-IN",
        theme: data.theme ?? "dark",
        voiceEngine: data.voiceEngine ?? "browser",
      });
    } catch {
      // ignore parse errors
    }
  },
}));
 

