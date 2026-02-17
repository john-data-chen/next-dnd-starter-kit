# Next.js Project Management Tool | Full-Stack Portfolio Project with AI-Assisted Engineering

[![codecov](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit/graph/badge.svg?token=VM0ZK1S8U5)](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_next-dnd-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_next-dnd-starter-kit)
[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## About This Project

A production-grade Kanban board application. Showcases engineering practices, decision-making and AI-assisted optimization for senior full-stack roles.

**[Live Demo](https://next-dnd-starter-kit.vercel.app)** | **[Monorepo Evolution](https://github.com/john-data-chen/turborepo-starter-kit)**

<img src="./public/assets/Screen_Recording.gif" alt="Demo" width="270" height="579">

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

### Architecture

| Type      | Choice                   | Rationale                                        |
| --------- | ------------------------ | ------------------------------------------------ |
| Framework | Next.js (App Router)     | SSG for static pages, SSR for dynamic content    |
| State     | Zustand                  | 40% less boilerplate than Redux, simpler testing |
| Forms     | React Hook Form + Zod    | Type-safe validation, composable schemas         |
| Database  | MongoDB + Mongoose       | Document model fits board/project/task hierarchy |
| Auth      | Better Auth              | OAuth support                                    |
| DnD       | dnd-kit                  | Lightweight, accessible, extensible              |
| i18n      | next-intl                | App Router native support                        |
| UI        | Tailwind CSS + Shadcn/ui | Consistent design system, rapid iteration        |

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
| [context7-mcp](https://github.com/upstash/context7)                          | Documentation         | Current library docs for AI agents during development                                        |
| [nextjs-mcp](https://nextjs.org/docs/app/guides/mcp)                         | Framework diagnostics | Direct access to build errors and routes                                                     |
| [playwright-mcp](https://github.com/microsoft/playwright-mcp)                | E2E testing           | Add e2e tests by AI based on Behavior-Driven Development guidelines                          |

**AI Skills** (in `ai_docs/skills/`)

Skills extend AI capabilities for specialized tasks. Each skill contains instructions and resources that AI assistants can use.

**AI Optimization Skills** (`ai_docs/skills/ai-optimization/`)

Based on [karpathy-guidelines](https://github.com/forrestchang/andrej-karpathy-skills)

| Skill                 | Purpose                                          | When to Use                                                                                                                                                                    |
| :-------------------- | :----------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `karpathy-guidelines` | Behavioral guidelines to reduce AI coding errors | Writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria (Thinking before coding) |

**Web Skills** (`ai_docs/skills/web/`)

Based on [next-skills](https://github.com/vercel-labs/next-skills) and [vercel agent-skills](https://github.com/vercel-labs/agent-skills)

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
NEXTAUTH_SECRET=[your_secret]

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

# Generate Secret and replace NEXTAUTH_SECRET in .env
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
__tests__/
│   ├── e2e/ # End-to-end tests (by Playwright)
│   └── unit/ # Unit tests (by Vitest)
.github/ # GitHub Actions workflows
.husky/ # Husky configuration
ai-docs/ # AI documentations including skills and prompts
database/ # MongoDB docker-compose and initialization
messages/ # i18n translations
public/ # Static files such as images
src/
├── app/ # Next.js App routes
│   └── [locale] # i18n locale routers
│        ├── page.tsx # Root page
│        ├── layout.tsx # Layout component
│        ├── not-found.tsx # 404 page
│        ├── (auth)/ # Authentication routes
│             └── login/ # Login page
│        └── (workspace)/ # Workspace routes
│             └── boards/ # Kanban Overview routes
│                 └── [boardId]/ # Board
├── components/ # Reusable React components
│   └── ui/ # Shadcn UI components
├── constants/ # Application-wide constants
├── hooks/ # Custom React hooks
├── i18n/ # i18n configs
├── lib/
│   ├── db/ # Database functions
│   ├── auth/ # Authentication functions
│   ├── store.ts # State management functions
│   └── utils.ts # tailwindcss utils
├── proxy.ts # the middleware for handling API requests
├── models/ # Database models
├── styles/ # Global styles
├── types/ # Type definitions
└── env.example # Environment variables example
```

---

## Modern Tooling Adoption

Part of my engineering approach involves continuously evaluating emerging tools and making data-driven adoption decisions. This section documents tools I've integrated after hands-on evaluation, demonstrating measurable impact on developer productivity.

### Oxlint (Rust-based Linter)

| Aspect           | Details                                               |
| ---------------- | ----------------------------------------------------- |
| Status           | **Production** - core linting enabled                 |
| Performance      | 50-100x faster than ESLint                            |
| DX Improvement   | Clearer error messages, simpler config than ESLint 9+ |
| Migration Impact | Removed 10 ESLint packages from dependency tree       |

Type-aware rules are available but kept in evaluation for this project. [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) | [Type-Aware Linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html)

### Oxfmt (Rust-based Formatter)

| Aspect      | Details                                          |
| ----------- | ------------------------------------------------ |
| Status      | **Evaluation** - enabled for evaluation          |
| Performance | 30x faster than Prettier with instant cold start |

[Oxfmt](https://oxc.rs/docs/guide/usage/formatter)

### Turbopack + Filesystem Caching

| Aspect      | Details                                    |
| ----------- | ------------------------------------------ |
| Status      | **Production** - default in Next.js latest |
| Performance | Near-instant HMR, incremental compilation  |
| Caching     | Filesystem caching persists artifacts      |

[Turbopack](https://nextjs.org/docs/app/api-reference/turbopack) | [FS Caching](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache)

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
