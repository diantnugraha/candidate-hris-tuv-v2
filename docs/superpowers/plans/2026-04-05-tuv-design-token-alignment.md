# TUV Design Token Alignment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align candidate-recruitment-hris design tokens and component styling with the TUV design system used in recruitment-hris.

**Architecture:** Install `@tuv-indo/css` for design tokens, remap CSS variables in `globals.css`, add component-level CSS overrides matching recruitment-hris, update layout dimensions, remove dark mode. All changes are CSS/layout only — no component API changes.

**Tech Stack:** Next.js 15, Tailwind CSS 3.4, shadcn/ui (Radix), @tuv-indo/css

**Spec:** `docs/superpowers/specs/2026-04-05-tuv-design-token-alignment-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add `@tuv-indo/css` dependency |
| `tailwind.config.ts` | Modify | Remove `darkMode: ["class"]` |
| `src/app/globals.css` | Rewrite | Import TUV CSS, remap tokens, add component overrides, remove dark mode |
| `src/components/layout/header.tsx:49` | Modify | Height `h-16` → `h-[75px]` |
| `src/components/layout/page-container.tsx:18` | Modify | Fix min-height to `calc(100vh-75px)` |
| `src/components/layout/sidebar.tsx:137` | Modify | Sidebar header height `h-16` → `h-[75px]` |

---

## Task 1: Install @tuv-indo/css

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install @tuv-indo/css@0.0.2-beta.19 --save-exact
```

- [ ] **Step 2: Verify installation**

```bash
ls node_modules/@tuv-indo/css/dist/style.css
```

