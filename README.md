# Experiments Electron

Reference template for Electron + web projects. No real feature yet on purpose — this proves the dev/build/test/deploy pipeline first, features get ported in later from [Experiments-flutter](../Experiments-flutter).

## Structure

```
apps/desktop      - Electron shell: electron-vite (main, preload), renders the shared screen
apps/web          - browser shell: plain Vite, renders the same shared screen
packages/shared   - the actual screen (App.tsx), theme, store. Both shells are thin wrappers around this.
```

Desktop and web are build targets of one app, not two apps — same component tree from `packages/shared`, each shell only supplies what's platform-specific and the outer chrome (`main.tsx`, `index.html`, window creation).

## Quick start

```bash
npm install
npm run dev:desktop   # electron-vite dev, HMR, opens a window
npm run dev:web        # vite dev server, http://localhost:3000
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full pipeline: dev container setup, adding a feature, UI/design conventions, validating, tests, build, package, deploy.

## Benchmarked against

Compared this template's choices against [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) (~24k stars, oldest/most-used) and [electron-vite/electron-vite-react](https://github.com/electron-vite/electron-vite-react) (official electron-vite team's own React template):

- **Matched, validated as correct**: electron-vite + electron-builder + React 19 + Vite 7 + TypeScript, all at the same major versions both reference repos use. Vitest + Playwright combo matches electron-vite-react exactly.
- **Adopted from the comparison**: `eslint-plugin-react` + `eslint-plugin-jsx-a11y` (accessibility linting) were missing here, present in ERB — added. `electron-devtools-installer` for auto-installed React DevTools in dev — added, gated on `import.meta.env.DEV` so it never ships in the packaged app (see [AGENTS.md](AGENTS.md) for why that gate matters over `app.isPackaged`).
- **Deliberately not adopted (yet)**: ERB ships `react-router-dom` and `electron-updater` as day-one dependencies. Skipped here — there's one screen (no routing target) and no code signing (an unsigned auto-update channel is arguably worse than none). Both are real, common, and tracked below, not overlooked.
- **Not standardized industry-wide, so not treated as a gap**: UI kit (MUI here, Tailwind in electron-vite-react, Sass in ERB), and even lint tooling (electron-vite-react ships none at all) vary freely across popular templates — no single answer to "match".

## Status / TODO

- [ ] Port modules from [Experiments-flutter](../Experiments-flutter) (packages/features/* -> equivalent here) once shape of this app is proven.
- [ ] Pick a state/view pattern properly (zustand right now is a placeholder). Flutter side uses Bloc/Cubit + Riverpod. Electron/web options to weigh:
  - Redux/Flux (reducer + unidirectional flow, closest analog to Bloc)
  - MVI with RxJS (explicit intent -> state stream)
  - Elm-style (model/update/view, no OOP)
  - Plain MVVM with a UI framework
- [ ] Decide main-process vs renderer split for business logic (IPC boundary), separate question from the state pattern above.
- [ ] Once there's more than one screen: a `screens/` folder in `packages/shared` + `react-router-dom` (industry norm per ERB), still shared by both shells.
- [ ] Code signing + auto-update (`electron-updater`, also an ERB default) before any real distribution to testers.
- [ ] App icon (electron-builder uses its default one right now).
- [ ] Component tests (Testing Library) once there's a component worth testing beyond a store.
- [ ] Re-check `eslint-plugin-react`/`eslint-plugin-jsx-a11y` peer ranges occasionally — bump ESLint back to `^10` once they support it (see [AGENTS.md](AGENTS.md)).
- [ ] Turborepo/Nx if `packages/*` grows beyond a couple of packages — plain npm workspaces is proportionate at this size, matching how [Experiments-flutter](../Experiments-flutter) only reaches for Melos once it has many packages.
