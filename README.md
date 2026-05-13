# 👑 Badshah Intelligence (BI)

> **Premium AI-powered Business Analytics SaaS with a Royal Genie personality.**

Upload CSV or PDF data files and instantly get AI-generated dashboards, KPI insights, and interactive data analysis. Ask the Genie questions about your data in natural language with streaming responses. Built with an Ocean Dark glassmorphism design system and Hinglish genie greetings.

---

## ✨ Features

- **Data Upload** — Drag-and-drop CSV/PDF file ingestion
- **AI Dashboards** — Auto-generated KPI cards and charts from your data
- **Genie Assistant** — Natural language Q&A with streaming AI responses (OpenRouter)
- **Voice Output** — Text-to-speech in English and Hindi
- **Royal Personality** — Hinglish genie greetings ("Jo hukum mere aaka ✨")
- **Per-user persistence** — Data stored on ICP canisters, survives logout/login
- **Ocean Dark Glassmorphism** — Premium OKLCH-based design system
- **Internet Identity Auth** — Decentralized, wallet-free authentication via ICP

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 5 |
| **Routing** | TanStack Router |
| **State** | Zustand |
| **UI** | Tailwind CSS v3, shadcn/ui, Radix UI |
| **Charts** | Recharts |
| **3D / Animation** | Three.js, React Three Fiber, Motion |
| **AI / LLM** | OpenRouter API (streaming, `openai/gpt-4o-mini` default) |
| **Voice** | Web Speech API (browser-native) |
| **Backend** | Motoko on Internet Computer Protocol (ICP) |
| **Auth** | DFINITY Internet Identity |
| **Package Manager** | pnpm (workspaces) |
| **Linter/Formatter** | Biome |

---

## 📁 Project Structure

```
badshah-intelligence/
├── src/
│   ├── backend/                    # ICP / Motoko backend canister
│   │   ├── main.mo                 # Composition root — wires all mixins
│   │   ├── lib/
│   │   │   ├── chat.mo             # Chat history logic
│   │   │   ├── data.mo             # User data / upload storage
│   │   │   └── settings.mo        # Per-user settings
│   │   ├── mixins/
│   │   │   ├── chat-api.mo        # Chat endpoints
│   │   │   ├── data-api.mo        # Data upload endpoints
│   │   │   └── settings-api.mo    # Settings endpoints
│   │   ├── types/
│   │   │   ├── chat.mo
│   │   │   ├── common.mo
│   │   │   └── data.mo
│   │   └── dist/
│   │       └── backend.did        # Candid interface (auto-generated)
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Landing.tsx         # Public landing page
│       │   │   ├── Login.tsx           # Internet Identity login
│       │   │   ├── Dashboard.tsx       # KPI dashboard
│       │   │   ├── Assistant.tsx       # Genie AI chat
│       │   │   ├── DataUploadPage.tsx  # CSV/PDF drag-and-drop
│       │   │   ├── DataAnalysisPage.tsx# Chart workspace
│       │   │   └── SettingsPage.tsx    # API key, voice, theme
│       │   ├── components/
│       │   │   ├── Sidebar.tsx         # Navigation sidebar
│       │   │   └── ui/                 # shadcn/ui component library
│       │   ├── stores/
│       │   │   ├── useAuthStore.ts     # Auth state (Zustand)
│       │   │   ├── useDataStore.ts     # Uploaded data state
│       │   │   └── useSettingsStore.ts # Settings + localStorage
│       │   ├── hooks/
│       │   │   └── useBackend.ts       # ICP backend actor hook
│       │   ├── utils/
│       │   │   ├── openrouter.ts       # Streaming chat via OpenRouter
│       │   │   └── voice.ts            # Web Speech API wrapper
│       │   ├── layouts/
│       │   │   ├── AppLayout.tsx       # Authenticated shell + sidebar
│       │   │   └── PublicLayout.tsx    # Public pages shell
│       │   ├── App.tsx                 # Router + providers root
│       │   ├── main.tsx                # React entry point
│       │   ├── index.css               # Global styles + design tokens
│       │   └── types.ts                # Shared TypeScript types
│       ├── public/                     # Static assets (fonts, images)
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
├── package.json                        # Root workspace config
├── pnpm-workspace.yaml
├── caffeine.toml                       # ICP project manifest
├── mops.toml                           # Motoko package manager config
├── DESIGN.md                           # Design system brief
└── README.md
```

---

## 🔑 Environment Variables

The API key is **entered by the user at runtime** in the Settings page — it is stored in their browser's `localStorage` and is never committed to the codebase. No `.env` file is required for the OpenRouter key.

However, for ICP/DFX development you may create `src/frontend/.env` (copy from `.env.example`):

```bash
cp src/frontend/.env.example src/frontend/.env
```

| Variable | Description | Default |
|---|---|---|
| `DFX_NETWORK` | `local` or `ic` | `local` |
| `CANISTER_ID_BACKEND` | Your deployed backend canister ID | _(empty)_ |
| `CANISTER_ID_FRONTEND` | Your deployed frontend canister ID | _(empty)_ |
| `II_URL` | Internet Identity provider URL | Auto-set by network |
| `STORAGE_GATEWAY_URL` | Blob storage endpoint | `https://blob.caffeine.ai` |

> **Important:** The `env.json` in `src/frontend/` is for runtime config only and is generated at deploy time. Do not commit it with real canister IDs.

---

## 🚀 Local Development Setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 16.0.0 | https://nodejs.org |
| pnpm | ≥ 7.0.0 | `npm install -g pnpm` |
| DFX (optional) | ≥ 0.15 | `sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"` |
| Mops (optional) | latest | `npm install -g ic-mops` |