Expected: File exists.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @tuv-indo/css design token package (pinned 0.0.2-beta.19)"
```

---

## Task 2: Remove dark mode from Tailwind config

**Files:**
- Modify: `tailwind.config.ts:4`

- [ ] **Step 1: Remove darkMode config**

In `tailwind.config.ts`, remove line 4:

```diff
- darkMode: ["class"],
```

The file should go from:

```typescript
export default {
  darkMode: ["class"],
  content: [
```

To:

```typescript
export default {
  content: [
```

- [ ] **Step 2: Verify build**

```bash
npx next build 2>&1 | tail -5
```

Expected: Build succeeds (or at least no Tailwind config errors).

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "chore: remove dark mode from tailwind config"
```

---

## Task 3: Rewrite globals.css with TUV tokens and overrides

**Files:**
- Rewrite: `src/app/globals.css`

This is the main change. Replace the entire file content with the TUV-aligned version from recruitment-hris.

- [ ] **Step 1: Rewrite globals.css**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "@tuv-indo/css/dist/style.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {

    /* Match TUV: --hsd-admin-document-bg-color = gray-100 = rgb(239, 243, 248) */
    --background: 216 33% 95%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 222 47% 11%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --accent: 225 70% 55%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 225 70% 55%;
    --radius: 0.5rem;

    /* Chart colors - blue monochromatic */
    --chart-1: 222 47% 20%;
    --chart-2: 225 70% 55%;
    --chart-3: 220 30% 40%;
    --chart-4: 220 20% 60%;
    --chart-5: 220 15% 80%;

    /* Sidebar - clean palette */
    --sidebar-background: 220 14% 98%;
    --sidebar-foreground: 222 47% 11%;
    --sidebar-primary: 222 47% 11%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 220 14% 94%;
    --sidebar-accent-foreground: 222 47% 11%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 225 70% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "kern" 1, "liga" 1;
    letter-spacing: -0.01em;
  }

  input, textarea, select, button {
    font-family: inherit;
  }

  /* Heading typography */
  h1 {
    @apply text-3xl font-semibold tracking-tight;
  }

  h2 {
    @apply text-2xl font-semibold tracking-tight;
  }

  h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }

  /* Elegant selection color */
  ::selection {
    background: hsl(var(--accent) / 0.2);
    color: hsl(var(--foreground));
  }
}

/* Select/Dropdown — match TUV Dropdown styling */
[data-radix-popper-content-wrapper] {
  min-width: var(--radix-popper-anchor-width) !important;
  width: var(--radix-popper-anchor-width) !important;
}

[data-radix-popper-content-wrapper] [role="listbox"] {
  min-width: 100% !important;
  width: 100% !important;
  border-radius: 4px !important;
  border: 1px solid rgba(120, 134, 127, 0.2) !important;
  box-shadow: 0px 8px 12px 0px rgba(0, 0, 0, 0.08) !important;
  padding: 4px !important;
  font-size: 0.875rem;
}

[data-radix-popper-content-wrapper] [role="option"] {
  border-radius: 4px !important;
  padding: 8px 12px !important;
  font-size: 0.875rem !important;
  cursor: pointer;
}

[data-radix-popper-content-wrapper] [role="option"][data-highlighted] {
  background-color: rgba(100, 181, 246, 0.21) !important;
  color: inherit !important;
}

[data-radix-popper-content-wrapper] [role="option"][data-state="checked"] {
  background-color: rgba(100, 181, 246, 0.21) !important;
  color: var(--hsd-ui-color-blue-500) !important;
}

/* Buttons — match TUV button styling */
button, [role="button"] {
  font-family: 'Poppins', sans-serif;
}

/* Inputs & Textareas — match TUV Input styling */
input, textarea {
  font-family: 'Poppins', sans-serif !important;
  font-weight: 400 !important;
  color: #232933 !important;
}

input::placeholder, textarea::placeholder {
  color: #d0d6dd !important;
}

/* Override shadcn input to match TUV */
input[type="text"], input[type="email"], input[type="password"],
input[type="number"], input[type="search"], input[type="tel"],
input[type="url"], input:not([type]), textarea {
  height: 38px;
  border-radius: 4px !important;
  border: 1px solid rgba(120, 134, 127, 0.2) !important;
  font-size: 0.875rem;
  background: #fff;
}

textarea {
  height: auto !important;
  padding: 8px !important;
  background: #fff !important;
}

input:focus, textarea:focus {
  border-color: #8a98ea !important;
  box-shadow: 0px 0px 0px 2px rgba(138, 152, 234, 0.32) !important;
  outline: none !important;
}

/* CommandInput inside wrapper — focus handled by wrapper, not input */
[cmdk-input-wrapper] input:focus {
  border: none !important;
  box-shadow: none !important;
}

/* Dialog — match TUV Dialog: white bg, 4px radius */
[data-state="open"][role="dialog"],
[data-state="open"][role="alertdialog"],
[data-radix-dialog-content] {
  border-radius: 4px !important;
  background: #fff !important;
  background-color: #fff !important;
  border: 1px solid rgba(120, 134, 127, 0.2) !important;
}

/* Also target shadcn DialogContent class */
.bg-background[role="dialog"],
.bg-background[role="alertdialog"] {
  background: #fff !important;
}

/* Select trigger — match TUV: 4px radius, subtle focus */
[data-radix-select-trigger] {
  border-radius: 4px !important;
}

[data-radix-select-trigger][data-state="open"] {
  border-color: #8a98ea !important;
  box-shadow: 0px 0px 0px 2px rgba(138, 152, 234, 0.32) !important;
  outline: none !important;
}

/* Date input — TUV styling, calendar icon to the right */
input[type="date"] {
  appearance: none;
  -webkit-appearance: none;
  position: relative;
  padding-right: 40px !important;
  background-color: #fff !important;
  border-radius: 4px !important;
  border: 1px solid rgba(120, 134, 127, 0.2) !important;
  height: 38px;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  opacity: 0.5;
}

/* Command/Combobox items — match TUV dropdown styling */
[cmdk-item][data-selected="true"] {
  background-color: rgba(100, 181, 246, 0.21) !important;
  color: #232933 !important;
}

/* Hide scrollbar — match TUV: *::-webkit-scrollbar { display: none } */
*::-webkit-scrollbar {
  display: none;
}

* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Transparent scrollbar in dialogs and scroll areas */
[data-radix-scroll-area-viewport]::-webkit-scrollbar-track,
[data-radix-dialog-content] ::-webkit-scrollbar-track,
[role="dialog"] ::-webkit-scrollbar-track {
  background: transparent;
}

[data-radix-scroll-area-viewport],
[data-radix-scroll-area-viewport] > div {
  background: transparent !important;
}

/* Fix dialog corner clipping */
[data-radix-dialog-content] {
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
}

[data-radix-dialog-content]::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  z-index: -1;
}

