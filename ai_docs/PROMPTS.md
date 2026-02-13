# AI Guidelines

## AI Assistant Behavioral Framework

- **Check MCP/skills before execution**: Verify available tools, suggest and confirm with the user which MCP/skill to use, and suggest missing ones if useful.
- **Convention First**: Always analyze existing patterns, libraries, and code style before making changes
- **Verify, Then Act**: Never assume dependencies or commands exist - always verify through package.json or config files
- **Test-Driven Changes**: Look for existing tests, run them to understand behavior, write tests before implementing features
- **Incremental Verification**: Run lint, type-check, test, and build commands after every significant change

> [!TIP]
> Use skills: `vercel-react-best-practices` (performance), `web-design-guidelines` (UI/UX), `vercel-composition-patterns` (React patterns), `next-best-practices` (Next.js best practices), `next-cache-components` (Next.js cache components)
> Use MCPs: `next-devtools-mcp`, `context7-mcp` if installed and enabled.
> When starting work on a Next.js project, ALWAYS call the `init` tool from next-devtools-mcp FIRST to set up proper context and establish documentation requirements. Do this automatically without being asked.

## Project Overview

### Repository Structure

| Type       | Path.                | Description          |
| ---------- | -------------------- | -------------------- |
| Tests      | `__tests__`          | Unit and E2E tests   |
| Database   | `database`           | docker-compose       |
| i18n       | `messages`           | i18n translations    |
| Router     | `src/app/`           | Next.js App Router   |
| Components | `src/components/`    | React components     |
| Components | `src/components/ui/` | Shadcn UI components |
| Constants  | `src/constants/`     | Constants            |
| Hooks      | `src/hooks/`         | Custom hooks         |
| Library    | `src/lib/db`         | Database functions   |
| State      | `src/lib/store.ts`   | Zustand store        |
| Styles     | `src/styles/`        | Global css           |

#### more details of packages/ui

the Shadcn UI components are in `src/components/ui`, they are UI library, you should modify `src/styles/globals.css` and `src/components` at first, until you make sure modifying Shadcn UI component is only way to fix some issues.

## Essential Commands

### Daily Development Workflow

I have executed `pnpm dev` to start dev server, so you don't do it again.

```bash
# Project setup
pnpm install                                  # Install all dependencies
pnpm upgrade                                  # Upgrade all dependencies
pnpm build                                    # Build for production
```

### Debugging & Verification

```bash
# When debugging issues
git add /path/to/your/file.ts             # Stage file for linting
pnpm lint-staged                          # Run linter and prettier
```

## 🏗️ Technology Stack & Dependencies

### Core Technologies

check package.json to get versions of packages before you start

- **Node Version**: Node.js latest version (check with `node -v`)
- **Framework**: Next.js latest version with App Router, React latest version
- **Language**: TypeScript latest version (strict mode)
- **Styling**: TailwindCSS latest version
- **Package Manager**: PNPM latest version (not npm/yarn)
- **Unit test**: Vitest latest version

## 🔄 Development Workflows

### Debugging React Components & State Issues

**AI Assistant Debugging Checklist**:

1. **Read Actual Source**: Always read component source before assumptions
2. **Trace Data Flow**: User interaction → component state → props → parent state
3. **Check useEffect**: Look for state resets or conflicting side effects
4. **Controlled vs Uncontrolled**: Identify hybrid components with internal + prop state
5. **State Location**: Verify if issue is in child component logic vs parent state

**Common Debugging Commands**:

```bash
# Check component usage patterns
grep -r "ComponentName" ./src/components/ComponentName.tsx
git add /path/to/your/file.ts
pnpm lint-staged
pnpm dev
```

## 📁 File Structure & Naming Conventions

### Naming Rules

- **Components**: PascalCase (`DatePicker.tsx`)
- **Utilities**: camelCase (`dateUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase interfaces (`UserData`, `ApiResponse`)

### Export Patterns

```typescript
// packages/ui/package.json
{
  "exports": {
    "./ComponentName": "./src/ComponentName/index.ts"
  }
}

// Usage in apps
import { ComponentName } from "@repo/ui/ComponentName";
```

### Commit message suggestion

- **Specification**: [Conventional Commits](https://conventionalcommits.org/)
- **Format**: `feat(scope): description` / `fix(scope): description`

## 🔧 AI Assistant Example Scenarios

### Scenario 1: "Add a DatePicker component"

**AI Response Pattern**:

```
1. "I'll add a DatePicker component following the UI component workflow"
2. Check existing date-related components in packages/ui/src/
3. Create src/components/DatePicker/DatePicker.tsx
4. Write corresponding test in __tests__/units/DatePicker/DatePicker.test.tsx
5. git add /path/to/your/file
6. Verify with pnpm lint-staged && pnpm build
7. Fix all errors or warnings of linter
8. Git un-stage all files
9. Give me the suggested commit message matched Conventional Commits
10. Never commit it for me
```

### Scenario 2: "The form validation isn't working"

**AI Debugging Process**:

```
1. "Let me investigate the form validation issue systematically"
2. Read the form component source code
3. Check React Hook Form + Zod schema setup
4. Look for existing tests related to validation
5. Run tests to reproduce the issue
6. Trace data flow: user input → validation → error display
7. Identify root cause (schema, component, or state issue)
8. Propose targeted fix with test verification
9. git add /path/to/your/file.ts
10. Verify with pnpm lint-staged && pnpm build
11. Fix all errors or warnings of linter
12. Git un-stage  all files
13. Give me the suggested commit message matched Conventional Commits
14. Never commit it for me
```

### Scenario 3: "Optimize component performance"

**AI Analysis Approach**: Reference `vercel-react-best-practices`, `next-best-practices` skill for optimization rules, then follow standard verification workflow (lint-staged → build → suggest commit message).

## 🎯 AI Success Metrics

**Quality Indicators**:

- ✅ All commands run without errors
- ✅ TypeScript strict mode compliance
- ✅ Follows existing code patterns
- ✅ Proper component export structure
- ✅ Conventional commit messages
- ✅ No lint warnings or build errors

**Best Practices Checklist**:

- [ ] Read existing code before implementing changes
- [ ] Verify dependencies in package.json before using
- [ ] Run verification commands before completion
- [ ] Reference skills for patterns: `vercel-react-best-practices`, `vercel-composition-patterns`, `next-best-practices`
