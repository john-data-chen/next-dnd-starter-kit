# Production-Ready Next.js Project Management Tool Template | Drag & Drop Support <br>

[![codecov](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit/graph/badge.svg?token=VM0ZK1S8U5)](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_next-dnd-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_next-dnd-starter-kit)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Why Choose This Template:

The **Enterprise-grade Next.js template** with 85%+ test coverage, featuring drag & drop functionality, WAI-ARIA accessibility. It is designed for saving time while adhering to best practices and including:

- 🚀 Production-Ready: Enterprise-level architecture with full TypeScript support
- 💪 Professional Setup: CI/CD, Testing, Code Quality tools pre-configured and pass the SonarQube Quality Check
- 🎯 Developer-Friendly: Clear documentation and best practices built-in
- 🎨 Modern UX: Drag-and-drop, animations, dark mode, responsive design for mobile, tablet, and desktop
- 💾 Persistent data: via MongoDB

---

⭐ **Love this template?**
If you like it, don't forget to [give it a star](https://github.com/john-data-chen/next-dnd-starter-kit) today!
Every star motivates me to deliver more high-quality templates. 🚀

---

**Key Accomplishments**:

- **Test Coverage in Codecov**: 85%+
- **Reliability, Security, Reliability and Maintainability Rating in SonarQube**: A
- **Cross-browser Testing**: for both desktop and mobile devices.
- **CI/CD automation**: in GitHub actions and Vercel.

## 🛠️ Technical Stack

- **Requirements**: [Node.JS](https://nodejs.org/en/download/) v22.x, I use [FNM](https://github.com/Schniz/fnm) to install
- **Frontend**: [Next](https://nextjs.org/docs/14/getting-started), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Build**: [PNPM](https://pnpm.io/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Commitizen](https://commitizen.github.io/cz-cli/), [Lint Staged](https://github.com/okonet/lint-staged), [husky](https://github.com/typicode/husky)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI**: [Shadcn/UI](https://ui.shadcn.com/)
- **Testing**: [Jest](https://jestjs.io/), [Playwright](https://playwright.dev/)
- **Authentication**: [Auth.js](https://authjs.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/), [Docker compose](https://docs.docker.com/compose/), [Mongoose](https://github.com/Automattic/mongoose)
- **Drag and Drop**: [dnd-kit](https://dndkit.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions), [Vercel](https://vercel.com/home), [Codecov](https://codecov.io/), [SonarQube](https://sonarcloud.io/)

## 🚀 Getting Started

- Press **Use this template** to create a new repository.
- Generate Secret in `.env` file.

### Commands

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

# Run unit and integration tests by Jest
pnpm test

# Run E2E tests by Playwright
pnpm playwright

# ESLint
pnpm lint

# Format code
pnpm format
```

## 🔐 Permission System

### Core Concepts

- Board can have multiple projects, it is the biggest container
- Project can have multiple tasks, it is the smallest container
- Each board has one owner and multiple members (member management feature coming soon)
- Tasks can be assigned to any member
- All modifications of a task are tracked with last modified user

### User Roles & Permissions

**Board Owner**

- Create and delete board
- Edit all projects and tasks
- Delete projects (cascading delete tasks)

**Board Member**

- View all projects and tasks in the board
- Any member can create projects and tasks
- Edit their own projects and tasks
- Delete their own projects and tasks

### Task Operations
- Task creator and assignee can edit task
- Only owner of board, owner of project and creator of task can delete tasks
- Task status: To Do → In Progress → Done

## 🔜 Roadmap

- [x] Full-stack support by Next.js
- [x] Enhanced accessibility with Shadcn UI
- [x] Drag and drop supports
- [x] Add code quality check with Codecov and SonarQube
- [x] Add responsive support for multiple screen sizes
- [x] Add edit task dialog
- [x] Make Database Schema and initialization script
- [x] User authentication for secure project/task management
- [x] Add creator and assignee in task dialog
- [x] Persistent data into Database
- [x] Fix the issues of dragging tasks to another order in the same project
- [x] Fix the issues of dragging tasks to another project
- [x] Add project owner in project column
- [x] Add user permission check when dragging a task into a project
- [x] Add a better fetching and reloading strategy of state and database
- [x] Fix the UI issue of dragging a task into a project
- [x] Add a toast after dragging a task into a project
- [x] Add members into project column
- [x] Temp fix ES lint 9 config type issue
- [x] Add status of task such as to do, in progress, done
- [x] Add UI variation of task status
- [x] Add task filtering by status
- [x] Add basic task statistics (total, to-do, in progress, done)
- [x] Add task search by title/description
- [x] Refactor auth and auto redirect functions
- [x] Add board switching feature in sidebar
- [x] Add board switching feature in overview page
- [x] Add board creation feature
- [x] Add board deletion feature
- [x] Add board editing feature
- [x] Add board searching and filtering feature
- [x] Add project Description column and modify feature
- [x] Add auth check in API routes
- [x] Improve and fix issues of the UI in small screen
- [x] Modify data schema and add user permission check
- [x] Add Unit tests by Jest
- [x] Add E2E tests by Playwright
- [x] Add CI/CD pipeline
- [ ] Upgrade Shadcn UI to latest version: in progress
- [ ] Add toaster in sign in page
- [ ] Fix Board overview can't scroll in mobile screen
- [ ] Fix the form of the task dialog will be covered by keyboard in mobile screen
- [ ] Add more unit tests to make coverage over 85%
- [ ] Add board member management feature

and more...

## 📖 Detailed Technical Documentation

### Database

- In production , I use [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
- In local development, I use [Docker Compose](https://docs.docker.com/compose/) in folder **database**, you need to have [Docker](https://www.docker.com/) or [OrbStack](https://orbstack.dev/) installed.
- Execute `docker-compose up -d` to start MongoDB in Docker.
- Execute `docker-compose down` to stop MongoDB in Docker.
- Execute `npm run init-db` to initialize MongoDB.

### 📊 Testing Strategy

- Achieved 85%+ test coverage with unit, integration, and E2E tests.
- Cross-browser testing ensures functionality across desktop and mobile.

### Project Structure

```text
__tests__/ # Test cases
public/ # Static files such as images and i18n localization
database/ # MongoDB docker-compose and initialization
src/
├── app/ # Next.js App routes
│   ├── page.tsx # Root page
│   ├── layout.tsx # Layout component
│   ├── not-found.tsx # 404 page
│   ├── (auth)/ # Authentication routes
│   └── (workspace)/ # Workspace routes
│       └── boards/ # Kanban Overview routes
│           ├── [boardId]/ # Board routes
├── components/ # Reusable React components
├── constants/ # Application-wide constants
├── hooks/ # Custom React hooks
├── lib/
│   ├── db/ # Database functions
│   ├── auth # Authentication functions
│   └── state # State management functions
├── models/ # Database models
├── styles/ # Global styles
└── types/ # Type definitions
```

## Known Issues & Limitations

### React/Next.js

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

### ESLint

- **ESLint 9.x Type Issues**:
  - Issue: Type incompatibility with @types/eslint
  - Solution: Use type assertions or @ts-ignore for specific cases
  - Status: Waiting for type definitions to catch up with ESLint 9.x

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
