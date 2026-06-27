# Project Governance

## Owner

This project is owned by **Rico Majesty Daniel Mitra** ([@RicoMitra](https://github.com/RicoMitra)).

## Purpose

ProofVault is a local-first claim readiness system for people who buy goods or pay for services and want to keep evidence organized before a return, warranty claim, repair request, or seller complaint becomes urgent.

The product helps users record purchase details, seller information, deadlines, serial numbers, evidence checklist status, issue history, and claim status. It then calculates a deterministic readiness score from visible factors so users can understand whether their proof set is complete enough for practical follow-up.

ProofVault is **not** an expense tracker, generic file manager, legal advisor, professional advisor, AI advisor, or automated claim service. It must never tell users what legal action to take.

## Core Capabilities

- Record an item or service, seller, purchase date, return deadline, warranty deadline, serial number, category, and notes.
- Track evidence checklist items such as receipt, warranty terms, payment proof, seller chat, photos, issue media, and service reports.
- Track an issue timeline and a claim status.
- Calculate a deterministic 0-100 readiness score with a visible factor breakdown.
- Show warnings for missing evidence, expired deadlines, and deadlines closing soon.
- Store all user data locally in the browser with IndexedDB.
- Export and import a versioned JSON backup.
- Provide a clear reset action.

## Hard Constraints

- This must remain a separate project named `proofvault`.
- Use a separate local folder, GitHub repository, and Vercel project named `proofvault`.
- Do not merge this project with DecisionOS, `stock-portfolio-dashboard`, `Dan-Agent-F`, or any other project.
- Keep the MVP free to build and deploy on Vercel Hobby.
- Keep the application local-first only.
- Do not add paid APIs, OpenAI API usage in production, a backend, server-side persistence, login/authentication, Supabase, Firebase, cloud databases, or external runtime data sources.
- All user data stays in the browser unless the user manually exports JSON.
- Use IndexedDB for local browser storage.
- Export/import JSON is the only MVP backup and migration method.
- Scoring must be deterministic, transparent, and testable.
- Warnings must explain the trigger condition and must not tell users what legal action to take.
- File upload is optional and excluded from the MVP unless it can be added without increasing project complexity.

## Required Technology Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Minimal shadcn/ui-compatible primitives where useful
- Vitest
- Testing Library with jsdom
- Native IndexedDB wrapper
- Vercel for deployment
- pnpm as the package manager

Do not add unnecessary dependencies. Do not add charting, state-management, storage, validation, or animation libraries unless the owner approves the dependency or the need is unavoidable.

## Product and Design Direction

ProofVault should have its own identity. It must not reuse the cream/private-banking visual style from DecisionOS or the stock portfolio dashboard.

The interface should feel secure, practical, clean, modern, and utility-focused. Use a graphite/slate foundation, cool gray surfaces, a restrained teal safety accent, and amber or rose status colors for warnings and errors. The interface should be direct, readable, and efficient rather than decorative.

## Engineering Rules

- Keep domain logic framework-independent and deterministic.
- Define explicit TypeScript types for items, evidence checklist state, issue timeline entries, claim status, readiness score, warnings, storage payloads, and import/export payloads.
- Avoid `any`.
- UI components must not independently recalculate scoring formulas.
- Keep all advice-like language descriptive and non-prescriptive.
- Validate imported data before it replaces local data.
- Failed imports must not overwrite existing local data.
- Handle empty, incomplete, invalid, expired, and zero-data states without crashes, `NaN`, or misleading output.
- Use semantic HTML, labeled form fields, keyboard-accessible controls, and visible focus states.
- Keep code, identifiers, comments, commits, and technical documentation in clear English.

## Project Knowledge Sources

Agents must read these files before making product or architectural changes:

1. `AGENTS.md` defines governance, constraints, and decision authority.
2. `PROJECT_CONTEXT.md` defines the product model, UX, data flow, and delivery sequence.
3. `DECISIONS.md` records approved product and technical decisions.
4. `DESIGN.md` defines persistent UI design direction and tokens after the first UI implementation.

Keep these documents synchronized when an approved change affects project scope, architecture, data handling, scoring semantics, privacy, or user experience.

## Decision-Making Policy

Agents may independently make reversible, low-risk decisions that follow this document and existing repository patterns. Examples include component boundaries, naming refinements, small accessibility improvements, and test organization.

Agents must ask the owner before changing:

- Product scope or the meaning of a feature
- Readiness scoring semantics, scoring weights, warning thresholds, or claim status meaning
- Data storage, privacy, authentication, backup, or import/export behavior
- Major dependencies or replacements to the required stack
- Visual direction or primary interaction model
- Deployment strategy or repository ownership
- Any behavior that could be interpreted as legal, financial, or professional advice

When requirements are incomplete, use this order of precedence:

1. Protect user privacy, deterministic scoring, and non-advisory positioning.
2. Follow the explicit owner request and this document.
3. Follow existing project conventions.
4. Choose the smallest reversible solution that satisfies the requirement.
5. Record important assumptions and escalate high-impact ambiguity to the owner.

## Quality Guardrails

- Readiness outputs must be deterministic, testable, and derived from visible or documented inputs.
- Unit tests must cover scoring, warnings, validation, and import/export behavior.
- UI tests must cover data entry, checklist updates, score updates, deadline warnings, export, and reset.
- Before considering a change complete, run linting, type checking, tests, production build, and browser verification.
