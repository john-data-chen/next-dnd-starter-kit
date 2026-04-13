# Next.js Kanban Board | Full-Stack Portfolio with AI-Assisted Engineering

[![codecov](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit/graph/badge.svg?token=VM0ZK1S8U5)](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_next-dnd-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_next-dnd-starter-kit)
[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-grade Kanban board built with Next.js, demonstrating technical decision-making, quality engineering, and AI-assisted development practices. This is the monolithic origin — see below for how it evolved into a multi-platform monorepo.

**[Live Demo](https://next-dnd-starter-kit.vercel.app)**

<img src="./public/assets/Screen_Recording.gif" alt="Demo" width="270" height="579">

---

## Monorepo Evolution

This project was strategically re-architected through three stages, each driven by a clear engineering rationale:

| Stage                 | Architecture                                                                  | Key Decision                                                                |
| :-------------------- | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **1. Monolith**       | Next.js full-stack (this repo)                                                | Ship fast, validate product-market fit with a single deployable unit        |
| **2. Decoupled**      | Next.js frontend + Nest.js backend                                            | Separate concerns for independent team scaling and deployment cycles        |
| **3. Multi-Platform** | [Turborepo monorepo](https://github.com/john-data-chen/turborepo-starter-kit) | Share business logic (state, types, i18n, validation) across Web and Mobile |

The monorepo evolution introduces shared packages (`@repo/store`, `@repo/i18n`, `@repo/ui`) that enable a write-once approach for state management, validation, and types — while each platform (Next.js web, Expo mobile, Nest.js API) maintains full control over its UI and deployment. This mirrors the architectural pattern used by teams scaling from a single product to a platform.

---

## Engineering Metrics

| Metric         | Result                                                        |
| -------------- | ------------------------------------------------------------- |
| Test Coverage  | **80%+** via Vitest (unit + integration)                      |
| Code Quality   | **SonarQube A** across Security, Reliability, Maintainability |
| Performance    | **Lighthouse 90+** on all categories                          |
| E2E Validation | Cross-browser (Chrome, Safari, Edge) via Playwright           |
| CI/CD Pipeline | GitHub Actions → SonarQube + Codecov → Vercel                 |

<img src="./public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

---

## Technical Decisions

### Architecture

| Type      | Choice                   | Rationale                                               |
| --------- | ------------------------ | ------------------------------------------------------- |
| Framework | Next.js (App Router)     | Cache Components (PPR) for mixed static/dynamic content |
| State     | Zustand                  | 40% less boilerplate than Redux, simpler testing        |
| Forms     | React Hook Form + Zod    | Type-safe validation, composable schemas                |
| Database  | MongoDB + Mongoose       | Document model fits board/project/task hierarchy        |
| Auth      | Better Auth              | OAuth support                                           |
| DnD       | dnd-kit                  | Lightweight, accessible, extensible                     |
| i18n      | next-intl                | App Router native support                               |
| UI        | Tailwind CSS + Shadcn/ui | Consistent design system, rapid iteration               |

### Quality Assurance

| Type              | Tool       | Rationale                                    |
| ----------------- | ---------- | -------------------------------------------- |
| Unit/Integration  | Vitest     | Faster than Jest, native ESM, simpler config |
| E2E               | Playwright | Cross-browser support, lighter than Cypress  |
| Static Analysis   | SonarQube  | Enterprise-grade quality gates in CI         |
| Coverage Tracking | Codecov    | Automated PR integration                     |

**Testing Strategy:**

- Unit tests target store logic, validations, and isolated components
- E2E tests validate critical flows (auth)
- Every PR triggers the full pipeline before merge

### Developer Experience

| Tool       | Purpose                                           |
| ---------- | ------------------------------------------------- |
| Turbopack  | Rust bundler with filesystem caching for fast HMR |
| Oxlint     | 50-100x faster than ESLint, clearer diagnostics   |
| Oxfmt      | 30x faster formatter than Prettier                |
| Husky      | Pre-commit quality enforcement                    |
| Commitizen | Conventional commits for clean history            |

---

## Features

- Drag-and-drop Kanban with multi-project support
- Role-based permissions (Owner / Member)
- Task assignment with audit tracking
- Search and filter
- Theme switching (light/dark)
- Responsive design (mobile → desktop)
- i18n (English, German)

---

## Permission Model

| Capability          | Owner | Member |
| ------------------- | ----- | ------ |
| Manage Board        | Yes   | No     |
| Create Project/Task | Yes   | Yes    |
| Edit All Content    | Yes   | No     |
| Edit Own Content    | Yes   | Yes    |
| View All Content    | Yes   | Yes    |

---

## AI-Augmented Engineering Workflow

This project demonstrates a "Human-in-the-Loop" architecture where AI tools are orchestrated to amplify engineering impact. The focus is not just on code generation, but on **architectural leverage, rigorous quality assurance, and accelerated velocity**.

### Orchestration & Agency

I utilize a suite of specialized AI tools, each assigned specific roles to mimic a high-performing engineering team structure.

| Role              | Tool                                                                    | Responsibility                      | Impact                                                                                                                                   |
| :---------------- | :---------------------------------------------------------------------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Architect**     | [Claude Code](https://github.com/anthropics/claude-code)                | System design & complex refactoring | Handles multi-file architectural changes with deep context awareness, perfect for making plans for other AI tools.                       |
| **Plan Executor** | [Kilo Code](https://github.com/Kilo-Org/kilocode)                       | Code writing                        | Follow the plan by Architect, implement functionality and refactor using a faster and cheaper models coming from MiniMax, Z.AI and Kimi. |
| **QA**            | [Gemini CLI](https://github.com/google-gemini/gemini-cli)               | Writing test cases                  | Gemini flash is the cheapest option in top models, perfect for writing test cases.                                                       |
| **PR Reviewer**   | [Gemini Code Assist](https://github.com/marketplace/gemini-code-assist) | Automated PR Review                 | Enforces code standards and catches potential bugs before human reviewer.                                                                |

**MCP (Model Context Protocol) Servers**

MCP enables AI tools to interact directly with development infrastructure, eliminating context-switching overhead:

| Server                                                                       | Integration Point     | Workflow Enhancement                                                                         |
| ---------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Browser state         | Allows AI agents to directly inspect and manipulate browser state via the DevTools Protocol. |
| [context7-mcp](https://github.com/upstash/context7)                          | Documentation         | Get current library docs for AI agents                                                       |
| [nextjs-mcp](https://nextjs.org/docs/app/guides/mcp)                         | Framework diagnostics | Allow AI agents direct access to dev server logs and routes                                  |
| [playwright-mcp](https://github.com/microsoft/playwright-mcp)                | E2E testing           | Allow AI agents direct access to run e2e tests                                               |

**AI Skills** (in `ai_docs/skills/`)

Skills extend AI capabilities for specialized tasks. Each skill contains instructions and resources that AI assistants can use.

**AI Optimization Skills** (`ai_docs/skills/ai-optimization/`)

Based on [karpathy-guidelines](https://github.com/forrestchang/andrej-karpathy-skills)

| Skill                 | Purpose                                          | When to Use                                                                                                                                                                    |
| :-------------------- | :----------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `karpathy-guidelines` | Behavioral guidelines to reduce AI coding errors | Writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria (Thinking before coding) |

**Web Skills** (`ai_docs/skills/web/`)

Based on [Vercel Agent Skills](https://vercel.com/docs/agent-resources/skills)

| Skill                         | Purpose                     | When to Use                                                                   |
| :---------------------------- | :-------------------------- | :---------------------------------------------------------------------------- |
| `next-best-practices`         | Next.js best practices      | Writing, reviewing, or refactoring Next.js code                               |
| `next-cache-components`       | Next.js 16 cache components | Implementing `use cache`, PPR, cacheLife, cacheTag, or updateTag              |
| `vercel-composition-patterns` | React composition patterns  | Refactoring components, building reusable component APIs, compound components |
| `vercel-react-best-practices` | React performance rules     | Writing, reviewing, or refactoring React/Next.js code for performance         |
| `web-design-guidelines`       | UI/UX accessibility audits  | "Review my UI", "Check accessibility", "Audit design"                         |

**AI Guidelines** (`ai_docs/PROMPTS.md`)

Project-specific instructions for AI assistants including repository structure, commands, file conventions, and example workflows. Adhering to these guidelines reduces AI hallucinations and increases the accurate utilization of skills and MCP servers by approximately 40-60%. AI tools should reference this file first when working on this project.

**How to Use:**

This is an example of how to use prompts and skills in Claude Code, you should check the documentation of other AI tools for more details.

- Create a folder named `.claude`
- Copy skills you need from `ai_docs/skills/` to `.claude/skills/`
- Copy or create a symbolic link of `PROMPTS.md` to your AI tool's context file location
  | AI Tool | Target Path |
  | ----------- | ------------------- |
  | Claude Code | `[root-folder]/CLAUDE.md` |
- Restart the Claude Code

### Measurable Impact

By treating AI as an integrated part of the stack, this project achieves:

- **Velocity**: 5-10x faster implementation of boilerplate and standard patterns.
- **Quality**: Higher test coverage (80%+) through AI-generated test scaffolding.
- **Learning**: Rapid mastery of new tools (Vitest, Playwright...and more) via AI-guided implementation.
- **Cost**: Lower costs by using AI agents skills to reduce tokens and match the best practice in frontend.
- **Focus**: Shifted engineering time from syntax to system architecture and user experience.

---

## Quick Start

### Requirements

- Node.js latest LTS version
- PNPM latest version
- Docker / OrbStack (for local MongoDB)

### Environment Configuration

Local Development:

Create a `.env (.env.test for testing)` file in the project root with the following variables:

```text
# Application Environment
# Options: default: development | production | test: for testing
NODE_ENV=development

# Authentication Secret
# Required: A secure random string for JWT token encryption
# Generate: openssl rand -base64 32
# Warning: Keep this value private and unique per environment
AUTH_SECRET=[your_secret]

# Database Connection
# Format: mongodb://[username]:[password]@[host]:[port]/[database]?[options]
# Required fields:
# - username: Database user with appropriate permissions (default: root)
# - password: User's password (default: 123456)
# - host: Database host (localhost for development)
# - port: MongoDB port (default: 27017)
# - database: Database name (default: next-project-manager)
# - options: Additional connection parameters (default: authSource=admin)
# Example: DATABASE_URL="mongodb://root:123456@localhost:27017/next-project-manager?authSource=admin"
```

### Setup

```bash
pnpm install

# Environment
cp env.example .env

# Generate Secret and replace AUTH_SECRET in .env
openssl rand -base64 32

# Database
cd database && docker-compose up -d && cd ..
pnpm init-db

# Run
pnpm dev           # Development
pnpm test          # Unit tests
pnpm playwright    # E2E tests
pnpm build         # Production build
```

---

## Project Structure

```text
├── __tests__/                    # Test suite
│   ├── e2e/                      # End-to-end tests (Playwright)
│   └── unit/                     # Unit tests (Vitest)
├── .github/workflows/            # GitHub Actions CI/CD
├── .husky/                       # Git hooks (pre-commit, commit-msg, etc.)
├── ai_docs/                      # AI documentation & skills
│   ├── PROMPTS.md                # AI prompts & guidelines
│   ├── task-template.md          # Task template for AI agents
│   └── skills/                   # AI skills library
│       ├── ai-optimization/      # karpathy-guidelines
│       └── web/                  # Web-specific skills
│           ├── next-best-practices/
│           ├── next-cache-components/
│           ├── vercel-composition-patterns/
│           ├── vercel-react-best-practices/
│           └── web-design-guidelines/
├── database/                     # MongoDB docker-compose & initialization
├── messages/                     # i18n translations (de.json, en.json)
├── public/assets/                # Static assets (images, GIFs)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/            # i18n locale routing
│   │   │   ├── (auth)/         # Authentication routes
│   │   │   │   ├── layout.tsx
│   │   │   │   └── login/page.tsx
│   │   │   ├── (workspace)/    # Main workspace routes
│   │   │   │   ├── boards/[boardId]/
│   │   │   │   │   ├── error.tsx
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── boards/page.tsx
│   │   │   │   ├── boards/loading.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── AuthenticatedLayout.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── MessagesProvider.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── api/                 # API route handlers
│   │   │   ├── auth/          # Auth: session, sign-in, sign-out
│   │   │   ├── boards/route.ts
│   │   │   ├── projects/[id]/permissions/route.ts
│   │   │   ├── tasks/[id]/permissions/route.ts
│   │   │   └── users/         # users, users/search
│   │   └── global-error.tsx
│   ├── components/
│   │   ├── auth/               # SignInView, UserAuthForm
│   │   ├── kanban/
│   │   │   ├── board/         # Board, BoardActions, BoardForm, etc.
│   │   │   ├── project/       # Project, ProjectAction, ProjectForm, etc.
│   │   │   ├── task/          # TaskCard, TaskAction, TaskForm, etc.
│   │   │   └── BoardOverview.tsx
│   │   ├── layout/             # AppSidebar, Header, UserNav, etc.
│   │   └── ui/                # Shadcn UI components
│   ├── constants/              # common.ts, db.ts, routes.ts, ui.ts, demoData.ts
│   ├── hooks/                  # useAuthForm, useBoards, useTaskForm, etc.
│   ├── i18n/                   # navigation.ts, request.ts, routing.ts
│   ├── lib/
│   │   ├── auth/              # client.ts, server.ts, index.ts
│   │   ├── config/            # env.ts
│   │   ├── db/                # board.ts, project.ts, task.ts, user.ts, connect.ts
│   │   ├── stores/             # auth-store.ts, board-store.ts, project-store.ts
│   │   ├── store.ts           # Re-export for backward compatibility
│   │   └── utils.ts           # Tailwind CSS utilities
│   ├── models/                 # MongoDB/Mongoose models
│   │   ├── board.model.ts
│   │   ├── project.model.ts
│   │   ├── task.model.ts
│   │   └── user.model.ts
│   ├── styles/                 # globals.css
│   ├── types/                  # TypeScript type definitions
│   └── proxy.ts                # API request proxy middleware
├── env.example                  # Environment variables template
├── package.json
├── tsconfig.json
├── next.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── .oxlintrc.json              # Oxlint configuration
├── .oxfmtrc.json               # Oxfmt configuration
├── sonar-project.properties
└── commitlint.config.mjs
```

---

## Modern Tooling Adoption

Part of my engineering approach involves continuously evaluating emerging tools and making data-driven adoption decisions. This section documents tools I've integrated after hands-on evaluation, demonstrating measurable impact on developer productivity.

### Oxlint (Rust-based Linter)

| Aspect           | Details                                               |
| ---------------- | ----------------------------------------------------- |
| Status           | **Production** - core and type-aware linting enabled  |
| Performance      | 50-100x faster than ESLint                            |
| DX Improvement   | Clearer error messages, simpler config than ESLint 9+ |
| Migration Impact | Removed 10 ESLint packages from dependency tree       |

[Oxlint](https://oxc.rs/docs/guide/usage/linter.html) | [Type-Aware Linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html)

### Oxfmt (Rust-based Formatter)

| Aspect      | Details                                          |
| ----------- | ------------------------------------------------ |
| Status      | **Production** - enabled                         |
| Performance | 30x faster than Prettier with instant cold start |

[Oxfmt](https://oxc.rs/docs/guide/usage/formatter)

### Turbopack + Filesystem Caching

| Aspect      | Details                                    |
| ----------- | ------------------------------------------ |
| Status      | **Production** - default in Next.js latest |
| Performance | Near-instant HMR, incremental compilation  |
| Caching     | Filesystem caching persists artifacts      |

[Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) | [FS Caching](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache)

### Type Script 7

| Aspect    | Details                                                                                   |
| --------- | ----------------------------------------------------------------------------------------- |
| Status    | **Evaluation** - tracking for future adoption                                             |
| What      | A native port of the TypeScript compiler from JavaScript to Go, releasing as TypeScript 7 |
| Build     | ~10x faster `tsc` builds                                                                  |
| Editor    | ~8x faster project load time with LSP migration                                           |
| Memory    | ~50% reduction in memory usage compared to the JS-based compiler                          |
| Trade-off | Will evaluate migration once TS 7 reaches stable maturity and ecosystem readiness         |

[TypeScript Native Port](https://devblogs.microsoft.com/typescript/typescript-native-port/) | [typescript-go repo](https://github.com/microsoft/typescript-go)

### React Compiler

| Aspect    | Details                                                                    |
| --------- | -------------------------------------------------------------------------- |
| Status    | **Evaluated, deferred**                                                    |
| Trade-off | +5-10% Lighthouse score vs +30-40% build time                              |
| Decision  | Build time cost outweighs marginal performance gain for this project scope |

[React Compiler](https://react.dev/learn/react-compiler)

---

## Live Demo Constraints

| Aspect             | Current State                       | Production Recommendation           |
| ------------------ | ----------------------------------- | ----------------------------------- |
| **Hosting Region** | Hong Kong (free tier)               | Multi-region CDN deployment         |
| **Response Time**  | Variable latency for non-Asia users | Edge functions or regional backends |
| **Translations**   | EN complete, DE partial             | Professional localization service   |

The demo deployment uses free-tier infrastructure to minimize costs. Production deployments should implement proper CDN and regional optimization.
