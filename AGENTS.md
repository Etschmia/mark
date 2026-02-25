# AGENTS.md

This file is superseded by [CLAUDE.md](./CLAUDE.md), which contains all relevant project documentation for AI agents.

For detailed implementation information, refer to the source code directly.

## Cursor Cloud specific instructions

### Services

- **Vite Dev Server** (`npm run dev`): The only service to run. Pure client-side SPA on port 5173. No backend, database, or Docker required.

### Running & Testing

- Commands are documented in `CLAUDE.md`. Key ones: `npm run dev`, `npm run build:dev`, `npm run build`.
- There is **no ESLint** configured; no `npm run lint` script exists. Use `npx tsc --noEmit` for type checking.
- Pre-existing TypeScript errors exist in `components/__tests__/` and `utils/__tests__/` (missing jest/testing-library types) and in `components/Toolbar.tsx` (missing `GitHubButton` module). These do not affect dev server or production build.
- The Vite build (`npm run build:dev`) is the reliable correctness check—it succeeds despite the `tsc` errors because Vite uses esbuild for transpilation.
- Test files exist (`components/__tests__/Tab.test.tsx`, `utils/__tests__/tabManager.test.ts`) but there is no test runner configured in `package.json`. They cannot be run without adding a test framework (e.g. vitest or jest).
- Tauri desktop build (`npm run tauri:dev`) requires a Rust toolchain and is **not needed** for web development.
