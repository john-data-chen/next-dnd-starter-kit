# AGENTS.md

## Before Every Task

1. Load `karpathy-guidelines` skill — mandatory.
2. Load `caveman` skill (global, YAGNI mode) — mandatory.
3. Match task to Skill Dispatch Guide below. Load matching skills before coding.
4. Use MCP servers when they save time (see MCP section).
5. Read before writing — verify patterns, deps, and style via `package.json` / config files.

## Skill Dispatch Guide

### Universal

| Condition | Skill |
| :-- | :-- |
| Any coding task | `karpathy-guidelines` |
| Any task | `caveman` (makes agent talk like caveman — cuts ~75% of output tokens) |

### Workflow

| Condition | Skill |
| :-- | :-- |
| Multi-session task, handoff, progress tracking | `session-handoff` |
| Writing docs, proposals, specs, decision docs | `doc-coauthoring` |

### Web

| Condition | Skill |
| :-- | :-- |
| Next.js file conventions, RSC, data fetching, metadata, route handlers, async APIs | `next-best-practices` |
| `use cache`, PPR, cacheLife, cacheTag, updateTag | `next-cache-components` |
| Component API design, compound components, boolean prop cleanup | `vercel-composition-patterns` |
| React/Next.js performance: re-renders, bundle size, waterfalls | `vercel-react-best-practices` |
| UI review, accessibility audit, UX compliance | `web-design-guidelines` |

## MCP Servers

| Server | Use When |
| :-- | :-- |
| `context7` | Need current library/package docs |
| `next-devtools` | Dev server diagnostics, route inspection. Call `init` tool FIRST when starting Next.js work (confirm with user). |
| `chrome-devtools` | Browser debugging, DOM inspection, performance analysis, network requests |

## Project Context

### Tech Stack

Check `package.json` for versions. Key: **Next.js (App Router), React, TypeScript (strict), TailwindCSS, Vitest, PNPM**.

### Repository Structure

| Path | What |
| :-- | :-- |
| `__tests__` | Unit + E2E tests |
| `database` | MongoDB docker-compose |
| `messages` | i18n (de.json, en.json) |
| `src/app/` | App Router + API routes |
| `src/components/` | React components |
| `src/components/ui/` | Shadcn UI (modify as last resort) |
| `src/components/kanban/` | Board, project, task components |
| `src/components/auth/` | Auth components |
| `src/components/layout/` | Sidebar, header, nav |
| `src/constants/` | App constants |
| `src/hooks/` | Custom hooks |
| `src/lib/db` | DB functions |
| `src/lib/auth` | Auth (client/server) |
| `src/lib/stores/` | Zustand stores |
| `src/models/` | Mongoose models |
| `src/types/` | TypeScript types |
| `src/styles/` | Global CSS |
| `src/i18n/` | next-intl config |

Modify `src/styles/globals.css` and `src/components` first; Shadcn UI components last resort.

### Naming

- Components: PascalCase (`DatePicker.tsx`)
- Utilities: camelCase (`dateUtils.ts`)
- Constants: UPPER_SNAKE_CASE
- Types: PascalCase interfaces
- Commits: [Conventional Commits](https://conventionalcommits.org/) — `feat(scope): msg`

## Commands

Dev server already running (`pnpm dev`). Don't restart.

### After Every Task

```bash
git add /path/to/file       # Stage for linting
pnpm lint-staged             # Lint + format
pnpm build                   # Build check
```

Fix all errors → unstage → suggest Conventional Commit message. **Never commit for user.**

