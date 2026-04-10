# Design Spec: TUV Design Token Alignment

**Date:** 2026-04-05
**Status:** Draft
**Approach:** Token alignment only (Option B) — keep shadcn/ui, align tokens with TUV design system

## Goal

Align the candidate-recruitment-hris design tokens and component styling with the recruitment-hris project's TUV design system. This ensures visual consistency across both applications without migrating away from shadcn/ui components.

## Scope

- Install `@tuv-indo/css` package for design tokens
- Remap CSS variables in `globals.css` to match TUV values
- Add component-level CSS overrides matching recruitment-hris
- Update layout dimensions (header height)
- Remove dark mode support (light-only)

## Out of Scope

- Replacing shadcn/ui components with @tuv-indo/admin components
- Adding new TUV components (Stepper, Badges, etc.)
- Changing component APIs or React patterns
- Modifying business logic or page structure

## Changes

### 1. New Dependency

Install `@tuv-indo/css` (pin to exact version used by recruitment-hris: `0.0.2-beta.19`).

Import its stylesheet **before** `@tailwind` directives in `globals.css` so that Tailwind utilities and custom overrides take precedence:

```css
@import "@tuv-indo/css/dist/style.css";

@tailwind base;
@tailwind components;
@tailwind utilities;
```

This provides all `--hsd-ui-*` CSS variables (navy, gray, blue, red, green palettes + semantic utilities). Next.js resolves `node_modules` imports in CSS natively — no PostCSS config changes needed.

### 2. CSS Variable Changes (globals.css :root)

