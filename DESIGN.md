# Design

> Auto-generated and maintained by frontend-god-mode.
> Source of truth for typography, color, motion, layout, and component tokens.
> Read this BEFORE touching the UI in any subsequent session.

## Aesthetic direction

Premium productivity dashboard: graphite workspace, cool editorial surfaces, restrained mint trust accent, and evidence-first information hierarchy.

## Dials

- DESIGN_VARIANCE: 6 / 10
- MOTION_INTENSITY: 3 / 10
- VISUAL_DENSITY: 6 / 10

## Type stack

- Display: Geist
- Body: Geist
- Mono: Geist Mono
- Loaded via: `next/font/google`
- Numeric scores and export text use tabular/mono styling.

Banned in this project: Inter, Roboto, Arial, system-ui, serif dashboard typography.

## Color tokens (OKLCH)

```css
:root {
  --bg: oklch(0.145 0.011 248);
  --fg: oklch(0.965 0.006 248);
  --muted: oklch(0.69 0.018 248);
  --panel: oklch(0.195 0.014 248);
  --panel-strong: oklch(0.235 0.016 248);
  --border: oklch(0.32 0.018 248);
  --accent: oklch(0.71 0.12 170);
  --accent-strong: oklch(0.78 0.13 170);
  --warning: oklch(0.78 0.14 78);
  --danger: oklch(0.66 0.18 24);
  --success: oklch(0.68 0.13 148);
}
```

Banned in this project:

- Pure `#000` / `#FFF`
- Purple-to-blue gradients
- Neon AI styling
- More than one primary accent

## Shadows

```css
--shadow: 0 30px 86px -44px oklch(0.06 0.02 248 / 0.82);
```

Shadows stay cool-tinted and subtle.

## Motion

- CSS transitions only for hover, active, and focus states.
- Buttons use subtle `scale(0.98)` active feedback.
- Respect `prefers-reduced-motion`.
- No bounce, elastic, or decorative perpetual motion.

## Layout

- Container: `max-w-[1440px] mx-auto px-4 md:px-10`
- Dashboard first screen, no marketing landing page.
- Main app grid: form rail plus inbox/story workspace on desktop, single column on mobile.
- Use divided data rows for Evidence Inbox and score breakdowns.
- Keep cards shallow; no card nesting beyond functional sections.

## Component inventory

- Custom: `EvidenceOsApp`, evidence form, Evidence Inbox, Evidence Card, Career Story Builder, metric panels, export panel.
- Icons: `lucide-react`, 15-34px, functional only.
- No charting library in MVP.

## Brand voice

- Tone: direct, practical, privacy-aware, career-output focused.
- Banned: elevate, unleash, next-gen, guaranteed, auto-detected claims.
- Button labels use explicit verbs: `Save evidence`, `Export JSON`, `Import JSON`, `Generate export`, `Reset`.

## Accessibility floor

- WCAG AA contrast for body copy.
- Real labels for all inputs.
- Keyboard-reachable controls.
- Visible focus rings.
- 44px minimum touch targets.

## Last updated

2026-07-01 by Evidence OS MVP conversion from ProofVault.
