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
Drastically restructured the layout to match the user's Supabase reference: a vertical LeftNav with 3 collapse modes (Expanded / Collapsed / Expand-on-hover), a slim icon-only Topbar, and refined Linear/Railway/Supabase-style typography (Geist).

### Visual System
- Neutral dark palette (`#08090a` base, `#101113` surface, `#16171a` elevated)
- Whisper-thin borders (`rgba(255,255,255,0.06–0.10)`)
- Single restrained accent: cool indigo `#7c83ff` (Linear-ish)
- Supabase emerald `#3ecf8e` reserved for success/online states only
- Cyan `#38bdf8` reserved for "running/streaming"
- **Geist** primary font (Vercel) loaded via CDN, Inter fallback
- Linear-style font-feature settings + tighter tracking on display text
- Light theme mirrors Linear/Notion (white surfaces, refined borders)

### Layout (post-redesign)
```
┌────────┬─────────────────────────────────────────────────────────┐
│        │  Topbar (48px, icon-only actions)                        │
│ LeftNav├─────────────────────────────────────────────────────────┤
│ (Supa- │ NodePanel │ Canvas              │ Activity │ RightPanel │
│ base)  │ (3 modes) │ (ReactFlow)         │  Rail    │ (modes)    │
│ 3 modes│           │                     │          │            │
└────────┴─────────────────────────────────────────────────────────┘
```

### Drastic Component Changes
1. **NEW LeftNav (`/src/components/LeftNav.tsx`)** — Supabase clone:
   - Brand at top (S-glyph + dbSherpa STUDIO wordmark)
   - "Surveillance · PROD" project pill
   - Nav rows: Workflow / Templates / Node Library / Skills / Data Sources / Agents / Logs
   - Divider + Settings at bottom
   - **3 modes** (radio at bottom): Expanded (216px) / Collapsed (52px) / Expand on hover
   - Mode persisted to localStorage
   - In Collapsed mode the radio collapses to a single chevron toggle button
2. **Topbar** — slimmed dramatically:
   - Brand removed (now in LeftNav)
   - Studio tabs removed (now in LeftNav)
   - All action buttons (Import / Export / Validate / Clear / Save / Theme) now icon-only with tooltip
   - Run button compact monochrome (Linear primary style)
   - Avatar reduced to 18px letter circle in icon-button frame
3. **NodePanel (Palette)** — Supabase-style with **3 view modes**:
   - Expanded: full collapsible sections with dot identifiers + count badges + chevrons
   - Icon-only (52px): vertical icon rail with section dividers
   - Hidden (14px): tiny floating reopen handle
4. **CustomNode** — minimal Railway-style (subtitle removed per user feedback): hairline left accent + clean icon + title only
5. **ActivityRail** — Linear-style with hairline left active indicator (no purple fill)
6. **Copilot** — sleek (per user feedback):
   - Removed bulky GuardrailsCard
   - Compact 1-line greeting bubble with sparkle icon
   - 4 thin "Try" prompts with `›` arrow prefix
   - Tiny stats footer: "32 nodes · 5 sources · 5 skills"
7. **Empty Canvas** — Linear-style hero with "NEW WORKFLOW" pill, white CTA, ⌘K hint
8. **Backdrop** — removed cosmic blobs; faint dot grid + subtle accent spotlight

### Files Touched/Added
- **NEW** `/app/frontend/src/components/LeftNav.tsx` — Supabase-style sidebar
- `/app/frontend/src/App.tsx` — added LeftNav, restructured layout
- `/app/frontend/src/styles/globals.css` — entire token palette
- `/app/frontend/index.html` — Geist font CDN
- `/app/frontend/tailwind.config.js` — colors aligned to new tokens
- `/app/frontend/src/components/Topbar/index.tsx` — icon-only actions, removed brand+tabs
- `/app/frontend/src/components/NodePanel/index.tsx` — 3 modes + collapsible sections
- `/app/frontend/src/components/ActivityRail.tsx` — Linear hairline indicator
- `/app/frontend/src/components/WorkflowCanvas/CustomNode.tsx` — refined card, no subtitle
- `/app/frontend/src/components/WorkflowCanvas/index.tsx` — refined empty hero
- `/app/frontend/src/components/Copilot/index.tsx` — sleek header + greeting + prompts
- `/app/backend/server.py` — supervisor entrypoint mounting routers under `/api`
- `/app/backend/.env` — Gemini key

## Functional Status
- ✅ Backend `/api/health` returns 200
- ✅ All 7 workflow templates load and render on canvas
- ✅ Gemini chat + workflow generation work end-to-end
- ✅ All 32 nodes from manifest available in palette (8 sections)
- ✅ LeftNav 3 modes work + persist to localStorage
- ✅ NodePanel 3 modes work
- ✅ Topbar icon-only actions all functional (tooltips appear on hover)
- ✅ Backend testing iteration_1.json passes 11/11 tests

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
