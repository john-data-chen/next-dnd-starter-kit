# AI Guidelines

## Before Every Task

1. **Load `karpathy-guidelines` skill** — mandatory for any coding task.
2. **Identify applicable skills** from the Skill Dispatch Guide below. Load them before writing code.
3. **Check available MCP servers** — use them when they save time (e.g., `context7-mcp` for package docs, `nextjs-mcp` for dev server diagnostics).
4. **Read before writing** — analyze existing patterns, libraries, and code style. Never assume a dependency or command exists without verifying via `package.json` or config files.

> [!TIP]
> If need to check package info, use `context7-mcp` if installed and enabled.
> When starting work on a Next.js project, call the `init` tool from next-devtools-mcp FIRST to set up proper context and establish documentation requirements. Ask user for confirmation before calling the tool.

## Skill Dispatch Guide

When a task matches conditions below, load the corresponding skill **before writing code**.

### Universal (always check first)

| Condition | Skill |
| :-------- | :---- |
| **Any coding task** — writing, refactoring, fixing bugs | `karpathy-guidelines` |

### Web

| Condition | Skill |
| :-------- | :---- |
| Next.js file conventions, RSC, data fetching, metadata, route handlers, async APIs | `next-best-practices` |
| `use cache` directive, PPR, cacheLife, cacheTag, updateTag, static/dynamic mix | `next-cache-components` |
| Component API design, compound components, boolean prop cleanup, render props | `vercel-composition-patterns` |
| React/Next.js performance: re-renders, bundle size, waterfalls, memoization | `vercel-react-best-practices` |
| UI review, accessibility audit, UX compliance, design guidelines | `web-design-guidelines` |

Skills are in `ai_docs/skills/`. Copy the ones you need to your AI tool's skill directory (e.g., `.claude/skills/` for Claude Code).

## Project Context

### Tech Stack

Check `package.json` for exact versions. Key stack: **Next.js (App Router), React, TypeScript (strict), TailwindCSS, Vitest, PNPM**.

### Repository Structure

| Type | Path | Description |
| ---- | ---- | ----------- |
| Tests | `__tests__` | Unit and E2E tests |
| Database | `database` | docker-compose |
| i18n | `messages` | i18n translations |
| Router | `src/app/` | Next.js App Router |
| Components | `src/components/` | React components |
| Components | `src/components/ui/` | Shadcn UI components |
| Constants | `src/constants/` | Constants |
| Hooks | `src/hooks/` | Custom hooks |
| Library | `src/lib/db` | Database functions |
| State | `src/lib/stores/` | Zustand stores (auth, board, project) |
| Styles | `src/styles/` | Global css |

Shadcn UI components are in `src/components/ui`. Modify `src/styles/globals.css` and `src/components` first; only modify Shadcn UI components as a last resort.

### Naming Conventions

- **Components**: PascalCase (`DatePicker.tsx`)
- **Utilities**: camelCase (`dateUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase interfaces (`UserData`, `ApiResponse`)
- **Commits**: [Conventional Commits](https://conventionalcommits.org/) — `feat(scope): description` / `fix(scope): description`

## Commands

Dev server is already running (`pnpm dev`). Do not start it again.

```bash
pnpm install          # Install all dependencies
pnpm build            # Build for production
```

### After Every Task

```bash
git add /path/to/your/file.ts    # Stage file for linting
pnpm lint-staged                 # Run linter and formatter
```

Fix all errors → unstage files → suggest a Conventional Commit message. **Never commit for the user.**
