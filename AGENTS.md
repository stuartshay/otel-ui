# Agent Operating Guide

All automation, assistants, and developers must follow
`.github/copilot-instructions.md` for workflow, safety, and environment rules.

## How to Use

- Read `.github/copilot-instructions.md` before making changes
- Apply every rule in that file as-is; do not redefine or override them here
- If updates are needed, edit `.github/copilot-instructions.md` and keep this
  file pointing to it

## Quick Reference

- **Lint before commit**: `npm run lint`
- **Type check**: `npx tsc --noEmit`
- **Build**: `npm run build`
- **Run dev**: `npm run dev`

## Development Workflow

1. Make changes to components in `src/`
2. Run `npm run lint` to check code style
3. Run `npx tsc --noEmit` to verify types
4. Test locally: `npm run dev`
5. Commit and push

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
