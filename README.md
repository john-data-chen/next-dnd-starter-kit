# Production-Ready Next.js Template | Drag & Drop Support <br>

[![codecov](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit/graph/badge.svg?token=VM0ZK1S8U5)](https://codecov.io/gh/john-data-chen/next-dnd-starter-kit)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=john-data-chen_next-dnd-starter-kit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=john-data-chen_next-dnd-starter-kit)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![CI](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml/badge.svg?branch=main)](https://github.com/john-data-chen/next-board/actions/workflows/CI.yml)

## ✨ Why Choose This Template:

The **Enterprise-grade Next.js template** with 85%+ test coverage, featuring drag & drop functionality, WAI-ARIA accessibility. It is designed for saving time while adhering to best practices and including:

- 🚀 Production-Ready: Enterprise-level architecture with full TypeScript support
- 💪 Professional Setup: CI/CD, Testing, Code Quality tools pre-configured and pass the SonarQube Quality Check
- 🎯 Developer-Friendly: Clear documentation and best practices built-in
- 🎨 Modern UX: Drag-and-drop, animations, dark mode, responsive design for mobile, tablet, and desktop
- 💾 Persistent data: via local storage

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
cd mongodb
docker-compose up -d

# stop mongodb in docker
docker-compose down

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run unit and integration tests by Jest
pnpm run test

# Run E2E tests by Playwright
pnpm run playwright
```

## 🔜 Roadmap

- [x] Full-stack support by Next.js
- [x] Enhanced accessibility with Shadcn UI
- [x] Drag and drop supports
- [x] CI / CD pipelines
- [x] Add code quality check with Codecov and SonarQube
- [x] Add responsive support for multiple screen sizes
- [x] Add edit task dialog
- [x] Make Database Schema and initialization script
- [ ] Persistent data into Database
- [ ] Add assigner and owner in task dialog
- [ ] User authentication for secure project/task management

and more...

## 📖 Detailed Technical Documentation

### Database

- In production , I use [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database)
- In local development, I use [Docker Compose](https://docs.docker.com/compose/) in folder **database**, you need to have [Docker](https://www.docker.com/) or [OrbStack](https://orbstack.dev/) installed.
- Execute `docker-compose up -d` to start MongoDB in Docker.
- Execute `docker-compose down` to stop MongoDB in Docker.
- Execute `node src/database/init.js` to initialize MongoDB.

### 📊 Testing Strategy

- Achieved 85%+ test coverage with unit, integration, and E2E tests.
- Cross-browser testing ensures functionality across desktop and mobile.

### Project Structure

```
__tests__/ # Test cases
public/ # Static files such as images and i18n localization
database/ # MongoDB docker-compose and initialization
src/
├── app/ # Next.js App routes
│   ├── page.tsx # Root page
│   ├── layout.tsx # Layout component
│   ├── not-found.tsx # 404 page
│   ├── (auth)/login/ # Authentication routes
│   └──(workspace)/ # Workspace routes (protected routes)
│       └── kanban/ # Kanban routes
├── components/ # Reusable React components
├── constants/ # Application-wide constants
├── hooks/ # Custom React hooks
├── styles/ # Global styles
├── types/ # TypeScript type definitions
└── utils/ # Utility functions such as Authentication and State management
```

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
