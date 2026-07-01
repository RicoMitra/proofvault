# Evidence OS

Evidence OS is a local-first career evidence dashboard for turning scattered proof into portfolio-ready material. It helps users organize screenshots, certificates, GitHub links, project notes, achievements, testimonials, documents, and transaction proof into structured evidence that can become GitHub README sections, resume bullets, and portfolio case studies.

Evidence OS is manual-first. It does not auto-classify evidence, run OCR, call AI APIs, require login, or store data in a cloud database.

## Features

- Type-first Evidence Inbox
- Evidence Card with deterministic credibility score
- Career Story Builder
- Markdown export
- GitHub README section export
- Resume bullet export
- Portfolio case-study export
- Versioned JSON backup/import
- Local reset action
- Browser-first IndexedDB persistence

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest
- Testing Library
- Native IndexedDB
- Vercel

## Local Workflow

```powershell
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deployment

- GitHub: https://github.com/RicoMitra/proofvault
- Vercel production: https://proofvault-seven.vercel.app

## Privacy Model

All MVP data stays in the current browser through IndexedDB. Evidence OS has no backend, login, cloud database, paid API, AI API, OCR dependency, payment system, team workspace, or cloud sync. JSON export/import is the only MVP backup and migration method.

Public Markdown exports omit private notes.

## Non-Advisory Positioning

Evidence OS helps structure career evidence for writing and portfolio presentation. It does not provide career advice, hiring guarantees, legal advice, or professional certification.
