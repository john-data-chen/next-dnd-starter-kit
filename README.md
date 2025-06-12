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

⭐ **Love this template?**
If you like it, don't forget to [give it a star](https://github.com/john-data-chen/next-dnd-starter-kit) today!

And I have another easier starter kit: [ts-react-drag-and-drop-starter-kit
](https://github.com/john-data-chen/ts-react-drag-and-drop-starter-kit) for new users of React and TypeScript.

Every star motivates me to deliver more high-quality templates. 🚀

---

**Key Accomplishments**:

- **Test Coverage**: 80%+
- **Reliability, Security and Maintainability Rating in SonarQube**: A
- **Cross-browser Testing**: for both desktop and mobile devices.
- **CI/CD automation**: in GitHub actions and Vercel.
- **Lighthouse Performance, Accessibility, Best Practices and SEO Scores**: 95+
  <img src="./public/assets/lighthouse_scores.png" alt="Lighthouse Scores" width="380" height="125">

## 🛠️ Technical Stack

- **Requirements**: [Node.JS](https://nodejs.org/en/download/) v22.x, I use [FNM](https://github.com/Schniz/fnm) to install
- **Frontend**: [Next](https://nextjs.org/docs/app/getting-started), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Build**: [PNPM](https://pnpm.io/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Commitizen](https://commitizen.github.io/cz-cli/), [Lint Staged](https://github.com/okonet/lint-staged), [Husky](https://github.com/typicode/husky)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI**: [Shadcn/UI](https://ui.shadcn.com/)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)
- **Internationalization(i18n)**: [Next-intl](https://next-intl.dev/)
- **Authentication**: [Auth.js](https://authjs.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/), [Docker compose](https://docs.docker.com/compose/), [Mongoose](https://github.com/Automattic/mongoose)
- **Drag and Drop**: [dnd-kit](https://dndkit.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions), [Vercel](https://vercel.com/home), [Codecov](https://codecov.io/), [SonarQube](https://sonarcloud.io/)

## 📦 Core Framework Versions and Upgrade Decision

- At the beginning, I sticked to previous Next 14.x and React 18.x for better ecosystem and packages support. If stability is top priority in your project, I suggest you postpone upgrade to the latest versions.
- At the late stage, upgraded to Next 15.x and React 19.x for better performance and stability by using new improvements such as [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack)

## 🚀 Getting Started

- Press **Use this template** to create a new repository.
- Clone the repository to your local machine.

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
# - username: Database user with appropriate permissions
# - password: User's password (URL encoded if contains special characters)
# - host: Database host (localhost for development)
# - port: MongoDB port (default: 27017)
# - database: Database name (next-project-manager)
# - options: Additional connection parameters (authSource=admin required)
DATABASE_URL="mongodb://[username]:[password]@[host]:[port]/[database]?authSource=admin"
```

Production and CI:

Create environment variables in Vercel or GitHub project settings.

### Useful Commands

```bash
# Generate Secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env

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

# ESLint fix
pnpm lint

# Format code
pnpm format

# Build
pnpm build
```

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

## 📖 Detailed Technical Documentation

### 📊 Testing Strategy

- Cross-browser testing (by Playwright) ensures functionality across desktop and mobile.

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
└── types/ # Type definitions
```

## Known Issues & Limitations

### German Translations

This is a demo project, and I know little of German, so errors of translations might not be fixed in the near future.

### UI library

- **Radix UI Ref Warning**:

  - Issue: Function components cannot be given refs warning in Dialog components
  - Impact: Development warning only, no production impact
  - Solution: Keep using `asChild` as per Radix UI docs, warning can be safely ignored
  - Reason: Internal implementation detail of Radix UI

- **Radix UI ARIA Warning**:
  - Issue: Blocked aria-hidden on a <body> element warning in Dialog components
  - Impact: Development warning only, no production impact
  - Solution: Can be safely ignored as most modern browsers handle this correctly
  - Reason: Internal implementation of Radix UI's Dialog component

### Server

- **Slow response from server**:
  - Server Region: Hong Kong
  - Issue: Sometimes Server response is slow, especially for users are not in Asia
  - Status: The resource of free tier is limited and no plan of CDN, it won't be fix in the near future

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
