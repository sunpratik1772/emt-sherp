# dbSherpa Studio — Redesign PRD

## Original Problem Statement
> Clone https://github.com/sunpratik1772/dbstudio-may (branch dbstudio-may) and redesign the UI to be a minimalist, Supabase-style with collapsible side panels and chat-friendly nodes palette. Keep base functionality (DB schema design / workflow nodes / Copilot chat). Apply Railway/Linear neutral colors, minimalist icons, premium aesthetic. Use Gemini key `<REDACTED>`.

## What is dbSherpa Studio
A modular agent-driven trade-surveillance platform. Investigators describe an alert in natural language; the Gemini-powered Copilot authors a deterministic workflow; the engine runs it and produces a regulator-grade Excel report.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + ReactFlow + Zustand
- **Backend**: FastAPI + google-genai (Gemini) + deterministic workflow engine
- **Routing**: All API under `/api/*` (mounted via `/app/backend/server.py`)

## Environment / Setup
- Backend on `:8001` via supervisor (`uvicorn server:app`)
- Frontend on `:3000` via supervisor (`yarn start` → `vite --host 0.0.0.0 --port 3000`)
- `GEMINI_API_KEY` set in `/app/backend/.env`
- Public URL: `https://chat-nodes-ui.preview.emergentagent.com`

## Redesign Implemented (2026-05-07)
Drastically shifted the UI from a "cosmic glass" purple/violet aesthetic to a **Linear / Railway / Supabase neutral premium** look — without touching backend logic or store/API surface.

### Visual System
- Neutral dark palette (`#08090a` base, `#101113` surface, `#16171a` elevated)
- Whisper-thin borders (`rgba(255,255,255,0.06–0.10)`)
- Single restrained accent: cool indigo `#7c83ff` (Linear-ish)
- Supabase emerald `#3ecf8e` reserved for success states only
- Cyan `#38bdf8` reserved for "running/streaming"
- **Geist** primary font (Vercel) loaded via CDN, Inter fallback
- Linear-style font-feature settings + tighter tracking on display text
- Light theme mirrors Linear/Notion (white surfaces, refined borders)

### Drastic Component Changes
1. **Topbar** — Replaced AI-slop gradient brand orb with a clean monochrome SVG glyph in a subtle bordered tile + tight wordmark. Removed gradient avatar in favor of a Linear-style monochrome letter circle.
2. **NodePanel (Palette)** — Brutally rewritten as Supabase-style:
   - "PALETTE 32" header with refined count badge
   - Search input with `⌘K` kbd hint
   - **Collapsible sections** (chevron toggles)
   - Tiny color dots as section identifiers next to each node
   - Plus button on each section header
   - Node cards: dot · icon · title · type-id (right-aligned mono)
3. **ActivityRail** — Simplified Linear-style: hairline left indicator on active item, no purple fill.
4. **CustomNode** — Railway-style:
   - Removed top accent stripe in favor of a hairline left accent
   - Cleaner monochrome icon (no colored background tile)
   - Tighter typography with display-class title and mono node-type subtitle
   - Same status row, ports, config tags
5. **Empty Canvas** — Linear-style hero:
   - "NEW WORKFLOW" pill at top
   - Display-class heading
   - Pure-white primary CTA (Linear style)
   - `⌘K` search hint at bottom
6. **Backdrop** — Removed all 3 animated cosmic blobs; replaced with a faint dot grid + a single subtle accent spotlight at the top.

### Files Touched
- `/app/frontend/src/styles/globals.css` — entire token palette + utility refinements
- `/app/frontend/src/index.html` — Geist font CDN preconnect + load
- `/app/frontend/tailwind.config.js` — colors aligned to new tokens
- `/app/frontend/src/components/Topbar/index.tsx` — brand glyph + avatar
- `/app/frontend/src/components/NodePanel/index.tsx` — full rewrite
- `/app/frontend/src/components/ActivityRail.tsx` — full rewrite
- `/app/frontend/src/components/WorkflowCanvas/CustomNode.tsx` — refined card
- `/app/frontend/src/components/WorkflowCanvas/index.tsx` — refined empty hero
- `/app/backend/server.py` — supervisor entrypoint mounting routers under `/api`
- `/app/backend/.env` — Gemini key

## Functional Status
- ✅ Backend `/api/health` returns 200
- ✅ `/api/workflows` returns 7 saved scenarios (FX/FI front-running, wash, layering, spoofing, comms, all-sources demo)
- ✅ `/api/drafts` returns 42 drafts
- ✅ `/api/node-manifest` returns 8 palette sections + 32 nodes
- ✅ `/api/copilot/chat` with Gemini works (returns reply)
- ✅ `/api/copilot/generate` with Gemini works (generates 4-node workflow on prompt)
- ✅ Frontend loads and shows redesigned UI
- ✅ Loading workflow via Templates drawer renders 15 nodes on ReactFlow canvas
- ✅ All UI panels (NodePanel, RightPanel/Copilot, ActivityRail, WorkflowDrawer) render the new aesthetic

## Backlog / Next Phase
- Polish WorkflowDrawer card styles further (currently inherits acceptable styling)
- Add command-K palette (currently only a hint in search)
- Polish RightPanel/ConfigView form fields for Linear-style density
- Light theme spot-check on every component
- Validation toast + run log styling polish
- Add subtle motion to section collapse (height animation)

## Deferred / Out of Scope
- Dashboard charts (the dbSherpa app is a workflow builder, not analytics)
- Mobile/responsive breakpoints (tool is desktop-first by nature)
