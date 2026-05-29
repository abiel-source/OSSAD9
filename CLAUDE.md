# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm start        # Serve production build
npm run lint     # ESLint
```

There are no tests. The app redirects `/` → `/overview` on load.

---

## Architecture

### Layout chain

Every page flows through this chain:

```
src/app/layout.tsx                    ← fonts (Noto Sans + IBM Plex Mono), dark class
  └── src/app/(dashboard)/layout.tsx  ← wraps children in DashboardShell
        └── DashboardShell.tsx        ← Sidebar + TopBar + <main> slot + Footer
```

`(dashboard)` is a Next.js route group — it applies the shell layout to all routes inside it without adding a URL segment. All tool pages live here.

### Adding a new tool (the full checklist)

1. **`src/lib/nav.ts`** — Add a `Tool` entry to the correct kit in `PRIMARY_KITS` or `SUPPORT_KITS`. This is the single source of truth for sidebar items, breadcrumb labels, and the `ALL_ROUTES` lookup. If you skip this step, the page exists but won't appear in the nav or breadcrumb.

2. **`src/app/(dashboard)/<kit>/<tool>/page.tsx`** — Create the page. All tool pages are `"use client"` components. Start the file with `ToolHeader` and build down.

The sidebar and breadcrumb wire themselves up automatically from `nav.ts` — no other files need touching.

---

## Key files explained

### `src/lib/nav.ts`
Defines `PRIMARY_KITS`, `SUPPORT_KITS`, `OVERVIEW_ITEM`, `CONSOLE_TOOL`, and `ALL_ROUTES`. The `ALL_ROUTES` record (built by reducing over all kits) is what `TopBar` uses to resolve the current path into a breadcrumb label + parent kit name. Every tool in the sidebar must have an entry here.

### `src/types/network.ts`
Canonical types for all network data. Key ones:
- `DiscoveredHost` — output of nmap parsing; keyed by IP in the topology store
- `ScanEvent` — discriminated union streamed over SSE (`host_discovered | log | complete | error`)
- `InventoryItem` — merged record combining fields from Host Map, Route Trace, and ARP; a host can appear in all three sources
- `ArpEntry`, `Hop` — ARP and traceroute primitives

### `src/lib/graph.tsx`
Reusable graph primitives used by the topology canvases. `GraphNode` has an `id`, optional `superlabel`/`sublabel`, and a `GraphNodeClass` that controls color via `class2Colour()`. Two graph layouts are exported: `StarGraph` (Host Map — router at center, devices arrayed in a circle) and `LineGraph` (Route Trace — hops in a horizontal chain).

### `src/components/tools/ToolHeader.tsx`
Every tool page starts with this. Props:
```ts
title: string
description: string
icon?: LucideIcon        // shown at 22px, text-foreground, no background
rfcBadges?: string[]     // renders ComplianceBadge chips
onExportJSON?: () => void
onExportCSV?: () => void
onLoadFromProject?: () => void
onSaveToProject?: () => void
```
Action buttons only render if their callback prop is provided.

### `src/components/ui/SubToolStub.tsx`
Placeholder for unimplemented tools. Replace it with a real page when building a tool out.

---

## Zustand stores

All stores are in `src/store/`. They are plain Zustand 5 stores — no middleware, no persistence.

| Store | File | What it holds |
|---|---|---|
| `useTopologyStore` | `topology.ts` | Scan state, discovered hosts (keyed by IP), scan log entries, simulation timeout refs, pause state |
| `useRouteTraceStore` | `routetrace.ts` | Hop list for the active trace |
| `useArpStore` | `arp.ts` | ARP entry list |
| `useUIStore` | `ui.ts` | `sidebarCollapsed`, `sidebarOpen` (mobile overlay) |
| `useCapabilitiesStore` | `capabilities.ts` | `hasNmap`, `hasTraceroute`, `isRemoteDeployment` — fetched once on shell mount from `/api/capabilities` |

`useCapabilitiesStore` is fetched in `DashboardShell` on mount. Tool pages read `isRemoteDeployment` / `hasNmap` to decide whether to run real scans or fall back to mock data.

---

## SSE streaming pattern (topology tools)

The live scanning tools follow this exact pattern:

**Server** (`src/app/api/topology/discover/route.ts`):
1. Validates input with Zod
2. Creates a `ReadableStream` with `new ReadableStream({ start(controller) {...} })`
3. Spawns `nmap` as a child process via `child_process.spawn`
4. Sends `ScanEvent` objects as `data: <JSON>\n\n` (standard SSE format)
5. Returns the stream with `Content-Type: text/event-stream` headers

**Client** (e.g., `topology/host-map/page.tsx`):
1. `fetch(url)` → `res.body.getReader()`
2. Reads chunks in a `while(true)` loop, splits on `\n\n`, finds lines starting with `data:`
3. Parses each as a `ScanEvent` and dispatches to `handleScanEvent()` in the store
4. The store switches on `event.type` and updates `hosts`, `logs`, `isScanning` accordingly

---

## Mock / simulation pattern

Currently, topology tool pages use **mock data with staggered `setTimeout`s** instead of real SSE. The real `handleDiscover` function is commented out. The mock `handleRun` function:
1. Iterates `MOCK_DATA` array, scheduling one `handleScanEvent({ type: "host_discovered" })` per host at 500ms intervals
2. Schedules a `complete` event after all hosts are dispatched
3. Stores `window.setTimeout` return values in `timeoutRefs` (via the store) so `handleStop` can cancel them with `clearTimeout`
4. `handleResume` slices `MOCK_DATA` from `dispatchedCountRef` and reschedules the remainder

To switch a tool to real scanning: uncomment `handleRun = (config) => handleDiscover(config.target)` and delete the mock block.

---

## Design system

Dark-only. All color values are CSS custom properties defined in `src/app/globals.css` using the oklch color space. `--radius: 0` — no border radius anywhere in the app.

Key tokens:
| Token | Role |
|---|---|
| `--background` | Page background |
| `--card` | Panel / card surface (slightly lighter) |
| `--foreground` | Primary text |
| `--muted-foreground` | Labels, secondary text |
| `--primary` | Active state, action buttons (`bg-primary text-primary-foreground`) |
| `--accent` | Hover state (`hover:bg-accent hover:text-accent-foreground`) |
| `--destructive` | Errors, high-severity states |
| `--border` | All borders |
| `--sidebar`, `--sidebar-*` | Sidebar-specific overrides |

**Typography**: `font-sans` (Noto Sans) for all UI text. `font-mono` (IBM Plex Mono) for all data values, IP addresses, hashes, code, and table cells containing network data.

**Recurring UI patterns** used across all tool pages:
- Panel: `flex flex-col p-4 gap-3 bg-card border border-border`
- Section label: `text-[11px] tracking-[0.16em] uppercase text-muted-foreground`
- Input: `px-3 py-2 text-[13px] font-mono outline-none bg-background border border-border text-foreground`
- Primary button: `px-4 py-2 text-[12px] bg-primary text-primary-foreground border border-primary`
- Ghost button: `px-4 py-2 text-[12px] border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground`
- Table body rows: `font-mono` on `<tbody>`, `text-[13px]` on the table, `border-b border-border` on each `<tr>`
- Table header cells: `text-muted-foreground` at `font-size: 10px` (via inline style, not Tailwind class)