| Variable | Current | Target | Notes |
|----------|---------|--------|-------|
| `--background` | `0 0% 100%` (#FFFFFF) | `216 33% 95%` (#EFF3F8) | TUV admin bg (gray-100) |

**All other variables remain unchanged.** The following have been verified to match the recruitment-hris values:
- `--primary: 222 47% 11%` (dark navy)
- `--accent: 225 70% 55%` (bright indigo)
- `--foreground: 222 47% 11%`
- `--destructive: 0 72% 51%`
- `--card: 0 0% 100%` (white)
- `--muted: 220 14% 96%`
- `--secondary: 220 14% 96%`
- Font: Poppins (already configured in `layout.tsx` via `--font-sans`)

**Note on `--radius`:** The `--radius` CSS variable stays at `0.5rem`. Tailwind utilities (`rounded-lg`, `rounded-md`, `rounded-sm`) remain unchanged. The 4px border-radius for forms/dialogs is applied via explicit CSS selectors in component overrides (Section 4), not by changing the variable.

### 3. Removed: Dark Mode

- Remove the entire `.dark { ... }` block from `globals.css`
- Remove `darkMode: ["class"]` from `tailwind.config.ts`

**Note:** Some shadcn/ui components (e.g., `button.tsx`, `badge.tsx`) have CVA variants named `"dark"`. These are **style variants**, not Tailwind dark-mode classes — they are kept as-is.

### 4. Component CSS Overrides (added to globals.css)

These override shadcn/ui component styling to match TUV visually. Overrides are consolidated from the recruitment-hris `globals.css`.

#### 4.1 Inputs & Textareas

**Selectors:** `input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="search"], input[type="tel"], input[type="url"], input:not([type]), textarea`

- `height: 38px` (TUV standard; textarea gets `height: auto`)
- `border-radius: 4px`
- `border: 1px solid rgba(120, 134, 127, 0.2)` (TUV gray-500 at 20%)
- `font-size: 0.875rem` (14px)
- `background: #fff`

**Global input/textarea rules:**
- `font-family: 'Poppins', sans-serif`
- `font-weight: 400`
- `color: #232933` (TUV gray-900)
- Placeholder: `color: #d0d6dd`

**Focus:** `input:focus, textarea:focus`
- `border-color: #8a98ea`
- `box-shadow: 0px 0px 0px 2px rgba(138, 152, 234, 0.32)`
- `outline: none`

**Exception:** `[cmdk-input-wrapper] input:focus` — no border/shadow (handled by wrapper).

**Note on button height alignment:** Shadcn buttons default to `h-9` (36px) or `h-10` (40px). At 38px inputs, there may be a 2px mismatch with `h-9` buttons in inline form layouts. This matches the recruitment-hris behavior and is acceptable.

#### 4.2 Select/Dropdown (Radix Popper)

**Selectors:** `[data-radix-popper-content-wrapper]`, `[role="listbox"]`, `[role="option"]`

- Popper width matches anchor: `min-width/width: var(--radix-popper-anchor-width)`
- Listbox: `border-radius: 4px`, `border: 1px solid rgba(120, 134, 127, 0.2)`, `box-shadow: 0px 8px 12px 0px rgba(0,0,0,0.08)`, `padding: 4px`, `font-size: 0.875rem`
- Options: `border-radius: 4px`, `padding: 8px 12px`, `font-size: 0.875rem`
- `[data-highlighted]`: `background-color: rgba(100, 181, 246, 0.21)`
- `[data-state="checked"]`: same bg + `color: var(--hsd-ui-color-blue-500)`

**Select Trigger:** `[data-radix-select-trigger]`
- `border-radius: 4px`
- `[data-state="open"]`: same focus style as inputs

#### 4.3 Dialog / AlertDialog

**Selectors:** `[data-state="open"][role="dialog"]`, `[data-state="open"][role="alertdialog"]`, `[data-radix-dialog-content]`, `.bg-background[role="dialog"]`, `.bg-background[role="alertdialog"]`

- `border-radius: 4px`
- `background: #fff`
- `border: 1px solid rgba(120, 134, 127, 0.2)`
- Corner clipping fix: `-webkit-mask-image` + `::before` pseudo-element

#### 4.4 Date Input

**Selector:** `input[type="date"]`

- Same styling as text inputs (38px height, 4px radius, TUV border)
- `appearance: none; -webkit-appearance: none`
- Calendar picker icon: `position: absolute; right: 12px; top: 50%; transform: translateY(-50%)`

#### 4.5 Combobox (cmdk)

**Selector:** `[cmdk-item][data-selected="true"]`

- `background-color: rgba(100, 181, 246, 0.21)`
- `color: #232933`

#### 4.6 Buttons

**Selector:** `button, [role="button"]`

- `font-family: 'Poppins', sans-serif`

#### 4.7 Scrollbar (replaces existing visible scrollbar styles)

**Remove** the current visible scrollbar styling:
```css
/* REMOVE all of: */
::-webkit-scrollbar { ... }
::-webkit-scrollbar-track { ... }
::-webkit-scrollbar-thumb { ... }
::-webkit-scrollbar-thumb:hover { ... }
```

**Replace with** TUV hidden scrollbar:
```css
*::-webkit-scrollbar { display: none; }
* { -ms-overflow-style: none; scrollbar-width: none; }
```

Plus transparent scrollbar tracks for Radix scroll areas and dialogs.

### 5. Layout Changes

| Element | Current | Target | File |
|---------|---------|--------|------|
| Header height | `h-16` (64px) | 75px | `header.tsx` |
| PageContainer min-height | `calc(100vh-3.5rem)` (56px — pre-existing bug) | `calc(100vh-75px)` | `page-container.tsx` |
| Sidebar header height | `h-16` (64px) | 75px | `sidebar.tsx` |
| Sidebar expanded | `w-64` (256px) | No change | — |
| Sidebar collapsed | `w-16` (64px) | No change | — |

**Specific changes:**

- **`header.tsx` line 49:** Change `h-16` → custom height class or inline `h-[75px]`
- **`page-container.tsx` line 18:** Change `min-h-[calc(100vh-3.5rem)]` → `min-h-[calc(100vh-75px)]`
- **`sidebar.tsx` line 137:** Change `h-16` → `h-[75px]` (both collapsed and expanded sidebar header)

## Files Affected

| File | Change |
|------|--------|
| `package.json` | Add `@tuv-indo/css` dependency (pinned version) |
| `tailwind.config.ts` | Remove `darkMode: ["class"]` |
| `src/app/globals.css` | Import @tuv-indo/css, token remap, dark mode removal, component overrides, scrollbar replacement |
| `src/components/layout/header.tsx` | Height `h-16` → `h-[75px]` |
| `src/components/layout/page-container.tsx` | Fix min-height to `calc(100vh-75px)` |
| `src/components/layout/sidebar.tsx` | Sidebar header height `h-16` → `h-[75px]` |

**No changes needed:**
- `src/app/layout.tsx` — Poppins font already configured
- `src/components/ui/*.tsx` — shadcn components unchanged; CVA "dark" variants are style variants, not dark mode

## Risk Assessment

- **Low risk:** CSS-only changes + minor layout dimension updates, no component API changes
- **Visual regression possible:** Input heights (36→38px), border-radius (8→4px on forms), and background color (#fff→#eff3f8) could cause minor layout shifts — manual visual review recommended
- **@tuv-indo/css compatibility:** Package is beta (0.0.2-beta.19) — pin exact version to avoid unexpected changes
- **CSS specificity:** The `@tuv-indo/css` import may include global selectors. Import it before `@tailwind` directives so custom overrides win. Audit the imported stylesheet during implementation if unexpected styling appears.

## Success Criteria

- Application visually matches recruitment-hris color scheme and component styling
- All existing functionality works without changes
- No TypeScript errors
- No dark mode artifacts remain
- `@tuv-indo/css` tokens available via `--hsd-ui-*` variables for future use
