// ─── Voice Utility — ElevenLabs (Aladdin Jinn) + Web Speech Fallback ─────────
//
// ElevenLabs voice IDs:
//   "pNInz6obpgDQGcFmaJgB"  → Adam    (deep, authoritative) ← DEFAULT
//   "VR6AewLTigWG4xSOukaG"  → Arnold  (powerful, dramatic)
//   "ErXwobaYiN019PkySvjV"  → Antoni  (warm, trustworthy)
//   "onwK4e9ZLuTAKqWW03F9"  → Daniel  (deep, British)
// ─────────────────────────────────────────────────────────────────────────────

export const JINN_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

const JINN_VOICE_SETTINGS = {
  stability: 0.40,
  similarity_boost: 0.80,
  style: 0.55,
  use_speaker_boost: true,
};

const ELEVENLABS_MODEL = "eleven_multilingual_v2";

// ─── State ────────────────────────────────────────────────────────────────────
let currentAudio: HTMLAudioElement | null = null;

// ─── Sentence Queue ───────────────────────────────────────────────────────────
interface QueueItem {
  text: string;
  lang: "en-US" | "hi-IN";
  useElevenLabs: boolean;
  apiKey: string;
  voiceId: string;
}

const queue: QueueItem[] = [];
let queuePlaying = false;
let queueStopped = false;

// Callbacks for queue lifecycle
let onQueueStart: (() => void) | null = null;
let onQueueEnd: (() => void) | null = null;

// ── Prefetch cache: fetch next sentence audio while current one plays ──────
// key = sentence text, value = Promise<Blob | null>
const prefetchCache = new Map<string, Promise<Blob | null>>();

