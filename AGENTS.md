# AI Agent Guide: Experiments-Electron

Context for AI agents working in this repo.

## Project overview

Electron + web reference template, npm workspaces, no real feature yet on purpose — this proves the dev/build/test/deploy pipeline first. Desktop and web are two build targets of **one app**, not two separate apps.

- [apps/desktop](apps/desktop) — Electron shell (main, preload, electron-vite config, packaging).
- [apps/web](apps/web) — browser shell (plain Vite, nginx Dockerfile).
- [packages/shared](packages/shared) — the actual app: screens, theme, state. Both shells import from here and are otherwise thin wrappers.

Full structure/pitch: [README.md](README.md). Full pipeline (setup, adding a feature, testing, deploying): [CONTRIBUTING.md](CONTRIBUTING.md) — read it before making a change that touches more than one file.

## Architecture status

Not decided yet, tracked in [README.md](README.md)'s TODO — don't assume a pattern (Redux/MVI/Elm/etc.) is settled, `zustand` in `packages/shared/src/store.ts` is a placeholder. If a task requires picking one, ask, don't just pick silently.

## Gotchas hit building this template (don't relearn these the hard way)

- **Run commands, don't watch logs unless the exit code is non-zero.** Only read output in detail on failure.
- **A hand-written ambient `.d.ts` must never share a basename with a sibling `.ts`/`.tsx` in the same folder** — TypeScript silently excludes it from the program (no error, it's just gone). This is why the preload types file is `apps/desktop/src/preload/api.d.ts`, not `index.d.ts` next to `index.ts`.
- **Every tsconfig in this repo sets `noEmit: true`.** Don't run a raw `tsc --build` without it — a bad one during this template's setup emitted `.js`/`.d.ts` straight into `src/` and got committed by accident.
- **electron-vite defaults `build.minify` to `false` for all three targets** (main/preload/renderer), unlike plain `vite build`. It's explicitly turned on in `apps/desktop/electron.vite.config.ts` — don't remove that thinking it's redundant.
- **electron-builder requires the `electron` devDependency to be an exact version, no `^`/range** (`apps/desktop/package.json`) — it can't resolve a range to a specific binary to download.
- **vitest 5 requires Node >=22; this repo targets Node 20** (devcontainer, CI). Vitest is pinned to `^4` for that reason — don't bump it to 5 without also bumping the Node baseline everywhere (devcontainer Dockerfile, CI workflows, root `engines`).
- **ESLint is pinned to `^9`, not the current `^10`.** `eslint-plugin-react` and `eslint-plugin-jsx-a11y` (both added after comparing against electron-react-boilerplate) don't yet declare an ESLint 10 peer range — installing them alongside ESLint 10 needs `--legacy-peer-deps` and breaks a plain `npm ci`. Re-check their peer ranges before bumping ESLint back to 10.
- **A dynamic `import()` gated on `app.isPackaged` still ships in the production bundle** (Rollup can't dead-code-eliminate a runtime check). Gate build-time-only imports on `import.meta.env.DEV` instead, as done for `electron-devtools-installer` in `apps/desktop/src/main/index.ts` — that branch disappears entirely from the packaged build.
- **New screens/components/state go in `packages/shared`, never duplicated into `apps/desktop` or `apps/web`.** If you find yourself writing near-identical code in both app folders, it belongs in `packages/shared` instead.
- **After any dependency or build-config change**, run `npm run lint && npm run typecheck && npm run build && npm run test` before considering the task done — this repo has no CI feedback loop inside a session, so these are the only checks available.

## Other things worth knowing

- Minimal third-party libs on purpose (explicit project goal) — don't add a new dependency (state lib, UI kit, router, etc.) without a concrete need in front of you; note it as a TODO instead if it's speculative.
- Security posture is deliberate, not default: sandboxed preload + CSP (desktop via main process, web via nginx). See [CONTRIBUTING.md](CONTRIBUTING.md) section 10 before touching either.
- Deploy workflows are manual (`workflow_dispatch`) by convention, matching [Experiments-flutter](../Experiments-flutter)'s `.github/workflows` — don't add push-triggered deploys without asking.
