# Agent Operating Guide

All automation, assistants, and developers must follow
`.github/copilot-instructions.md` for workflow, safety, and environment rules.

## How to Use

- Read `.github/copilot-instructions.md` before making changes
- Apply every rule in that file as-is; do not redefine or override them here
- If updates are needed, edit `.github/copilot-instructions.md` and keep this
  file pointing to it

## Quick Reference

- **Development branch**: `develop` (default working branch)
- **Production branch**: `main` (releases only, PR-only, direct commits FORBIDDEN)
- **Lint before commit**: `npm run lint:all`
- **Format code**: `npm run format`
- **Type check**: `npm run type-check`
- **Build**: `npm run build`
- **Run dev**: `npm run dev`

⚠️ **CRITICAL RULE**: NEVER commit directly to `main` branch!

## Development Workflow

**Branch Strategy:**

⚠️ **NEVER commit directly to `main`** - All changes MUST use `develop` or `feature/*` branches

- Work on `develop` branch for all changes
- Create feature branches from `develop` for larger features
- PR to `main` when ready to deploy (from `develop` or `feature/*`)
- `main` is for releases only (PR required, direct commits FORBIDDEN)

**Development Steps:**

1. Switch to develop: `git checkout develop && git pull`
2. Make changes to components in `src/`
3. Run `npm run lint:all` to check all code
4. Run `npm run type-check` to verify types
5. Test locally: `npm run dev`
6. Commit (pre-commit hooks will run)
7. Push to `develop` or `feature/*` branch
8. Create PR to `main` when ready for production

## Project Structure

```text
otel-ui/
├── src/
│   ├── components/   # React components
│   ├── services/     # API client, auth
│   ├── types/        # TypeScript type exports
│   ├── App.tsx       # Main app component
│   └── main.tsx      # Entry point
├── public/           # Static assets
└── dist/             # Build output (nginx)
```