function prefetchAudio(item: QueueItem): void {
  if (!item.useElevenLabs) return;
  if (prefetchCache.has(item.text)) return; // already fetching

  const promise = fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${item.voiceId}`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": item.apiKey.trim(),
      },
      body: JSON.stringify({
        text: item.text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: JINN_VOICE_SETTINGS,
      }),
    },
  )
    .then((r) => (r.ok ? r.blob() : null))
    .catch(() => null);

  prefetchCache.set(item.text, promise);
}

async function playNext(): Promise<void> {
  if (queueStopped || queue.length === 0) {
    queuePlaying = false;
    prefetchCache.clear();
    if (!queueStopped) onQueueEnd?.();
    return;
  }

  queuePlaying = true;
  const item = queue.shift()!;

  // Kick off prefetch for the sentence after this one while this one plays
  if (queue.length > 0) prefetchAudio(queue[0]);

  const next = () => playNext();

  if (item.useElevenLabs) {
    // Use prefetched blob if available, otherwise fetch now
    const cachedBlob = prefetchCache.has(item.text)
      ? await prefetchCache.get(item.text)
      : null;
    prefetchCache.delete(item.text);

    await speakWithElevenLabsBlob(
      item.text,
      item.apiKey,
      item.voiceId,
      cachedBlob,
      onQueueStart ? () => { onQueueStart?.(); onQueueStart = null; } : undefined,
      next,
      () => speakText(item.text, item.lang, next),
    );
  } else {
    if (onQueueStart) { onQueueStart(); onQueueStart = null; }
    speakText(item.text, item.lang, next);
  }
}

/**
 * Add a sentence to the playback queue.
 * Playback starts immediately if nothing is playing.
 */
export function enqueueSentence(
  text: string,
  opts: {
    lang: "en-US" | "hi-IN";
    useElevenLabs: boolean;
    apiKey: string;
    voiceId?: string;
    onStart?: () => void;
    onEnd?: () => void;
  },
): void {
  const clean = cleanForTTS(text);
  if (!clean) return;

  if (opts.onStart) onQueueStart = opts.onStart;
  if (opts.onEnd) onQueueEnd = opts.onEnd;

  const newItem: QueueItem = {
    text: clean,
    lang: opts.lang,
    useElevenLabs: opts.useElevenLabs,
    apiKey: opts.apiKey,
    voiceId: opts.voiceId ?? JINN_VOICE_ID,
  };

  // Prefetch audio immediately so it's ready before playback reaches this item
  if (newItem.useElevenLabs && !queuePlaying) prefetchAudio(newItem);

  queue.push(newItem);

  if (!queuePlaying) playNext();
}

/** Clear the queue and stop all audio immediately. */
export function clearQueue(): void {
  queueStopped = true;
  queue.length = 0;
  queuePlaying = false;
  onQueueStart = null;
  onQueueEnd = null;
  stopSpeech();
  // Allow future queues
  setTimeout(() => { queueStopped = false; }, 50);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function cleanForTTS(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[*_#>~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/✨|👑|🌟|🙏|🔥|💫|🧞|🎙️|🔊|⚙️|⚠️|→|←/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 2000);
}

// ─── ElevenLabs TTS ───────────────────────────────────────────────────────────

// Internal: play a pre-fetched blob (or fetch fresh if blob is null)
async function speakWithElevenLabsBlob(
  text: string,
  apiKey: string,
  voiceId: string,
  blob: Blob | null,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: Error) => void,
): Promise<void> {
  stopSpeech();

  const cleanText = cleanForTTS(text);
  if (!cleanText) { onEnd?.(); return; }

  try {
    let audioBlob = blob;

    // Fallback: fetch fresh if prefetch missed
    if (!audioBlob || audioBlob.size < 100) {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": apiKey.trim(),
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: ELEVENLABS_MODEL,
            voice_settings: JINN_VOICE_SETTINGS,
          }),
        },
      );
      if (!response.ok) throw new Error(`ElevenLabs error ${response.status}`);
      audioBlob = await response.blob();
    }

    if (!audioBlob || audioBlob.size < 100) throw new Error("Empty audio");

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio();
    audio.volume = 1.0;
    audio.playbackRate = 0.92;
    audio.preload = "auto";
    currentAudio = audio;

    let started = false;
    const tryPlay = async () => {
      if (started) return;
      started = true;
      try {
        onStart?.();
        await audio.play();
      } catch {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        onError?.(new Error("Browser blocked autoplay. Click anywhere first, then try again."));
      }
    };

    audio.addEventListener("canplay", tryPlay, { once: true });
    audio.addEventListener("canplaythrough", tryPlay, { once: true });
    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      onEnd?.();
    }, { once: true });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      onError?.(new Error("Audio playback failed."));
    }, { once: true });

    audio.src = audioUrl;
    audio.load();
  } catch (err) {
    currentAudio = null;
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function speakWithElevenLabs(
  text: string,
  apiKey: string,
  voiceId: string = JINN_VOICE_ID,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: Error) => void,
): Promise<void> {
  stopSpeech();

  const cleanText = cleanForTTS(text);
  if (!cleanText) { onEnd?.(); return; }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey.trim(),
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: ELEVENLABS_MODEL,
          voice_settings: JINN_VOICE_SETTINGS,
        }),
      },
    );

    if (!response.ok) {
      let errMsg = `ElevenLabs error ${response.status}`;
      try {
        const errJson = await response.json();
        errMsg = errJson?.detail?.message ?? errJson?.detail ?? errMsg;
      } catch { /* ignore */ }
      throw new Error(errMsg);
    }

    const audioBlob = await response.blob();
    if (audioBlob.size < 100) throw new Error("ElevenLabs returned empty audio");

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio();
    audio.volume = 1.0;
    audio.playbackRate = 0.92;
    audio.preload = "auto";
    currentAudio = audio;

    let started = false;
    const tryPlay = async () => {
      if (started) return;
      started = true;
      try {
        onStart?.();
        await audio.play();
      } catch (playErr) {
        console.warn("Autoplay blocked:", playErr);
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        onError?.(new Error("Browser blocked autoplay. Click anywhere first, then try again."));
      }
    };

    audio.addEventListener("canplay", tryPlay, { once: true });
    audio.addEventListener("canplaythrough", tryPlay, { once: true });
    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      onEnd?.();
    }, { once: true });
    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      onError?.(new Error("Audio playback failed."));
    }, { once: true });

    audio.src = audioUrl;
    audio.load();

  } catch (err) {
    currentAudio = null;
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("ElevenLabs TTS error:", error.message);
    onError?.(error);
  }
}

// ─── Web Speech API (Free Fallback) ──────────────────────────────────────────

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  if (lang === "hi-IN") {
    return (
      voices.find((v) => v.name === "Google हिन्दी") ??
      voices.find((v) => v.name.includes("हिन्दी")) ??
      voices.find((v) => v.lang === "hi-IN") ??
      voices.find((v) => v.lang.startsWith("hi")) ??
      voices.find((v) => v.name.startsWith("Google")) ??
      null
    );
  }

  return (
    voices.find((v) => v.name === "Google UK English Male") ??
    voices.find((v) => v.name.includes("David")) ??
    voices.find((v) => v.name.includes("Mark")) ??
    voices.find((v) => v.name.includes("Alex")) ??
    voices.find((v) => v.lang === "en-US" && v.name.startsWith("Google")) ??
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

export function speakText(
  text: string,
  lang: "en-US" | "hi-IN" = "hi-IN",
  onEnd?: () => void,
): void {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();

  const cleanText = cleanForTTS(text);
  if (!cleanText) { onEnd?.(); return; }

  const utter = new SpeechSynthesisUtterance(cleanText);
  utter.lang = lang;
  utter.rate = 0.85;
  utter.pitch = 0.72;
  utter.volume = 1.0;

  const keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) { clearInterval(keepAlive); return; }
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 10000);

  utter.onend = () => { clearInterval(keepAlive); onEnd?.(); };
  utter.onerror = () => { clearInterval(keepAlive); onEnd?.(); };

  const doSpeak = () => {
    const voice = pickBestVoice(lang);
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
  } else {
    doSpeak();
  }
}

// ─── Stop All Audio ───────────────────────────────────────────────────────────

export function stopSpeech(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isElevenLabsConfigured(key: string): boolean {
  return key.trim().length > 10;
}

export function listAvailableVoices(): { name: string; lang: string }[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices().map((v) => ({ name: v.name, lang: v.lang }));
}
