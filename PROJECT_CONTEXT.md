# Project Context

## Product Summary

Evidence OS is a local-first web dashboard for organizing career evidence into portfolio-ready material. It turns manually entered proof such as screenshots, certificates, GitHub links, project notes, achievements, testimonials, documents, and transaction proof into structured records, deterministic credibility signals, and Markdown exports.

Evidence OS is manual-first and smart-assisted. The user chooses the evidence type before entering details. The system helps structure fields and exports, but it does not auto-classify, run OCR, call AI APIs, or depend on external services.

## Target User and Experience

The primary user is a solo builder or early-career professional who has proof of work scattered across screenshots, links, documents, notes, and project artifacts but needs polished career material for GitHub, resumes, and portfolio case studies.

The experience should be direct:

- Add evidence by choosing its type first.
- Record source, context, impact, verification, tags, and status.
- See whether the evidence is credible and export-ready.
- Select records for a career story.
- Export Markdown locally.
- Keep all data private in the current browser.

## MVP Goals

- Make scattered career proof understandable and reusable.
- Avoid unreliable full auto-classification.
- Keep every score deterministic and testable.
- Keep all private user data in the browser.
- Produce useful README, resume, and portfolio case-study exports.
- Demonstrate production-minded frontend engineering in a public GitHub portfolio project.

## Non-Goals

- Authentication or user accounts
- Backend databases or cloud persistence
- AI APIs, OCR dependencies, or paid APIs
- Payment systems
- Team workspaces, sharing, collaboration, or cloud sync
- Automatic classification as the primary workflow
- Career advice, hiring guarantees, or professional advisory claims
- File upload/storage beyond manually recorded references in the MVP
- Obsidian file creation in this implementation

## MVP Data Model

Each evidence item contains:

- Title
- Evidence type
- Evidence date
- Source or reference
- Tags
- Category
- Context
- Impact
- Verification notes
- Status
- Private notes
- Created and updated timestamps

Evidence types:

- Project
- GitHub Repo
- Certificate
- Screenshot Progress
- Achievement
- Work Result
- Testimonial
- Document
- Receipt/Transaction Proof
- Other

Status values:

- `draft`
- `reviewing`
- `ready`
- `archived`

## Credibility Score

The credibility score is a deterministic 0-100 score:

- Source clarity: 20 points
- Context completeness: 25 points
- Impact specificity: 25 points
- Verification strength: 20 points
- Export readiness: 10 points

Every score includes a factor breakdown and text reasons. The score describes evidence readiness for portfolio writing only. It must not imply hiring quality, truth certainty, professional endorsement, or guaranteed outcomes.

## Data Access and Privacy

The source of truth is data entered directly by the user in the browser. Evidence OS sends no user data to a server and uses no external runtime data source.

MVP persistence uses IndexedDB on the current browser and device. Export/import JSON is the only backup and migration method. Public Markdown exports must not include private notes.

If saved data is missing, malformed, or from an unsupported schema version, the application must fail safely without replacing valid local data.

## Application Flow

1. Capture user input through type-first manual forms.
2. Validate and normalize the item into typed domain data.
3. Persist valid records in IndexedDB.
4. Derive credibility scores from pure functions.
5. Render inbox summaries, evidence cards, score breakdowns, and story-builder controls.
6. Export Markdown or JSON only when the user explicitly chooses to.
7. Verify behavior with automated checks and browser testing.

The data flow is one-directional: user input becomes validated domain data, domain data becomes derived credibility output, and derived output becomes presentation state.

## UX Direction

Evidence OS uses a premium productivity aesthetic: graphite/slate foundation, cool operational surfaces, restrained mint/teal accent, and calm editorial hierarchy.

The first screen is the actual dashboard, not a marketing page. It should support scanning, repeated updates, and clear export decisions. User-entered values must be visually distinct from derived score and export output.

## Delivery Sequence

1. Update governance docs for Evidence OS.
2. Replace ProofVault claim-readiness domain logic with Evidence OS domain logic.
3. Implement typed evidence model, validation, credibility scoring, exports, and tests.
4. Implement IndexedDB persistence and JSON import/export.
5. Build Evidence Inbox, Evidence Card, Career Story Builder, and export UI.
6. Update design documentation.
7. Run lint, typecheck, tests, and production build.
8. Verify in a browser on desktop and mobile widths.
9. Commit, push to GitHub repo `proofvault`, and deploy through the existing Vercel project.

## Definition of Done

The MVP is complete when a user can add career evidence manually, choose the evidence type first, search/filter the inbox, inspect credibility score factors, select evidence for a career story, export Markdown/README/resume/case-study text, export/import JSON, reset local data, and use the dashboard on desktop and mobile. Linting, type checking, tests, production build, and browser verification must pass before handoff.
