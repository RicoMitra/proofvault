# Project Context

## Product Summary

ProofVault is a local-first web dashboard for tracking whether purchase or service evidence is ready for a return, warranty claim, repair request, or seller complaint. It turns user-entered item details, evidence checklist status, deadlines, and issue history into deterministic readiness scores and transparent warnings.

ProofVault is not a legal advisor, professional advisor, AI advisor, automated claim tool, expense tracker, or generic file manager.

## Target User and Experience

The primary user is an everyday buyer who may need to prove purchase, warranty coverage, seller communication, product identity, or issue history after something goes wrong.

The experience should be practical and quick:

- Add a purchase or service record.
- See what proof is missing.
- See whether important deadlines are expired or closing soon.
- Understand a readiness score from visible factors.
- Export a local JSON backup when needed.

## MVP Goals

- Make claim readiness understandable at a glance.
- Reduce the risk of missing receipts, serial numbers, warranty evidence, seller chats, or deadline awareness.
- Keep every calculation deterministic and testable.
- Keep all private user data in the browser.
- Demonstrate production-minded frontend engineering in a clean public GitHub portfolio project.

## Non-Goals

- Legal advice or professional advice
- AI advice, OpenAI integration, or LLM-generated recommendations
- Backend services, cloud persistence, authentication, or accounts
- External runtime data sources
- File management beyond checklist-based evidence tracking for MVP
- Automated seller communication or claim submission
- Expense tracking, budgeting, or tax reporting

## MVP Data Model

Each vault item contains:

- Item or service name
- Category
- Seller
- Purchase date
- Optional return deadline
- Optional warranty deadline
- Optional serial number
- Optional purchase price
- Notes
- Claim status
- Evidence checklist
- Issue timeline entries

Evidence checklist fields:

- Receipt or invoice
- Warranty terms or card
- Serial number or product identity photo recorded
- Payment proof
- Seller chat
- Product photos
- Issue photos or videos
- Service report

Claim status values:

- `not-started`
- `preparing`
- `contacted-seller`
- `submitted`
- `in-review`
- `resolved`
- `rejected`
- `abandoned`

## Readiness Score

The readiness score is a 0-100 deterministic score:

- Evidence completeness: 45 points
- Deadline safety: 25 points
- Identity traceability: 15 points
- Issue documentation: 10 points
- Claim status clarity: 5 points

Every score must include a factor breakdown and text reasons. The score describes evidence readiness only. It must not imply the user will win a dispute, receive a refund, or has a legal claim.

## Warning Rules

Warnings are deterministic and descriptive:

- Missing receipt or invoice
- Missing serial number or product identity evidence
- Return deadline expired
- Return deadline closing within 7 days
- Warranty deadline expired
- Warranty deadline closing within 30 days
- Weak evidence trail

Warnings explain the trigger condition and must not instruct users to take legal action.

## Data Access and Privacy

The source of truth is data entered directly by the user in the browser. ProofVault sends no user data to a server and uses no external runtime data source.

MVP persistence uses IndexedDB on the current browser and device. Export/import JSON is the only backup and migration method.

If saved data is missing, malformed, or from an unsupported schema version, the application must fail safely without replacing valid local data.

## Application Flow

1. Capture user input through labeled fields and checklist controls.
2. Validate and normalize the item into typed domain data.
3. Persist valid records in IndexedDB.
4. Derive readiness scores and warnings from pure functions.
5. Render dashboard summaries, item rows, item detail, score breakdowns, and warning text.
6. Export or import versioned JSON only when the user explicitly chooses to.
7. Verify behavior with automated checks and browser testing.

The data flow is one-directional: user input becomes validated domain data, domain data becomes derived readiness output, and derived output becomes presentation state.

## UX Direction

ProofVault uses a secure utility aesthetic: graphite/slate foundation, cool gray surfaces, restrained teal safety accent, and clear amber/rose status states.

The first screen is the actual dashboard, not a marketing page. It should support scanning, comparison, and repeated updates. The UI should distinguish user-entered values from calculated readiness outputs.

## Delivery Sequence

1. Create governance docs and initialize the separate repository.
2. Scaffold the Next.js application and tooling.
3. Implement typed domain model, scoring, warnings, validation, and tests.
4. Implement IndexedDB persistence and JSON import/export.
5. Build the dashboard UI and design documentation.
6. Run lint, typecheck, tests, and production build.
7. Verify in a browser on desktop and mobile widths.
8. Commit, push to GitHub repo `proofvault`, and connect a new Vercel project named `proofvault`.

## Definition of Done

The MVP is complete when a user can add a vault item, update evidence checklist status, see readiness score changes, see deadline warnings, export/import JSON, reset local data, and use the dashboard on desktop and mobile. Linting, type checking, tests, production build, and browser verification must pass before deploy.
