# AI Guidelines

## AI Assistant Behavioral Framework

- **MANDATORY**: Check for `karpathy-guidelines` skill for ANY coding task.
- **Check MCP/skills before execution**:
  - Verify available and enabled tools
  - Suggest and confirm with the user which MCP/skill to use
  - Recommend missing ones if useful
- **Convention First**: Always analyze existing patterns, libraries, and code style before making changes
- **Verify, Then Act**: Never assume dependencies or commands exist - always verify through package.json or config files
- **Test-Driven Changes**: Look for existing tests, run them to understand behavior, write tests before implementing features
- **Incremental Verification**: Run lint, type-check, test, and build commands after every significant change

> [!TIP]
> If need to check package info, use `context7-mcp` if installed and enabled.
> When starting work on a Next.js project, call the `init` tool from next-devtools-mcp FIRST to set up proper context and establish documentation requirements. Ask user for confirmation before calling the tool.

## Skill Dispatch Guide

When a task matches conditions below, load the corresponding skill **before writing code**.

### Universal Optimization Skills (CHECK FIRST, in `ai_docs/skills/ai-optimization/`)

| Condition (when the task involves...)                                                                                               | Skill to Use          |
| :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **ANY coding task** (writing, refactoring, fixing bugs). **ALWAYS** load this skill first to ensure high-quality, surgical changes. | `karpathy-guidelines` |

### Web Skills (`ai_docs/skills/web/`)

| Condition (when the task involves...)                                              | Skill to Use                  |
| :--------------------------------------------------------------------------------- | :---------------------------- |
| Next.js file conventions, RSC, data fetching, metadata, route handlers, async APIs | `next-best-practices`         |
| `use cache` directive, PPR, cacheLife, cacheTag, updateTag, static/dynamic mix     | `next-cache-components`       |
| Component API design, compound components, boolean prop cleanup, render props      | `vercel-composition-patterns` |
| React/Next.js performance: re-renders, bundle size, waterfalls, memoization        | `vercel-react-best-practices` |
| UI review, accessibility audit, UX compliance, design guidelines                   | `web-design-guidelines`       |

## Project Overview

### Repository Structure

| Type       | Path                 | Description                           |
| ---------- | -------------------- | ------------------------------------- |
| Tests      | `__tests__`          | Unit and E2E tests                    |
| Database   | `database`           | docker-compose                        |
| i18n       | `messages`           | i18n translations                     |
| Router     | `src/app/`           | Next.js App Router                    |
| Components | `src/components/`    | React components                      |
| Components | `src/components/ui/` | Shadcn UI components                  |
| Constants  | `src/constants/`     | Constants                             |
| Hooks      | `src/hooks/`         | Custom hooks                          |
| Library    | `src/lib/db`         | Database functions                    |
| State      | `src/lib/stores/`    | Zustand stores (auth, board, project) |
| Styles     | `src/styles/`        | Global css                            |

Shadcn UI components are in `src/components/ui`. Modify `src/styles/globals.css` and `src/components` first; only modify Shadcn UI components as a last resort.

## Essential Commands

Dev server is already running (`pnpm dev`). Do not start it again.

```bash
pnpm install          # Install all dependencies
pnpm build            # Build for production
```

### Verification Workflow

```bash
git add /path/to/your/file.ts    # Stage file for linting
pnpm lint-staged                 # Run linter and prettier
```

After every task: verify with `pnpm lint-staged` → fix errors → unstage files → suggest a Conventional Commit message. Never commit for the user.

## Tech Stack

Check `package.json` for exact versions. Key stack: Next.js (App Router), React, TypeScript (strict), TailwindCSS, Vitest, PNPM.

## Naming Conventions

- **Components**: PascalCase (`DatePicker.tsx`)
- **Utilities**: camelCase (`dateUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase interfaces (`UserData`, `ApiResponse`)
- **Commits**: [Conventional Commits](https://conventionalcommits.org/) — `feat(scope): description` / `fix(scope): description`
