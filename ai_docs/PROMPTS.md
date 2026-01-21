# AI Guidelines

## AI Assistant Behavioral Framework

- **Convention First**: Always analyze existing patterns, libraries, and code style before making changes
- **Verify, Then Act**: Never assume dependencies or commands exist - always verify through package.json or config files
- **Test-Driven Changes**: Look for existing tests, run them to understand behavior, write tests before implementing features
- **Incremental Verification**: Run lint, type-check, test, and build commands after every significant change

## Project Overview

**Project Type**: Turborepo-based monorepo

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

## Essential Commands Quick Reference

### Daily Development Workflow

I have executed `pnpm dev` to start dev server, so you don't do it again.

```bash
# Project setup
pnpm install                                  # Install all dependencies
pnpm upgrade                                  # Upgrade all dependencies
pnpm build                                    # Build for production
```

### Debugging & Verification Commands

Only do it after you are sure all files are modified, and ready for user to commit

```bash
# When debugging issues
git add /path/to/your/file.ts             # Stage file for linting
pnpm lint-staged                          # Run linter and prettier
```

## 🏗️ Technology Stack & Dependencies

### Core Technologies

check package.json to get versions of packages before you start

- **Node Version**: Node.js latest version, use "node -v" to check the version
- **Framework**: Next.js latest version with App Router, React latest version
- **Language**: TypeScript latest version (strict mode)
- **Styling**: TailwindCSS latest version
- **Package Manager**: PNPM latest version (not npm/yarn)
- **Monorepo**: Turborepo latest version
- **Unit test**: Vitest latest version

> **React Patterns**: See `ai_docs/skills/vercel-react-best-practices` for state management, performance optimization, and rendering patterns (45+ rules)

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

**AI Analysis Approach**:

```
1. "I'll analyze the component for performance bottlenecks"
2. Read component source and identify expensive operations
3. Check for unnecessary re-renders using React DevTools patterns
4. Look for missing useMemo/useCallback opportunities
5. Verify if component should be controlled vs uncontrolled
6. Implement optimizations with before/after benchmarks
7. Add or update tests to prevent regression
8. git add /path/to/your/file.ts
9. Verify with pnpm lint-staged && pnpm build
10. Fix all errors or warnings of linter
11. Git un-stage all files
12. Give me the suggested commit message matched Conventional Commits
13. Never commit it for me
```

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
- [ ] Follow controlled component patterns for UI
- [ ] Use Zustand stores for cross-component state, but if it's a simple state, use useState / Context API
- [ ] Implement proper loading/error states
- [ ] Run verification commands before completion
