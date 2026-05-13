import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "@tanstack/react-router";
import { Crown, LogIn, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const greetings = [
  "Jo Hukum Mere Aaka ✨",
  "Arz Hai, Badshah ✨",
  "Hukum Kijiye, Aaka ✨",
  "Farmaiye, Mere Aaka ✨",
];

const greeting = greetings[Math.floor(Math.random() * greetings.length)];

// Floating star positions
const stars = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 3,
}));

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setIsLoading(true);
    setError(null);
    try {
      await login();
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.18 0.04 250) 0%, oklch(0.088 0.012 266) 50%, oklch(0.12 0.03 260) 100%)",
      }}
    >
      {/* Geometric star burst background */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: `oklch(0.71 0.22 240 / ${0.3 + Math.random() * 0.4})`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Ambient glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.21 240 / 0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.71 0.22 240 / 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
        data-ocid="login.card"
      >
        <div className="glass-dark rounded-2xl p-10 transition-smooth hover:genie-glow">
          {/* Crown icon + brand */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="relative mb-5"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.21 240 / 0.5), oklch(0.71 0.22 240 / 0.3))",
                  border: "1px solid oklch(0.71 0.22 240 / 0.3)",
                  boxShadow:
                    "0 0 40px oklch(0.71 0.22 240 / 0.2), inset 0 1px 0 oklch(1 0 0 / 0.1)",
                }}
              >
                <Crown
                  className="w-10 h-10"
                  style={{ color: "oklch(0.82 0.18 240)" }}
                />
              </div>
              {/* Sparkle accents */}
              <Sparkles
                className="absolute -top-1 -right-1 w-4 h-4 float-genie"
                style={{ color: "oklch(0.82 0.18 240)" }}
              />
              <Star
                className="absolute -bottom-1 -left-1 w-3 h-3"
                style={{
                  color: "oklch(0.75 0.2 235)",
                  animation: "float-genie 4s ease-in-out infinite reverse",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="text-center"
            >
              <h1 className="text-2xl font-display font-bold gradient-text mb-1">
                Badshah Intelligence
              </h1>
              <p
                className="text-sm font-display font-medium mb-4"
                style={{ color: "oklch(0.62 0.01 240)" }}
              >
                Ask. Analyze. Act.
              </p>
            </motion.div>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px mb-7"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.71 0.22 240 / 0.3), transparent)",
            }}
          />

          {/* Greeting headline */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="text-center mb-8"
          >
            <h2
              className="text-xl font-display font-semibold mb-2"
              style={{ color: "oklch(0.92 0.012 240)" }}
            >
              {greeting}
            </h2>
            <p
              className="text-sm font-body"
              style={{ color: "oklch(0.58 0.01 240)" }}
            >
              Login to access your royal intelligence suite
            </p>
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              data-ocid="login.submit_button"
              className="w-full rounded-xl py-4 px-6 font-display font-semibold text-base flex items-center justify-center gap-3 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isLoading
                  ? "oklch(0.55 0.21 240 / 0.6)"
                  : "linear-gradient(135deg, oklch(0.55 0.21 240), oklch(0.68 0.2 235))",
                color: "oklch(0.97 0.008 266)",
                boxShadow: isLoading
                  ? "none"
                  : "0 4px 24px oklch(0.55 0.21 240 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.15)",
              }}
            >
              {isLoading ? (
                <>
                  <div
                    className="w-5 h-5 rounded-full border-2 border-current/30 border-t-current animate-spin"
                    data-ocid="login.loading_state"
                  />
                  <span>Arz Hai… Please wait</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login with Internet Identity</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4 px-4 py-3 rounded-xl text-sm font-body"
              style={{
                background: "oklch(0.55 0.22 25 / 0.15)",
                border: "1px solid oklch(0.55 0.22 25 / 0.3)",
                color: "oklch(0.8 0.12 25)",
              }}
              data-ocid="login.error_state"
            >
              {error}
            </motion.div>
          )}

          {/* Internet Identity info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-5 text-xs text-center font-body"
            style={{ color: "oklch(0.42 0.01 240)" }}
          >
            Secured by Internet Identity — no passwords needed
          </motion.p>

          {/* Divider */}
          <div
            className="w-full h-px mt-6 mb-5"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.71 0.22 240 / 0.15), transparent)",
            }}
          />

          {/* Back to home */}
          <div className="text-center">
            <a
              href="/"
              className="text-sm font-body transition-smooth inline-flex items-center gap-1.5 group"
              style={{ color: "oklch(0.55 0.14 240)" }}
              data-ocid="login.back_home_link"
            >
              <span
                className="group-hover:translate-x-[-2px] transition-smooth inline-block"
                aria-hidden="true"
              >
                ←
              </span>
              Back to Home
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
