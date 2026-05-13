import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  Crown,
  Moon,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";

// ─── Feature cards data ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BarChart2,
    title: "Business Intelligence",
    desc: "KPI dashboards, trend charts, forecast analytics at your command",
    badge: "Analytics",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    desc: "Ask anything. Get genie-crafted insights in Hinglish or English",
    badge: "AI-Powered",
  },
  {
    icon: TrendingUp,
    title: "Data Storytelling",
    desc: "Turn raw numbers into decisions your whole team understands",
    badge: "Insights",
  },
  {
    icon: Crown,
    title: "Royal Analytics",
    desc: "Premium analytics suite fit for a Badshah",
    badge: "Premium",
  },
];

const TAGLINES = [
  "Ask. Analyze. Act.",
  "Transform Data into Wisdom",
  "Rule Your Data with Intelligence",
];

const STARS = [
  { top: "8%", left: "5%", size: 10, delay: "0s", opacity: 0.6 },
  { top: "15%", left: "88%", size: 14, delay: "1.2s", opacity: 0.5 },
  { top: "35%", left: "3%", size: 8, delay: "2.4s", opacity: 0.4 },
  { top: "60%", left: "92%", size: 12, delay: "0.8s", opacity: 0.7 },
  { top: "75%", left: "7%", size: 10, delay: "1.8s", opacity: 0.5 },
  { top: "20%", left: "50%", size: 6, delay: "3s", opacity: 0.3 },
  { top: "85%", left: "75%", size: 9, delay: "1.5s", opacity: 0.55 },
  { top: "45%", left: "96%", size: 7, delay: "2.1s", opacity: 0.4 },
];

function LandingHeader() {
  const { theme, setTheme } = useTheme();
  return (
    <header
      data-ocid="landing.header"
      className="fixed top-0 inset-x-0 z-50 glass-dark border-b border-primary/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center genie-glow">
            <Crown className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-base tracking-tight">
            <span className="gradient-text">Badshah</span>
            <span className="text-foreground/80"> Intelligence</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle theme"
            data-ocid="landing.theme_toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth hover:bg-primary/10"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <Link to="/dashboard" data-ocid="landing.login_link">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary hover:text-primary font-display text-sm transition-smooth"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      data-ocid="landing.hero_section"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.71 0.22 240 / 0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.55 0.21 240)" }}
      />
      {STARS.map((s) => (
        <Star
          key={`${s.top}-${s.left}`}
          className="absolute float-genie pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: s.delay,
            color: "oklch(0.71 0.22 240)",
          }}
          fill="currentColor"
        />
      ))}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <Badge
              variant="outline"
              className="w-fit border-primary/30 bg-primary/10 text-primary font-display px-4 py-1.5 text-xs tracking-widest uppercase"
            >
              ✨ Royal AI Intelligence Platform
            </Badge>
            <div className="space-y-3">
              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                <span className="gradient-text">Badshah</span>
                <br />
                <span className="text-foreground">Intelligence</span>
              </h1>
              <p className="font-display font-bold text-2xl sm:text-3xl text-primary/80 tracking-wide">
                Ask. Analyze. Act.
              </p>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Your royal genie for data, decisions, and discovery.{" "}
              <span className="text-foreground/70">
                Transform complexity into clarity —{" "}
                <em className="text-primary/70 not-italic">
                  Jo hukum mere aaka…
                </em>{" "}
                ✨
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/dashboard" data-ocid="landing.hero_primary_button">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-display font-semibold text-base px-8 h-12 bg-primary hover:bg-primary/90 transition-smooth genie-glow text-primary-foreground"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Hukum Kijiye →
                </Button>
              </Link>
              <Link to="/dashboard" data-ocid="landing.hero_secondary_button">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-display font-semibold text-base px-8 h-12 border-primary/25 bg-primary/5 hover:bg-primary/12 text-foreground transition-smooth"
                >
                  See the Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-4 border-t border-border/30">
              {[
                { label: "Insights Generated", value: "1.4M+" },
                { label: "Data Points", value: "∞" },
                { label: "Uptime", value: "99.9%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display font-bold text-xl gradient-text">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ background: "oklch(0.71 0.22 240)" }}
            />
            <div className="relative w-72 h-80 sm:w-96 sm:h-[440px] float-genie">
              <img
                src="/assets/generated/genie-hero.dim_600x700.png"
                alt="Badshah Intelligence Royal Genie"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <div className="absolute bottom-6 left-4 glass rounded-2xl px-4 py-2.5 genie-glow">
              <p className="font-display text-xs text-primary font-semibold">
                ✨ AI-Powered
              </p>
              <p className="text-muted-foreground text-xs">
                Royal Intelligence
              </p>
            </div>
            <div
              className="absolute top-8 right-4 glass rounded-2xl px-3 py-2 float-genie"
              style={{ animationDelay: "1s" }}
            >
              <p className="font-display text-xs text-foreground font-medium">
                📊 Live Analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      data-ocid="landing.features_section"
      className="relative py-24"
      style={{ background: "oklch(var(--muted) / 0.08)" }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.71 0.22 240 / 0.35), transparent)",
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.55 0.21 240 / 0.25), transparent)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/5 text-primary font-display text-xs tracking-widest uppercase px-4 py-1.5"
          >
            Capabilities
          </Badge>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Rule Your Data with{" "}
            <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Apni Salatanat Ka Arz Karo — every feature crafted with royal
            precision
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                data-ocid={`landing.feature_card.${i + 1}`}
                className="group glass rounded-2xl p-6 genie-glow transition-smooth hover:scale-[1.03] hover:border-primary/30 cursor-default"
              >
                <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-smooth">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className="mb-3 text-xs border-primary/20 bg-primary/5 text-primary/80 font-display"
                >
                  {feat.badge}
                </Badge>
                <h3 className="font-display font-bold text-base text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TaglinesSection() {
  return (
    <section
      data-ocid="landing.taglines_section"
      className="relative py-24 bg-background overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, oklch(0.55 0.21 240) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative space-y-12">
        <div className="glass rounded-3xl p-8 sm:p-12 genie-glow">
          <div className="text-4xl mb-4">✨</div>
          <blockquote className="font-display text-xl sm:text-2xl font-semibold leading-relaxed text-foreground/90">
            &ldquo;Jo hukum mere aaka…{" "}
            <span className="text-muted-foreground font-normal">
              your data awaits your command.
            </span>
            &rdquo; ✨
          </blockquote>
          <p className="mt-4 text-muted-foreground text-sm">
            — Badshah Intelligence, Your Royal AI Genie
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TAGLINES.map((tagline, i) => (
            <div
              key={tagline}
              data-ocid={`landing.tagline.${i + 1}`}
              className="glass rounded-2xl px-5 py-4 transition-smooth hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-primary mx-auto mb-2" />
              <p className="font-display font-semibold text-sm text-foreground/80">
                {tagline}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      data-ocid="landing.footer"
      className="relative bg-card/60 border-t border-border/30 py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm">
              <span className="gradient-text">Badshah Intelligence</span>
              <span className="text-muted-foreground"> © {year}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-display">
            <span>Ask. Analyze. Act.</span>
            <span className="text-border">·</span>
            <span>Transform Data into Wisdom</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ and royal innovation by Team Badshah
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div
      data-ocid="landing.page"
      className="min-h-screen bg-background flex flex-col"
    >
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TaglinesSection />
      </main>
      <LandingFooter />
    </div>
  );
}
