# ProofVault

ProofVault is a local-first claim readiness dashboard for purchase and service evidence. It helps users track receipts, warranties, serial numbers, seller communication, issue history, deadlines, and deterministic readiness warnings.

ProofVault is not legal advice, professional advice, an AI advisor, an expense tracker, or a cloud file manager.

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

All MVP data stays in the browser through IndexedDB. ProofVault has no backend, login, cloud database, paid API, OpenAI API, or external runtime data source. JSON export/import is the only MVP backup and migration method.
