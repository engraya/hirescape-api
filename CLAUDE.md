# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server via nodemon (watches src/, auto-restarts on TS changes)
npm run build      # Compile TypeScript → dist/
npm run seed       # Populate MongoDB with 20 fake jobs + seed user (seed@jobnest.dev / Seed@1234)
npm test           # Placeholder — no test suite exists yet
```

No linting script is configured. TypeScript strict mode (`strict: true`, `noImplicitAny`, `noUnusedLocals`) catches most type errors at build time.

## Architecture

HireIQ is an AI-powered job matching REST API (Express + TypeScript + MongoDB). Requests flow: **Router → Controller → Model/AI service**.

```
src/
├── index.ts            # Entry point: middleware stack, DB connect, route mount
├── routers/            # Route definitions (authRouter, jobRouter, aiRouter)
├── controllers/        # Business logic (authController, jobController, aiController)
├── models/             # Mongoose schemas (userModel, jobModel)
├── middlewares/        # isAuthenticated (JWT), isAdmin
├── ai/                 # AI layer (aiService, prompts, embeddings, resumeParser)
├── utils/              # hashing, sendMail, validator (Joi schemas)
├── types/              # Express.Request.user augmentation
└── seed/               # seedJobs.ts
```

### Route Prefixes
- `/api/auth` — register, login, logout, user CRUD
- `/api/jobs` — job CRUD, apply/withdraw, user-scoped listings
- `/api/ai` — 10 AI feature endpoints (rate-limited: 20 req/15 min via express-rate-limit)

### Authentication
JWT stored in an httpOnly cookie (`Authorization`). `isAuthenticated` middleware also accepts a `Authorization: Bearer <token>` header. It verifies the token and attaches `req.user` (the full Mongoose user document). Admin-only routes use `isAdmin` after `isAuthenticated`.

### AI Layer (`src/ai/`)
All AI calls go through Google Gemini (`gemini-2.0-flash` for LLM, `text-embedding-004` for vectors).

- **`aiService.ts`** — `callLLM(prompt)` and `generateEmbedding(text)` wrappers
- **`prompts.ts`** — prompt templates for all 10 features
- **`embeddings.ts`** — `embedAndSaveJob(jobId)` builds embedding text from job fields and stores a 1536-dim vector on `job.embedding` (called via `setImmediate` after job creation — non-blocking)
- **`resumeParser.ts`** — extracts text from uploaded PDFs then calls Gemini to produce structured resume JSON

Semantic search uses a MongoDB Atlas Vector Search index on `job.embedding`. The index must be created manually in Atlas.

### Key Schema Notes
- `User.password` and `User.resumeText` have `select: false` — always use `.select('+password')` when you need them.
- `Job.embedding` also has `select: false`.
- Both models have `timestamps: true`.

### Environment Variables (required)
```
PORT              # Default 5000
MONGODB_URI       # MongoDB Atlas connection string
JWT_SECRET
GEMINI_API_KEY    # Google AI Studio key for all AI features
HMACPROCESS_KEY
NODE_VERIFICATIONCODE_SENDING_EMAIL_ADDRESS
NODE_VERIFICATIONCODE_SENDING_EMAIL_PASSWORD
ALLOWED_ORIGINS   # Comma-separated CORS origins (e.g., http://localhost:3000)
```

### Error Handling Patterns
Controllers use try/catch and return inline JSON responses. There is no central error-handling middleware. Validation errors from Joi currently return 401 (should be 400 — a known inconsistency). 5xx is returned on unexpected errors.