> **Note:** DFX and Mops are only needed if you want to run/modify the Motoko backend. The frontend runs perfectly in standalone mode using the mock backend.

### Step 1 — Clone / enter the project

```bash
cd badshah-intelligence
```

### Step 2 — Install dependencies

```bash
# From the project root — installs all workspace packages
pnpm install
```

### Step 3 — Run the frontend (standalone mode)

The app uses a **mock backend** automatically when no ICP canister is available. This is perfect for UI development.

```bash
cd src/frontend
pnpm dev
```

Open **http://localhost:5173** in your browser.

### Step 4 — Configure your OpenRouter API key

1. Go to **http://localhost:5173/settings** after logging in
2. Paste your OpenRouter API key (get one free at https://openrouter.ai)
3. The key is saved in your browser — no server needed

---

## 🔒 Authentication Flow

This app uses **DFINITY Internet Identity** — a decentralized, passwordless auth system built into the Internet Computer.

- **Local dev**: Auth is skipped / mocked for ease of development
- **Production on ICP**: Users log in via `https://identity.internetcomputer.org/`
- **No passwords**: Authentication uses cryptographic keys stored in the user's device

---

## 🏗️ Building for Production

### Frontend only (recommended for most deployments)

```bash
cd src/frontend
pnpm build
# Output: src/frontend/dist/
```

### Full ICP build (backend + frontend)

```bash
# From root
pnpm build
```

---

## 🌐 Deployment

### Option A — Vercel (Recommended for frontend-only)

This is the **easiest and fastest** option if you don't need the ICP backend.

1. Push your code to GitHub
2. Go to https://vercel.com → **New Project** → Import your repo
3. Set **Root Directory** to `src/frontend`
4. Set **Build Command** to `pnpm build`
5. Set **Output Directory** to `dist`
6. Click **Deploy**

Environment variables to add in Vercel dashboard:
```
II_URL = https://identity.internetcomputer.org/
STORAGE_GATEWAY_URL = https://blob.caffeine.ai
```

> Users enter their OpenRouter API key at runtime in the Settings page — no server-side key needed.

### Option B — Netlify

1. Push to GitHub
2. Connect repo at https://app.netlify.com
3. **Base directory**: `src/frontend`
4. **Build command**: `pnpm build`
5. **Publish directory**: `src/frontend/dist`
6. Add a `_redirects` file for SPA routing:
   ```
   /* /index.html 200
   ```

### Option C — Internet Computer (ICP) — Full decentralized deployment

This deploys both the Motoko backend and React frontend as canisters.

```bash
# Install DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Login to ICP wallet
dfx identity new my-identity
dfx identity use my-identity

# Deploy to mainnet
dfx deploy --network ic

# Note the canister IDs and update env.json
```

### Domain Connection (Vercel/Netlify)

1. Go to your hosting dashboard → **Domains**
2. Add your custom domain (e.g. `badshah.yourdomain.com`)
3. Update your DNS provider with the CNAME record shown
4. SSL is provisioned automatically

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `pnpm: command not found` | Run `npm install -g pnpm` |
| Blank page after login | Check browser console; make sure `env.json` exists in `src/frontend/` |
| AI chat says "API key not configured" | Go to `/settings` and paste your OpenRouter key |
| Voice not working | Browser must support Web Speech API (Chrome/Edge recommended) |
| ICP canister errors | Run `dfx start --background` before `dfx deploy` |
| TypeScript errors in `backend.ts` | Run `pnpm bindgen` from root to regenerate bindings |

---

## 🔐 Security Recommendations

1. **Never commit API keys** — The OpenRouter key is user-supplied at runtime. Keep it that way.
2. **Rate limit your OpenRouter usage** — Set spending limits at https://openrouter.ai/settings
3. **Content Security Policy** — Add a strict CSP header in your hosting config
4. **HTTPS only** — Both Vercel and Netlify enforce this automatically
5. **ICP canister guards** — The Motoko backend validates `caller` identity on every write operation

---

## ⚡ Performance Optimizations

- Lazy-load heavy pages (`DataUploadPage`, `DataAnalysisPage`) — already done via `React.lazy`
- Enable Vite's `minify: true` in production — already set in `vite.config.js`
- Use `staleTime: 30_000` in React Query to reduce redundant fetches — already set
- Add HTTP caching headers for fonts and static assets in your hosting config

---

## 🎨 UI/UX Improvement Ideas

- Add a **dark/light mode toggle** in the sidebar (theme switching is implemented, just needs sidebar placement)
- Add **chart export** (PNG/CSV) buttons on the Data Analysis page
- Add **conversation history** persistence across sessions for the Genie assistant
- Add **file preview** before confirming upload on the Data Upload page
- Add **mobile-responsive sidebar** with a hamburger menu

---

## 🤝 Contributing / Editing

All source files in `src/frontend/src/` are fully editable TypeScript/TSX. Key files to know:

- **Add a new page**: Create `src/frontend/src/pages/MyPage.tsx` and add a route in `App.tsx`
- **Change AI model**: Edit `DEFAULT_MODEL` in `src/frontend/src/utils/openrouter.ts`
- **Change genie greetings**: Edit the `GREETINGS` array in `src/frontend/src/pages/Assistant.tsx`
- **Change design tokens**: Edit `src/frontend/src/index.css` (OKLCH CSS variables)
- **Add a UI component**: Run `pnpm dlx shadcn@latest add <component>` from `src/frontend/`

---

## 📄 License

This project is yours. You own it fully. Add your preferred license here (MIT, Apache 2.0, etc.).

---

*Built with ❤️ and a touch of royal magic — Jo hukum mere aaka ✨*
