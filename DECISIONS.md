# Decision Log

This file records approved product and technical decisions. Add new entries instead of silently changing historical rationale. If a decision is replaced, mark it as superseded and link to the replacement entry.

## D-001: Separate ProofVault Project

- **Status:** Accepted
- **Decision:** Build ProofVault as a separate local folder, GitHub repository, and Vercel project named `proofvault`.
- **Rationale:** ProofVault has a different domain, data model, and visual identity from DecisionOS, `stock-portfolio-dashboard`, and `Dan-Agent-F`.
- **Consequence:** Do not merge files, deployments, or repositories with any existing project.

## D-002: Local-First Browser Storage

- **Status:** Accepted
- **Decision:** Store MVP user data in browser IndexedDB on the current device.
- **Rationale:** Claim evidence metadata can be sensitive, and the MVP must avoid accounts, servers, cloud persistence, and external services.
- **Consequence:** All persistence code stays client-side. There is no backend, authentication, Supabase, Firebase, cloud database, or server-side portfolio.

## D-003: JSON Export and Import Only

- **Status:** Accepted
- **Decision:** Use versioned JSON export/import as the only MVP backup and migration method.
- **Rationale:** JSON keeps the backup transparent, free, portable, and independent from cloud accounts.
- **Consequence:** Imports must be validated before replacing local data, and failed imports must preserve existing data.

## D-004: Deterministic 0-100 Readiness Score

- **Status:** Accepted
- **Decision:** Calculate a transparent 0-100 readiness score from evidence completeness, deadline safety, identity traceability, issue documentation, and claim status clarity.
- **Rationale:** A deterministic score is explainable, testable, and suitable for a portfolio project without AI or professional advice.
- **Consequence:** Scoring weights and thresholds are product semantics and require owner approval before changing.

## D-005: Non-Advisory Warning Language

- **Status:** Accepted
- **Decision:** Warnings explain trigger conditions but never tell users what legal action to take.
- **Rationale:** ProofVault is a readiness tool, not a legal or professional advisor.
- **Consequence:** UI copy and generated messages must remain descriptive and non-prescriptive.

## D-006: No External Runtime Data Sources

- **Status:** Accepted
- **Decision:** The MVP uses only user-entered data and local browser state.
- **Rationale:** This keeps the product free, reliable, private, and Vercel Hobby compatible.
- **Consequence:** Do not add paid APIs, OpenAI API usage, live data feeds, or runtime service dependencies.

## D-007: File Upload Excluded From MVP

- **Status:** Accepted
- **Decision:** MVP tracks whether evidence exists through checklist state and notes, without storing uploaded files.
- **Rationale:** File storage increases complexity and privacy risk.
- **Consequence:** Evidence checklist fields and timeline notes are in scope; binary file persistence can be reconsidered later.

## D-008: Secure Utility Visual Identity

- **Status:** Accepted
- **Decision:** Use a secure, practical, modern dashboard identity with slate/graphite neutrals and a restrained teal accent.
- **Rationale:** ProofVault should feel like a reliable evidence workspace and must not copy the cream/private-banking direction from other projects.
- **Consequence:** Create and maintain `DESIGN.md` after the first UI implementation.
