# Production-Ready Next.js Project Management Tool Template | Drag & Drop Support <br>

[![codecov](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit/graph/badge.svg?token=VM0ZK1S8U5)](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_next-dnd-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_next-dnd-starter-kit)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Why Choose This Template:

<img src="./public/assets/Screen_Recording.gif" alt="Screen Recording" width="270" height="579">

The **Enterprise-grade Next.js template** with 80%+ test coverage, drag & drop functionality, and WAI-ARIA accessibility. It is designed for saving time while adhering to best practices and including:

- 🚀 Production-Ready: Enterprise-level architecture with full TypeScript support
- 💪 Professional Setup: CI/CD, Testing, Code Quality tools pre-configured and pass the SonarQube Quality Check
- 🎯 Developer-Friendly: Clear documentation and best practices built-in
- 📝 Full Functional: Drag & Drop, Search and Filter, User Permission Management, Multi Kanban and Project Support
- 🌐 Internationalization (i18n): English and German
- 🎨 Modern UX: Theme Switcher, Responsive Design for mobile, tablet, and desktop
- 💾 Persistent data: via MongoDB

---

**Love this template?**
If you like my templates, don't forget to **give it a star** today!

And its next version: monorepo template is development in progress, you can check it out here: [turborepo-starter-kit](https://github.com/john-data-chen/turborepo-starter-kit)

Every star motivates me to deliver more high-quality templates. 🚀

---

**Key Accomplishments**:

- Responsive Design: Ensures optimal user experience across all devices, reflecting a product-centric development approach.
- Exceptional Test Coverage (80%+): Achieved through comprehensive unit tests, significantly reducing potential bugs and enhancing long-term maintainability.
- Reliable User Experience: Validated the critical login flow across all major browsers (Chrome, Safari, Edge) on both desktop and mobile using Playwright E2E tests.
- Superior Code Quality (SonarQube All A Rating): Rigorous analysis confirms high standards in Security, Reliability, and Maintainability, minimizing technical debt and ensuring a healthy codebase.
- Automated CI/CD Pipeline (GitHub Actions, SonarQube, Codecov, Vercel): Establishes a streamlined, production-ready deployment process, ensuring rapid, reliable, and high-quality releases.
- Live Demo Deployment (Vercel): Provides immediate access to a functional application, showcasing practical deployment skills.
- Elite Web Performance & Quality (Lighthouse 90+): Achieved scores of 90+ across Performance, Accessibility, Best Practices, and SEO in Google Lighthouse, ensuring a top-tier user experience and technical excellence.

<img src="./public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

---

## 🛠️ Technical Decision

- **Frontend**: [Next](https://nextjs.org/docs/app/getting-started), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) - modern UI with strong type safety and server-side rendering (using SSG in login page for better performance, SSR in workspace pages for dynamic content)
- **Build**: [Oxlint](https://oxc.rs/docs/guide/usage/linter), [Prettier](https://prettier.io/), [Commitizen](https://commitizen.github.io/cz-cli/), [Lint Staged](https://github.com/okonet/lint-staged), [Husky](https://github.com/typicode/husky) - they are the 1st quality gate: automated code quality checks and style formatting during commit, preventing problems into codebase and make consistent code style in team work
- **UI**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/) - consistent, responsive, and scalable styling, enabling rapid and maintainable UI development
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) - they are the 2nd quality gate: easier to setup and faster execution than Jest and Cypress, chosen for their efficiency and comprehensive testing capabilities
- **Internationalization(i18n)**: [Next-intl](https://next-intl.dev/) - internationalization (i18n) support for Next.js applications
- **Authentication**: [Auth.js](https://authjs.dev/) - authentication and authorization for Next.js applications
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - minimal and testable global state management, 40% code reduction compared to Redux
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) - composable form logic and schema validation.
- **Database**: [MongoDB](https://www.mongodb.com/), [Docker compose](https://docs.docker.com/compose/), [Mongoose](https://github.com/Automattic/mongoose) - NoSQL database for storing data in a document-oriented format.
- **Drag and Drop**: [dnd-kit](https://dndkit.com/) - A lightweight, performant, accessible and extensible drag & drop toolkit
- **CI/CD**: [GitHub Actions](https://github.com/features/actions), [Vercel](https://vercel.com/home), [Codecov](https://codecov.io/), [SonarQube](https://sonarcloud.io/) - they are the 3rd quality gate: every pull request triggers a comprehensive pipeline, enforcing code quality gates and ensuring production-readiness through automated testing and deployment

---

## 🚀 Getting Started

- Press **Use this template** to create a new repository.
- Clone the repository to your local machine.

### Requirements

- Node.JS version >= 22.11.0 (the newest version of 22.x LTS), please use [NVM](https://github.com/nvm-sh/nvm) or [FNM](https://github.com/Schniz/fnm) to install
- [PNPM](https://pnpm.io/) 10.x

### Database

- In production and CI, I use [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
- In local development, I use [Docker Compose](https://docs.docker.com/compose/) in folder **database**, you need to have [Docker](https://www.docker.com/) or [OrbStack](https://orbstack.dev/) installed.

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

Production and CI:

Create environment variables in Vercel or GitHub project settings.

### Useful Commands

```bash
# rename env.example to .env
mv env.example .env

# Generate Secret and replace NEXTAUTH_SECRET in .env
openssl rand -base64 32

# start mongodb in docker
cd database
docker-compose up -d

# initialize mongodb
pnpm init-db

# stop mongodb (in database folder)
docker-compose down

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run unit and integration tests by Vitest
pnpm test

# Run E2E tests by Playwright
pnpm playwright

# Lint fix
pnpm lint

# Format code
pnpm format

# Build
pnpm build
```

---

## 🔐 Permission System

### Core Concepts

- Board can have multiple projects, it is the biggest container
- Project can have multiple tasks, it is the smallest container
- Each board has one owner and multiple members
- Tasks can be assigned to any member
- All modifications of a task are tracked with last modified user

### User Roles & Permissions

| Role         | Create Board | Delete Board | Edit All Projects | Delete Project (Cascade Tasks) | Create Project | Create Task | Edit All Tasks | Edit Own Task | Delete All Tasks | Delete Own Task | View All Projects & Tasks |
| ------------ | ------------ | ------------ | ----------------- | ------------------------------ | -------------- | ----------- | -------------- | ------------- | ---------------- | --------------- | ------------------------- |
| Board Owner  | ✔️           | ✔️           | ✔️                | ✔️                             | ✔️             | ✔️          | ✔️             | ✔️            | ✔️               | ✔️              | ✔️                        |
| Board Member | ✖️           | ✖️           | ✖️                | ✖️                             | ✔️             | ✔️          | ✖️             | ✔️            | ✖️               | ✔️              | ✔️                        |

> Note:
>
> - Board Owner has all permissions, including creating, deleting, and editing all projects and tasks.
> - Board Member can only create projects and tasks, and can only edit and delete their own projects and tasks, but can view all content.

### Task Operations

- Task creator and assignee can edit task
- Only owner of board, owner of project and creator of task can delete tasks
- Task status: To Do → In Progress → Done

---

## 📖 Detailed Technical Documentation

### 📊 Testing Strategy

- Unit Tests: Focused on critical store logic, complex form validations, and isolated component behaviors, ensuring granular code reliability.
- Test Coverage: Maintained above 80%+ (verified via npx vitest run --coverage), reflecting a commitment to robust code coverage without sacrificing test quality.
- E2E Tests: Critical user flows, such as the Login page, are validated end-to-end using Playwright, simulating real user interactions to guarantee system integrity.
- Cross-browser Testing Strategy: Ensures consistent functionality and user experience across a carefully selected range of desktop and mobile browsers based on market share, mitigating compatibility issues.

### Project Structure

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

## AI Tools

I am using AI tools to help our team improve the quality of code and the efficiency of development. This project is one of the playgrounds for AI tools.

### Editor with AI

- [Windsurf](https://windsurf.com/)
- [Zed](https://zed.dev/)

### VS code extension

- [Kilo Code](https://github.com/Kilo-Org/kilocode)

### Command line interface

- [gemini-cli](https://github.com/google-gemini/gemini-cli)
- [claude-code](https://github.com/anthropics/claude-code)

### MCP

- [chrome-devtools](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [context7](https://github.com/upstash/context7)

### GitHub Action (code review, PR summary)

- [Gemini Code Assist](https://github.com/marketplace/gemini-code-assist)

### Documentation

- [NotebookLM](https://notebooklm.google.com/)

## Experimental Tools

### Oxlint and Type-Aware plug-in

- status: enabled
- benefit:
  - 50~100 times faster than ESLint (it can lint this small project in 1.5 seconds, it has more potential in big projects with thousands of files)
  - easier to setup
  - clearer instructions showing how to fix each issue
  - many ESLint packages can be removed (in my case 10 packages)
- note: Oxlint is in a stable version, and I have used it in production for a long time.
  But Type-Aware plug-in is still in a preview version. It is not recommended to use it in production, and it is a experimental in this project.

#### Introductions

- [Oxlint](https://oxc.rs/blog/2025-06-10-oxlint-stable.html)
- [Oxlint Type-Aware Preview](https://oxc.rs/blog/2025-08-17-oxlint-type-aware.html)

### Turbopack

- status: enabled (dev and build mode)
- benefit: the Rust-based successor of webpack by Vercel, offers near-instantaneous server startup and lightning-fast Hot Module Replacement (HMR). This is achieved through its incremental architecture, which caches function-level computations, ensuring we only build what's necessary.
- [introduction](https://nextjs.org/docs/app/api-reference/turbopack)

### Prettier oxc plugin

- status: disabled (it is conflict with vs code auto formatting, since this is a small project, the speed difference is not significant)
- benefit: Increase Prettier formatting speed
- [introduction](https://www.npmjs.com/package/@prettier/plugin-oxc)

### React Compiler

- status: disabled (enable it will increase build time 30~40%, so I disable it)
- benefit: It can increase the performance score in lighthouse test 5~10% (not significant)
- [introduction](https://react.dev/learn/react-compiler)

## Known Issues & Limitations

### The errors / code smells of Oxlint and Type-Aware plug-in

- After I enabled new rules of Oxlint and Type-Aware plug-in, linter finds more code smells in the project, but warnings and errors of linter are not issues, no effect in functional.
- Cleaning technical debt is a long term plan, it is impossible to finish at once. I will clean by small steps each time.

### German Translations

This is a demo project, and I know little of German, so errors of translations might not be fixed in the near future.

### Server

- **Slow response from server**:
  - Server Region: Hong Kong
  - Issue: Sometimes Server response is slow, such as you can't search user when you add a task then find the assigner, especially for users are not in Asia (in local dev server, I tested it works fine)
  - Status: The resource of free tier is limited and no plan of CDN, it won't be fix in the near future

---

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
