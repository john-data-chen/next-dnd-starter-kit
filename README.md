# Next.js Project Management Tool | Full-Stack Portfolio Project

[![codecov](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit/graph/badge.svg?token=VM0ZK1S8U5)](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_next-dnd-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_next-dnd-starter-kit)
[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## About This Project

A production-grade Kanban board application I built independently to demonstrate full-stack ownership. This project reflects my engineering approach: **quality-first development with comprehensive testing, automated CI/CD, and maintainable architecture**.

**[Live Demo](https://next-dnd-starter-kit.vercel.app)** | **[Monorepo Evolution](https://github.com/john-data-chen/turborepo-starter-kit)**

<img src="./public/assets/Screen_Recording.gif" alt="Demo" width="270" height="579">

---

## Engineering Metrics

| Metric         | Result                                                        |
| -------------- | ------------------------------------------------------------- |
| Test Coverage  | **70%+** via Vitest (unit + integration)                      |
| Code Quality   | **SonarQube A** across Security, Reliability, Maintainability |
| Performance    | **Lighthouse 90+** on all categories                          |
| E2E Validation | Cross-browser (Chrome, Safari, Edge) via Playwright           |
| CI/CD Pipeline | GitHub Actions → SonarQube + Codecov → Vercel                 |

<img src="./public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

---

## Technical Decisions

### Quality Assurance

| Layer             | Tool       | Rationale                                    |
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

| Concern   | Choice                | Rationale                                        |
| --------- | --------------------- | ------------------------------------------------ |
| Framework | Next.js (App Router)  | SSG for static pages, SSR for dynamic content    |
| State     | Zustand               | 40% less boilerplate than Redux, simpler testing |
| Forms     | React Hook Form + Zod | Type-safe validation, composable schemas         |
| Database  | MongoDB + Mongoose    | Document model fits board/project/task hierarchy |
| Auth      | Auth.js               | Native Next.js integration, OAuth support        |
| DnD       | dnd-kit               | Lightweight, accessible, extensible              |
| i18n      | next-intl             | App Router native support                        |
| UI        | Tailwind + shadcn/ui  | Consistent design system, rapid iteration        |

### Developer Experience

| Tool             | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| Turbopack        | Rust bundler with filesystem caching for fast HMR |
| Oxlint           | 50-100x faster than ESLint, clearer diagnostics   |
| Prettier + Husky | Pre-commit quality enforcement                    |
| Commitizen       | Conventional commits for clean history            |

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

## AI-Assisted Development Workflow

This project integrates AI tools into a structured development workflow, focusing on measurable productivity gains while maintaining code quality. Each tool was evaluated based on context awareness, workflow integration, and production stability.

### Integrated Toolchain

**Development Environments**

| Tool                                                     | Purpose                          | Integration Benefit                                   |
| -------------------------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| [Claude Code](https://github.com/anthropics/claude-code) | AI-assisted coding and debugging | Deep codebase understanding with autonomous workflows |
| [Windsurf](https://windsurf.com/)                        | AI-native IDE                    | Inline suggestions with full context awareness        |
| [Zed](https://zed.dev/)                                  | High-performance editor          | Fast iteration with integrated AI assistance          |
| [Kilo Code](https://github.com/Kilo-Org/kilocode)        | VS Code extension                | AI capabilities in familiar environment               |

**MCP (Model Context Protocol) Servers**

MCP enables AI tools to interact directly with development infrastructure, eliminating context-switching overhead:

| Server                                                                                                | Integration Point     | Workflow Enhancement                      |
| ----------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------- |
| [chrome-devtools](https://github.com/anthropics/anthropic-quickstarts)                                | Browser state         | Debug without leaving the editor          |
| [context7](https://github.com/upstash/context7)                                                       | Documentation         | Current library docs during development   |
| [Next.js](https://nextjs.org/docs/app/guides/mcp)                                                     | Framework diagnostics | Direct access to build errors and routes  |
| [sequential-thinking](https://www.npmjs.com/package/@modelcontextprotocol/server-sequential-thinking) | Problem decomposition | Structured approach for complex decisions |
| [playwright](https://github.com/microsoft/playwright-mcp)                                             | E2E test automation   | Browser-aware test authoring              |

**CI/CD Integration**

| Tool                                                                    | Stage     | Purpose                                |
| ----------------------------------------------------------------------- | --------- | -------------------------------------- |
| [Gemini Code Assist](https://github.com/marketplace/gemini-code-assist) | PR Review | Automated code review and PR summaries |

---

## Quick Start

### Requirements

- Node.js >= 24.11.0 (LTS)
- pnpm 10.x
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
│   ├── auth.ts # Authentication functions
│   ├── store.ts # State management functions
│   └── utils.ts # tailwindcss utils
├── middleware.ts
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
| Performance      | 50-100x faster than ESLint (2s for full project lint) |
| DX Improvement   | Clearer error messages, simpler config than ESLint 9+ |
| Migration Impact | Removed 10 ESLint packages from dependency tree       |

Type-aware rules are available but kept in evaluation for this project. [Oxlint Docs](https://oxc.rs/blog/2025-06-10-oxlint-stable.html)

### Turbopack + Filesystem Caching

| Aspect      | Details                                               |
| ----------- | ----------------------------------------------------- |
| Status      | **Production** - default in Next.js 16                |
| Performance | Near-instant HMR, incremental compilation             |
| Caching     | Filesystem caching persists artifacts across restarts |

[Turbopack Docs](https://nextjs.org/docs/app/api-reference/turbopack) | [FS Caching](https://nextjs.org/blog/next-16#turbopack-file-system-caching-beta)

### Oxfmt (Rust-based Formatter)

| Aspect      | Details                                           |
| ----------- | ------------------------------------------------- |
| Status      | **Evaluation** - enabled for local development    |
| Performance | ~50x faster than Prettier with instant cold start |

[Oxfmt Docs](https://oxc.rs/docs/guide/usage/formatter)

### React Compiler

| Aspect    | Details                                                                    |
| --------- | -------------------------------------------------------------------------- |
| Status    | **Evaluated, deferred**                                                    |
| Trade-off | +5-10% Lighthouse score vs +30-40% build time                              |
| Decision  | Build time cost outweighs marginal performance gain for this project scope |

[React Compiler Docs](https://react.dev/learn/react-compiler)

### Live Demo Constraints

| Aspect             | Current State                       | Production Recommendation           |
| ------------------ | ----------------------------------- | ----------------------------------- |
| **Hosting Region** | Hong Kong (free tier)               | Multi-region CDN deployment         |
| **Response Time**  | Variable latency for non-Asia users | Edge functions or regional backends |
| **Translations**   | EN complete, DE partial             | Professional localization service   |

The demo deployment uses free-tier infrastructure to minimize costs. Production deployments should implement proper CDN and regional optimization.