/* Elegant focus states */
@layer utilities {
  .focus-ring {
    @apply outline-none ring-2 ring-accent/50 ring-offset-2 ring-offset-background;
  }

  /* Staggered animation delays */
  .stagger-1 { animation-delay: 50ms; }
  .stagger-2 { animation-delay: 100ms; }
  .stagger-3 { animation-delay: 150ms; }
  .stagger-4 { animation-delay: 200ms; }
  .stagger-5 { animation-delay: 250ms; }

  /* Refined transitions */
  .transition-elegant {
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  /* Subtle hover lift */
  .hover-lift {
    @apply transition-all duration-300;
  }
  .hover-lift:hover {
    transform: translateY(-2px);
  }

  /* Editorial underline effect */
  .editorial-underline {
    position: relative;
    display: inline-block;
  }
  .editorial-underline::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: hsl(var(--accent));
    transition: width 0.3s ease;
  }
  .editorial-underline:hover::after {
    width: 100%;
  }

  /* Fade in animation */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    opacity: 0;
  }

  /* Subtle grain texture overlay */
  .grain-overlay::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.012;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    z-index: 9999;
  }
}
```

- [ ] **Step 2: Verify the app compiles**

```bash
npx next build 2>&1 | tail -10
```

Expected: Build succeeds. The `@tuv-indo/css` import resolves correctly.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: align globals.css with TUV design tokens and component overrides

- Import @tuv-indo/css for design tokens
- Change --background to TUV gray-100 (#EFF3F8)
- Remove dark mode variables
- Add TUV component overrides (inputs, selects, dialogs, scrollbar)
- Replace visible scrollbar with hidden scrollbar (TUV pattern)"
```

---

## Task 4: Update layout dimensions

**Files:**
- Modify: `src/components/layout/header.tsx:49`
- Modify: `src/components/layout/page-container.tsx:18`
- Modify: `src/components/layout/sidebar.tsx:137`

- [ ] **Step 1: Update header height**

In `src/components/layout/header.tsx`, line 49, change `h-16` to `h-[75px]`:

```diff
-        "sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-6 transition-all duration-300",
+        "sticky top-0 z-30 flex h-[75px] items-center justify-between bg-white border-b border-gray-200 px-6 transition-all duration-300",
```

- [ ] **Step 2: Update page container min-height**

In `src/components/layout/page-container.tsx`, line 18, change `min-h-[calc(100vh-3.5rem)]` to `min-h-[calc(100vh-75px)]`:

```diff
-        "min-h-[calc(100vh-3.5rem)] transition-all duration-300",
+        "min-h-[calc(100vh-75px)] transition-all duration-300",
```

- [ ] **Step 3: Update sidebar header height**

In `src/components/layout/sidebar.tsx`, line 137, change both `h-16` to `h-[75px]`:

```diff
-            sidebarCollapsed ? "justify-center px-2 h-16" : "justify-between px-5 h-16"
+            sidebarCollapsed ? "justify-center px-2 h-[75px]" : "justify-between px-5 h-[75px]"
```

- [ ] **Step 4: Verify the app compiles**

```bash
npx next build 2>&1 | tail -10
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/page-container.tsx src/components/layout/sidebar.tsx
git commit -m "feat: update layout dimensions to match TUV design system

- Header height: 64px -> 75px
- Sidebar header height: 64px -> 75px
- Fix page-container min-height calculation (was 56px, now correct 75px)"
```

---

## Task 5: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Visual checks**

Open http://localhost:3002 and verify:
- Background is light gray (#EFF3F8), not pure white
- Inputs have 38px height, 4px border-radius, subtle gray border
- Input focus shows purple-ish ring (#8a98ea)
- Select dropdowns have 4px radius, TUV highlight color
- Dialogs have 4px radius, white background
- Scrollbars are hidden
- Header and sidebar header are 75px tall
- Sidebar and header align properly
- No dark mode artifacts visible
- Login page renders correctly
- Profile/onboarding page renders correctly

- [ ] **Step 3: Final commit (if any tweaks needed)**

```bash
git add -A
git commit -m "fix: visual adjustments after TUV token alignment review"
```

Only if tweaks were made during visual verification.
