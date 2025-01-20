# Production-Ready Next.js TypeScript Template | Drag & Drop Support <br>

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## ✨ Why Choose This Template:

The **Enterprise-grade Next.js TypeScript template** featuring drag & drop functionality, WAI-ARIA accessibility. It is designed for saving time while adhering to best practices and including:

- 🚀 Production-Ready: Enterprise-level architecture with full TypeScript support
- 💪 Professional Setup: CI/CD, Testing, and Code Quality tools pre-configured
- 🎯 Developer-Friendly: Clear documentation and best practices built-in
- 🎨 Modern UX: Drag-and-drop, animations, and dark mode included
- 💾 Persistent data: via local storage

---

⭐ **Love this template?**
If you like it, don't forget to [give it a star](https://github.com/john-data-chen/next-board) today!
Every star motivates me to deliver more high-quality templates. 🚀

---

**Key Accomplishments**:

- **Cross-browser Testing**: for both desktop and mobile devices.
- **CI/CD automation**: in GitHub actions.

## 🛠️ Technical Stack

- **Requirements**: [Node.JS](https://nodejs.org/en/download/) v22.13.0 or higher
- **Frontend**: [Next.js](https://nextjs.org/docs/14/getting-started), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Zustand](https://zustand-demo.pmnd.rs/)
- **Build**: [PNPM](https://pnpm.io/), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Commitizen](https://commitizen.github.io/cz-cli/), [Lint Staged](https://github.com/okonet/lint-staged), [husky](https://github.com/typicode/husky)
- **Styling**: [Taliwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Testing**: [Jest](https://jestjs.io/), [Playwright](https://playwright.dev/)
- **Drag and Drop**: [dnd-kit](https://dndkit.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)

## 🚀 Getting Started

- Press **Use this template** to create a new repository.

### PNPM commands

```bash
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

- [x] Full-stack support using Next.js
- [x] Enhanced accessibility with Shadcn UI
- [x] Drag and drop supports
- [ ] Persistent data into Database
- [ ] User authentication for secure project/task management

and more...

## 📖 Detailed Technical Documentation

### 📊 Testing Strategy

- Cross-browser testing ensures functionality across desktop and mobile.

### Project Structure

```
__tests__/ # Test cases
src/
├── assets/ # Static files such as images
├── components/ # Reusable React components
├── constants/ # Application-wide constants
├── hooks/ # Custom React hooks
├── styles/ # Light and dark theme configurations
├── types/ # TypeScript type definitions
└── utils/ # Utility functions
```

### 📃 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
