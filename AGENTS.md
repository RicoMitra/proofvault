# Project Governance

## Owner

This project is owned by **Rico Majesty Daniel Mitra** ([@RicoMitra](https://github.com/RicoMitra)).

## Purpose

Evidence OS is a local-first career evidence system for turning scattered proof into clean portfolio assets. It helps users organize screenshots, certificates, GitHub links, project notes, achievements, testimonials, documents, receipts, and transaction proof into structured evidence that can become GitHub README sections, resume bullets, portfolio case studies, and Markdown notes.

Evidence OS is **not** an AI classifier, OCR pipeline, hiring platform, payment product, team workspace, cloud file manager, or professional career advisor. It must not imply that generated material guarantees hiring outcomes.

## Core Capabilities

- Capture evidence manually with the user choosing the evidence type first.
- Support Project, GitHub Repo, Certificate, Screenshot Progress, Achievement, Work Result, Testimonial, Document, Receipt/Transaction Proof, and Other.
- Store title, type, date, source or reference, tags, category, context, impact, verification notes, status, and private notes.
- Calculate a deterministic credibility score with visible factor breakdowns.
- Search and filter the Evidence Inbox.
- Select evidence for the Career Story Builder.
- Export Markdown, GitHub README sections, resume bullets, portfolio case studies, and versioned JSON backups.
- Provide a clear reset action.

## Hard Constraints

- Keep the existing local folder, GitHub repository, and Vercel project. The repository remains `proofvault`.
- Do not create a new repository or overwrite another Vercel project.
- Keep the MVP browser-first, local-first, deterministic, and usable without external services.
- Do not add authentication, backend databases, AI APIs, OCR dependencies, payment systems, team workspaces, cloud sync, paid APIs, or required external runtime services.
- All user data stays in the browser unless the user manually exports JSON or Markdown.
- Use IndexedDB/localStorage-style browser persistence only.
- Export/import JSON is the only MVP backup and migration method.
- Scoring must be deterministic, transparent, and testable.
- Smart assistance means structured fields and export formatting, not auto-classification.
- Do not create or update Obsidian files for this implementation.

## Required Technology Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Minimal shadcn/ui-compatible primitives where useful
- Vitest
- Testing Library with jsdom
- Native IndexedDB wrapper
- Vercel for deployment
- pnpm as the package manager

Do not add unnecessary dependencies. Do not add charting, state-management, storage, validation, OCR, AI, or animation libraries unless the owner explicitly approves the dependency.

## Product and Design Direction

Evidence OS should feel like a premium productivity workspace: calm, structured, information-rich, and practical. The UI should be polished but realistic for a solo builder, with a stable dashboard-first workflow rather than a marketing landing page.

Use a graphite/slate foundation, cool gray surfaces, restrained mint/teal trust accent, and clear amber or rose status colors. Avoid neon purple, bright blue-led themes, excessive decoration, generic AI styling, and experimental automation.

## Engineering Rules

- Keep domain logic framework-independent and deterministic.
- Define explicit TypeScript types for evidence items, evidence types, statuses, credibility scores, score factors, storage payloads, and export payloads.
- Avoid `any`.
- UI components must not independently recalculate credibility formulas.
- Validate imported data before it replaces local data.
- Failed imports must not overwrite existing local data.
- Handle empty, incomplete, invalid, and zero-data states without crashes, `NaN`, or misleading output.
- Keep public exports free from private notes.
- Use semantic HTML, labeled form fields, keyboard-accessible controls, and visible focus states.
- Keep code, identifiers, comments, commits, and technical documentation in clear English.

## Project Knowledge Sources

Agents must read these files before making product or architectural changes:

1. `AGENTS.md` defines governance, constraints, and decision authority.
2. `PROJECT_CONTEXT.md` defines the product model, UX, data flow, and delivery sequence.
3. `DECISIONS.md` records approved product and technical decisions.
4. `DESIGN.md` defines persistent UI design direction and tokens.

Keep these documents synchronized when an approved change affects project scope, architecture, data handling, scoring semantics, privacy, or user experience.

## Decision-Making Policy

Agents may independently make reversible, low-risk decisions that follow this document and existing repository patterns. Examples include component boundaries, naming refinements, small accessibility improvements, and test organization.

Agents must ask the owner before changing:

- Product scope or the meaning of a feature
- Credibility scoring semantics, scoring weights, or evidence status meaning
- Data storage, privacy, authentication, backup, or import/export behavior
- Major dependencies or replacements to the required stack
- Visual direction or primary interaction model
- Deployment strategy or repository ownership
- Any behavior that could be interpreted as career, legal, financial, or professional advice

When requirements are incomplete, use this order of precedence:

1. Protect user privacy, deterministic scoring, and manual-first positioning.
2. Follow the explicit owner request and this document.
3. Follow existing project conventions.
4. Choose the smallest reversible solution that satisfies the requirement.
5. Record important assumptions and escalate high-impact ambiguity to the owner.

## Quality Guardrails

- Credibility outputs must be deterministic, testable, and derived from visible or documented inputs.
- Unit tests must cover validation, scoring, status/type handling, Markdown exports, and import/export behavior.
- UI tests must cover evidence entry, type-first capture, score updates, search/filtering, story selection, export generation, and reset.
- Before considering a change complete, run linting, type checking, tests, production build, and browser verification.
