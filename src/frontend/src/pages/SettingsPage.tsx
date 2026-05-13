import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { VoiceLanguage } from "@/types";
import {
  JINN_VOICE_ID,
  isElevenLabsConfigured,
  isSpeechSupported,
  speakText,
  speakWithElevenLabs,
  stopSpeech,
} from "@/utils/voice";
import {
  Eye,
  EyeOff,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Volume2,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
function truncatePrincipal(p: string): string {
  if (p.length <= 22) return p;
  return `${p.slice(0, 11)}…${p.slice(-8)}`;
}
 
const JINN_TEST_HINDI =
  "Jo hukum mere aaka, main haazir hoon. Main aapka royal Jinn hoon — Badshah Intelligence.";
const JINN_TEST_ENGLISH =
  "Jo hukum mere aaka. I am Badshah Intelligence, your royal Jinn. How may I serve you?";
 
// ─── Section Card ────────────────────────────────────────────────────────────
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`glass rounded-2xl p-6 genie-glow ${className}`}
    >
      {children}
    </motion.div>
  );
}
 
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </p>
  );
}
 
// ─── SettingsPage ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { identity, logout } = useAuthStore();
  const {
    apiKey,
    elevenLabsKey,
    voiceLanguage,
    voiceEngine,
    setApiKey,
    setElevenLabsKey,
    setVoiceLanguage,
    setVoiceEngine,
  } = useSettingsStore();
  const { theme, setTheme } = useTheme();
 
  // OpenRouter key
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [keySaved, setKeySaved] = useState(false);
 
  // ElevenLabs key
  const [elKeyInput, setElKeyInput] = useState("");
  const [showElKey, setShowElKey] = useState(false);
  const [elKeySaved, setElKeySaved] = useState(false);
  const [elKeyError, setElKeyError] = useState("");
 
  // Voice test
  const [isTesting, setIsTesting] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceSuccess, setVoiceSuccess] = useState("");
  const speechSupported = isSpeechSupported();
  const elevenLabsConfigured = isElevenLabsConfigured(elevenLabsKey);
 
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    setKeyInput(apiKey);
    setElKeyInput(elevenLabsKey);
  }, []);
 
  const principal = identity?.getPrincipal().toText() ?? "";
 
  function handleSaveKey() {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setKeyError("API key cannot be empty, mere aaka.");
      return;
    }
    setKeyError("");
    setApiKey(trimmed);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 3500);
  }
 
  function handleSaveElKey() {
    const trimmed = elKeyInput.trim();
    if (!trimmed) {
      setElKeyError("ElevenLabs API key cannot be empty.");
      return;
    }
    setElKeyError("");
    setElevenLabsKey(trimmed);
    setElKeySaved(true);
    setTimeout(() => setElKeySaved(false), 3500);
  }
 
  function handleVoiceSelect(lang: VoiceLanguage) {
    setVoiceLanguage(lang);
  }
 
  async function handleTestVoice() {
    if (isTesting) return;
    setIsTesting(true);
    setVoiceError("");
    setVoiceSuccess("");
    stopSpeech();
 
    const testText = voiceLanguage === "hi-IN" ? JINN_TEST_HINDI : JINN_TEST_ENGLISH;
 
    if (voiceEngine === "elevenlabs" && elevenLabsConfigured) {
      await speakWithElevenLabs(
        testText,
        elevenLabsKey,
        JINN_VOICE_ID,
        () => setVoiceSuccess("🎙️ Jinn bol raha hai — awaaz sun rahe hain?"),
        () => {
          setIsTesting(false);
          setVoiceSuccess("✅ Jinn voice kaam kar raha hai!");
          setTimeout(() => setVoiceSuccess(""), 4000);
        },
        (err) => {
          setIsTesting(false);
          // Give a clear actionable error
          if (err.message.includes("401") || err.message.includes("invalid_api_key")) {
            setVoiceError("❌ ElevenLabs key galat hai. elevenlabs.io pe check karein.");
          } else if (err.message.includes("autoplay") || err.message.includes("blocked")) {
            setVoiceError("⚠️ Browser ne audio block kiya. Pehle page pe kuch click karein, phir dobara try karein.");
          } else if (err.message.includes("quota") || err.message.includes("429")) {
            setVoiceError("⚠️ ElevenLabs free limit khatam. Apna usage elevenlabs.io pe check karein.");
          } else {
            setVoiceError(`❌ Error: ${err.message}`);
          }
          // Fallback to browser voice automatically
          speakText(testText, voiceLanguage, () => setIsTesting(false));
        },
      );
    } else {
      if (!speechSupported) {
        setIsTesting(false);
        setVoiceError("❌ Aapka browser voice support nahi karta. Chrome ya Edge use karein.");
        return;
      }
      speakText(
        testText,
        voiceLanguage,
        () => {
          setIsTesting(false);
          setVoiceSuccess("✅ Browser voice kaam kar raha hai!");
          setTimeout(() => setVoiceSuccess(""), 3000);
        },
      );
    }
  }
 
  const isDark = theme === "dark";
 
  return (
    <div
      data-ocid="settings.page"
      className="min-h-screen bg-background px-4 py-10 sm:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground font-body">
          ✨ Apni Salatanat configure karein — Customize your royal Jinn suite
        </p>
      </motion.div>
 
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
 
        {/* 1. Royal Identity */}
        <SectionCard>
          <SectionLabel>👑 Royal Identity</SectionLabel>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Principal ID</p>
              <p
                data-ocid="settings.principal"
                className="font-mono text-sm text-foreground truncate"
                title={principal}
              >
                {principal ? truncatePrincipal(principal) : "Not connected"}
              </p>
            </div>
          </div>
          <Separator className="mb-5 opacity-30" />
          <Button
            data-ocid="settings.logout_button"
            variant="destructive"
            className="w-full sm:w-auto transition-smooth"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout — Farewell, Mere Aaka
          </Button>
        </SectionCard>
 
        {/* 2. Appearance */}
        <SectionCard>
          <SectionLabel>🎨 Appearance</SectionLabel>
          <p className="text-sm text-muted-foreground mb-4">
            Switch between Ocean Dark and Light Mode.
          </p>
          <div className="flex gap-3">
            {[
              { value: "dark", icon: Moon, label: "Ocean Dark" },
              { value: "light", icon: Sun, label: "Light Mode" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-smooth ${
                  theme === value
                    ? "bg-primary/20 border-primary/50 text-foreground"
                    : "bg-card/30 border-border/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {theme === value && (
                  <span className="ml-auto text-xs bg-primary/30 text-primary-foreground px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </SectionCard>
 
        {/* 3. OpenRouter API Key */}
        <SectionCard>
          <SectionLabel>🔑 OpenRouter API Key (AI Chat)</SectionLabel>
          <p className="text-sm text-muted-foreground mb-5">
            Required for Genie AI responses. Get a free key at{" "}
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80 transition-smooth"
            >
              openrouter.ai
            </a>
          </p>
          <div className="space-y-3">
            <Label htmlFor="api-key-input" className="text-sm text-foreground">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key-input"
                data-ocid="settings.api_key_input"
                type={showKey ? "text" : "password"}
                placeholder="sk-or-…"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  if (keyError) setKeyError("");
                  setKeySaved(false);
                }}
                className="pr-11 font-mono text-sm bg-input/50 border-border/60 focus:border-primary/60 transition-smooth"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {keyError && <p className="text-xs text-destructive">{keyError}</p>}
            {keySaved && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-primary flex items-center gap-1"
              >
                ✨ Hukum sar aankhon par — OpenRouter key saved
              </motion.p>
            )}
            <Button type="button" onClick={handleSaveKey} className="w-full sm:w-auto transition-smooth">
              Save API Key
            </Button>
          </div>
        </SectionCard>
 
        {/* 4. ElevenLabs — Jinn Voice */}
        <SectionCard>
          <SectionLabel>🧞‍♂️ ElevenLabs — Aladdin Jinn Voice (Optional)</SectionLabel>
          <p className="text-sm text-muted-foreground mb-3">
            Add your ElevenLabs key to unlock a deep, dramatic Hindi Jinn voice — the real Aladdin Genie experience.
            Free tier gives <strong className="text-foreground">10,000 characters/month</strong>.
          </p>
          <a
            href="https://elevenlabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2 hover:opacity-80 transition-smooth mb-5"
          >
            🔗 Get free key at elevenlabs.io →
          </a>
 
          {/* Engine toggle */}
          <div className="flex gap-3 mb-5">
            <button
              type="button"
              onClick={() => setVoiceEngine("elevenlabs")}
              disabled={!elevenLabsConfigured}
              className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border text-sm font-medium transition-smooth disabled:opacity-40 disabled:cursor-not-allowed ${
                voiceEngine === "elevenlabs" && elevenLabsConfigured
                  ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                  : "bg-card/30 border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-lg">🎙️</span>
              <span className="font-semibold">Jinn Voice</span>
              <span className="text-xs opacity-70">ElevenLabs • Hindi</span>
              {voiceEngine === "elevenlabs" && elevenLabsConfigured && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full mt-1">
                  Active ✓
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setVoiceEngine("browser")}
              className={`flex-1 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border text-sm font-medium transition-smooth ${
                voiceEngine === "browser"
                  ? "bg-primary/20 border-primary/50 text-foreground"
                  : "bg-card/30 border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-lg">🔊</span>
              <span className="font-semibold">Browser Voice</span>
              <span className="text-xs opacity-70">Free • Built-in</span>
              {voiceEngine === "browser" && (
                <span className="text-xs bg-primary/30 text-primary-foreground px-2 py-0.5 rounded-full mt-1">
                  Active ✓
                </span>
              )}
            </button>
          </div>
 
          <div className="space-y-3">
            <Label htmlFor="el-key-input" className="text-sm text-foreground">
              ElevenLabs API Key
            </Label>
            <div className="relative">
              <Input
                id="el-key-input"
                type={showElKey ? "text" : "password"}
                placeholder="sk_…"
                value={elKeyInput}
                onChange={(e) => {
                  setElKeyInput(e.target.value);
                  if (elKeyError) setElKeyError("");
                  setElKeySaved(false);
                }}
                className="pr-11 font-mono text-sm bg-input/50 border-border/60 focus:border-primary/60 transition-smooth"
              />
              <button
                type="button"
                onClick={() => setShowElKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                aria-label={showElKey ? "Hide key" : "Show key"}
              >
                {showElKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {elKeyError && <p className="text-xs text-destructive">{elKeyError}</p>}
            {elKeySaved && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-emerald-400 flex items-center gap-1"
              >
                🧞‍♂️ Jinn Voice activated — ab asli awaaz suniye!
              </motion.p>
            )}
            <Button type="button" onClick={handleSaveElKey} className="w-full sm:w-auto transition-smooth">
              Save ElevenLabs Key
            </Button>
          </div>
        </SectionCard>
 
        {/* 5. Voice Language */}
        <SectionCard>
          <SectionLabel>🎙️ Voice Language</SectionLabel>
          <p className="text-sm text-muted-foreground mb-5">
            Choose the language for Jinn voice output. Hindi recommended for the full Aladdin experience!
          </p>
 
          <div className="flex gap-3 mb-5">
            {[
              { lang: "hi-IN" as VoiceLanguage, label: "Hindi", sub: "हिन्दी — Recommended 👑", emoji: "🇮🇳" },
              { lang: "en-US" as VoiceLanguage, label: "English", sub: "Angrezi", emoji: "🇬🇧" },
            ].map(({ lang, label, sub, emoji }) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleVoiceSelect(lang)}
                className={`flex-1 flex flex-col items-center gap-1 px-4 py-4 rounded-xl border text-sm font-medium transition-smooth ${
                  voiceLanguage === lang
                    ? "bg-primary/20 border-primary/60 text-foreground"
                    : "bg-card/30 border-border/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-semibold">{label}</span>
                <span className="text-xs opacity-70 text-center">{sub}</span>
                {voiceLanguage === lang && (
                  <span className="text-xs bg-primary/30 text-primary-foreground px-2 py-0.5 rounded-full mt-1">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
 
          <Button
            type="button"
            variant="outline"
            disabled={isTesting || (!speechSupported && voiceEngine === "browser")}
            onClick={handleTestVoice}
            className="w-full sm:w-auto transition-smooth border-primary/40 hover:bg-primary/10"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            {isTesting
              ? "Jinn bol raha hai… 🎙️"
              : voiceEngine === "elevenlabs" && elevenLabsConfigured
              ? "Test Jinn Voice (ElevenLabs) ✨"
              : "Test Browser Voice"}
          </Button>
 
          {/* Error message */}
          {voiceError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-destructive bg-destructive/10 border border-destructive/25 rounded-xl px-4 py-3 leading-relaxed"
            >
              {voiceError}
            </motion.div>
          )}
 
          {/* Success message */}
          {voiceSuccess && !voiceError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3"
            >
              {voiceSuccess}
            </motion.div>
          )}
 
          {/* Autoplay tip — always visible */}
          <p className="text-xs text-muted-foreground mt-3">
            💡 Tip: Agar awaaz nahi aati toh pehle browser mein kuch aur click karein (autoplay policy), phir dobara test karein.
          </p>
 
          {!speechSupported && voiceEngine === "browser" && (
            <p className="text-xs text-destructive mt-2">
              ⚠️ Browser voice not supported. Chrome ya Edge use karein, ya ElevenLabs activate karein.
            </p>
          )}
        </SectionCard>
 
        <p className="text-center text-xs text-muted-foreground pb-6">
          Hukum kijiye, mere aaka — all settings persist locally. ✨
        </p>
      </div>
    </div>
  );
}