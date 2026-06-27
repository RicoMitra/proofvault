# Design

> Auto-generated and maintained by frontend-god-mode.
> Source of truth for typography, color, motion, layout, and component tokens.
> Read this BEFORE touching the UI in any subsequent session.

## Aesthetic direction

Secure utility dashboard: graphite workspace, cool operational surfaces, restrained teal trust accent, direct evidence-first interactions.

## Dials

- DESIGN_VARIANCE: 6 / 10
- MOTION_INTENSITY: 3 / 10
- VISUAL_DENSITY: 6 / 10

## Type stack

- Display: Geist
- Body: Geist
- Mono: Geist Mono
- Loaded via: `next/font/google`
- Numeric data uses tabular mono styling.

Banned in this project: Inter, Roboto, Arial, system-ui, serif dashboard typography.

## Color tokens (OKLCH)

```css
:root {
  --bg: oklch(0.14 0.012 240);
  --fg: oklch(0.96 0.006 240);
  --muted: oklch(0.68 0.018 240);
  --panel: oklch(0.19 0.014 240);
  --panel-strong: oklch(0.23 0.016 240);
  --border: oklch(0.31 0.018 240);
  --accent: oklch(0.67 0.13 185);
  --accent-strong: oklch(0.73 0.15 185);
  --warning: oklch(0.78 0.14 78);
  --danger: oklch(0.64 0.18 22);
  --success: oklch(0.66 0.14 150);
}
```

Banned in this project:

- Pure `#000` / `#FFF`
- Purple-to-blue gradients
- Cream/private-banking styling from other projects
- More than one primary accent

## Shadows

```css
--shadow: 0 28px 80px -42px oklch(0.05 0.02 240 / 0.78);
```

Shadows stay cool-tinted and subtle.

## Motion

- CSS transitions only for hover and focus states.
- Respect `prefers-reduced-motion`.
- No bounce, elastic, or decorative perpetual motion.

## Layout

- Container: `max-w-[1400px] mx-auto px-4 md:px-10`
- Dashboard first screen, no marketing landing page.
- Main app grid: form rail plus dashboard/detail area on desktop, single column on mobile.
- Use divided data rows for item lists and score breakdowns.
- Keep cards shallow; no card nesting beyond functional sections.

## Component inventory

- Custom: `ProofVaultApp`, metric panels, form fields, item list, evidence checklist, score breakdown, warning list.
- Icons: `lucide-react`, 16-32px, functional only.
- No charting library in MVP.

## Brand voice

- Tone: direct, practical, non-advisory.
- Banned: elevate, unleash, next-gen, guaranteed, legal action instructions.
- Button labels use explicit verbs: `Save item`, `Export JSON`, `Import JSON`, `Reset vault`.

## Accessibility floor

- WCAG AA contrast for body copy.
- Real labels for all inputs.
- Keyboard-reachable controls.
- Visible focus rings.
- 44px minimum touch targets.

## Last updated

2026-06-27 by initial ProofVault MVP dashboard implementation.
