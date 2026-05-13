# Badshah Intelligence Design Brief

**Visual Identity**: Premium AI SaaS with royal Genie/Jinn personality. Ocean Dark glassmorphism with intentional depth, smooth micro-interactions, and Islamic geometric aesthetic hints.

## Tone & Personality

Warm, dramatic, regal, majestic. Loyal genie guide with business-intelligence rigor. Hinglish expressions ("Jo hukum", "Farmaiye", "Arz hai") weave naturally into the interface.

## Design Premise

Badshah Intelligence transforms complexity into clarity. Every surface, shadow, and interaction reinforces the feeling of guided intelligence — a wise, powerful ally. No generic AI aesthetics. Bold Ocean blue palette, refined typography, and glassmorphism depth create a premium experience that stands apart.

## Color Palette (OKLCH)

| Role | Light Mode | Dark Mode | Semantic Meaning |
|------|-----------|-----------|------------------|
| Background | 0.98 0.008 266 | 0.088 0.012 266 | Page/surface base |
| Card | 0.16 0.026 266 | 0.118 0.016 266 | Elevation 1; glassmorphism |
| Foreground | 0.12 0.018 266 | 0.96 0.008 240 | Text, primary content |
| Primary | 0.55 0.21 240 | 0.71 0.22 240 | CTAs, highlights |
| Accent | 0.71 0.22 240 | 0.68 0.2 240 | Hover, emphasis |
| Muted | 0.24 0.018 266 | 0.22 0.018 266 | Secondary |
| Chart 1-5 | Blues 0.55-0.71 L | Blues 0.68-0.74 L | Data viz |
| Destructive | 0.55 0.22 25 | 0.65 0.19 22 | Error, danger |

## Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Space Grotesk | 700 | Hero, section headers |
| Body | General Sans | 400-500 | Copy, cards, labels |
| Mono | Geist Mono | 400-500 | Code, data, keys |

Scale: 12px (label) → 14px (body) → 16px (subtitle) → 20px (title) → 28px (section) → 36px (hero).

## Shape & Depth

Radius: Rounded-2xl (1.5rem / 24px) everywhere; premium, approachable feel.
Glassmorphism: background oklch(var(--card) / 0.7); backdrop-filter blur(20px); border 1px solid oklch(var(--border) / 0.2).
Shadows: Genie-glow on interactive; elevated depth via layering, not harsh drop shadows.

## Structural Zones

| Zone | Treatment | Purpose |
|------|-----------|----------|
| Header | bg-card glass + subtle border-b | Navigation, logo, theme |
| Main Content | bg-background; card-grid layout | Dashboard, chat, forms |
| Sidebar | bg-sidebar glass-dark | Navigation tree |
| Footer | bg-muted / 0.3 + border-t | Links, copyright |
| Chat | Genie response: glass blue; user: muted | Conversational hierarchy |

## Components

Buttons: Gradient-accent primary; solid secondary; outlined tertiary. Smooth transitions.
Cards: Glass + genie-glow on hover. Rounded-2xl consistent.
Inputs: Glass background, focus ring primary.
Charts: Recharts with chart-1–5 palette.
Toggles: Animated glass slider for theme.

## Motion

Transitions: transition-smooth (0.3s cubic-bezier on all interactive).
Float: float-genie (±12px drift, 6s) on hero illustration.
Entrance: Fade-in on load; staggered card reveals.
Hover: Brightness +5%, genie-glow intensifies.
Focus: Ring glow, scale 0.98 on buttons.

## Constraints

✓ OKLCH tokens only; no raw hex/RGB/named colors.
✓ Glass and glass-dark for all cards.
✓ transition-smooth on all interactive elements.
✓ gradient-text for emphasis; gradient-accent for CTAs.
✓ genie-glow on hover/focus states.
✓ No arbitrary Tailwind colors; no full-page gradients; no heavy animations.

## Signature Details

1. Genie Glow: Primary inner/outer shadow on elevated interactive. Reinforces "magical guide."
2. Float Animation: Subtle vertical drift on hero genie illustration.
3. Glass Borders: Fine oklch(var(--border) / 0.15) outline on cards.
4. Hinglish Micro-Copy: Greetings and labels sprinkle Hinglish naturally.
5. Islamic Geometric Hints: Subtle corner detail on hero or background.

## Taglines

Ask. Analyze. Act. (primary, always visible)
Your Genie for Data & Decisions (hero tag)
Transform Data into Wisdom (secondary)

## Layouts

Landing: Hero + genie illustration, gradient-text taglines, feature grid (3-col), CTA.
Login: Centered glass card, Internet Identity button, brand lockup.
Dashboard: Header nav, sidebar (optional), KPI grid (4-col), chart cards, insights.
AI Chat: Genie icon header, bubbles, glass input.
Settings: Card stack for profile, theme, API key, voice language.

## Deliverables

index.css: OKLCH tokens (light + dark), @font-face declarations, glass utilities, genie animations.
tailwind.config.js: Dark mode support, custom shadows, keyframes.
Fonts: SpaceGrotesk, GeneralSans, GeistMono in src/frontend/public/assets/fonts/.
