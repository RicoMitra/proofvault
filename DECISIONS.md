# Decision Log

This file records approved product and technical decisions. Add new entries instead of silently changing historical rationale. If a decision is replaced, mark it as superseded and link to the replacement entry.

## D-001: Reuse ProofVault Repository for Evidence OS

- **Status:** Accepted
- **Decision:** Convert the existing `proofvault` project into Evidence OS while keeping the same local folder, GitHub repository, and Vercel project.
- **Rationale:** The owner explicitly requested updating ProofVault rather than creating a new repo or deployment.
- **Consequence:** Product branding becomes Evidence OS, but repository and deployment ownership remain tied to `RicoMitra/proofvault`.

## D-002: Local-First Browser Storage

- **Status:** Accepted
- **Decision:** Store MVP user data in browser IndexedDB on the current device.
- **Rationale:** Career evidence can be sensitive, and the MVP must avoid accounts, servers, cloud persistence, and external services.
- **Consequence:** All persistence code stays client-side. There is no backend, authentication, Supabase, Firebase, cloud database, or server-side portfolio/evidence store.

## D-003: Manual-First Evidence Capture

- **Status:** Accepted
- **Decision:** Require the user to choose an evidence type first and enter supporting context manually.
- **Rationale:** Prior screenshot-classification work showed that auto-detection often fails and creates unknown or unrecognized records.
- **Consequence:** No full auto-classifier, OCR dependency, or AI extraction is part of the MVP. Assistance is limited to structured fields, deterministic scoring, and export formatting.

## D-004: JSON Backup and Markdown Export

- **Status:** Accepted
- **Decision:** Use versioned JSON export/import for backup and local Markdown generation for portfolio outputs.
- **Rationale:** JSON and Markdown are free, portable, inspectable, and compatible with GitHub/resume/case-study workflows.
- **Consequence:** Imports must be validated before replacing local data, failed imports must preserve existing data, and public Markdown exports must exclude private notes.

## D-005: Deterministic 0-100 Credibility Score

- **Status:** Accepted
- **Decision:** Calculate a transparent 0-100 score from source clarity, context completeness, impact specificity, verification strength, and export readiness.
- **Rationale:** A deterministic score is explainable, testable, and suitable for a portfolio project without AI or professional advice.
- **Consequence:** Scoring weights and thresholds are product semantics and require owner approval before changing.

## D-006: No External Runtime Services

- **Status:** Accepted
- **Decision:** The MVP uses only user-entered data and local browser state.
- **Rationale:** This keeps the product free, reliable, private, and deployable on free Vercel/Cloudflare-style hosting.
- **Consequence:** Do not add paid APIs, AI APIs, OCR dependencies, live data feeds, authentication, cloud sync, team workspaces, payment systems, or runtime service dependencies.

## D-007: Premium Productivity Visual Identity

- **Status:** Accepted
- **Decision:** Use a calm, polished, dashboard-first productivity identity with graphite/slate neutrals and restrained mint/teal accents.
- **Rationale:** Evidence OS should feel credible and useful without generic AI visuals or excessive decoration.
- **Consequence:** Maintain `DESIGN.md` as the persistent design source of truth.
