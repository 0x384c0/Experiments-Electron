# Experiments Electron

Reference template for Electron + web projects. No real feature yet on purpose — this proves the dev/build/test/deploy pipeline first, features get ported in later.

## Structure

```
apps/desktop  - Electron app, electron-vite (main, preload, React renderer)
apps/web      - same React hello world, plain Vite, runs in a browser
```

npm workspaces. No shared package between the two yet. React apps are separate copies on purpose, until a real feature needs sharing.

## Stack

- React 19 + MUI (Material Design, community-maintained not Google) + Vite 7. electron-vite wraps Vite for the desktop app's 3 processes (main/preload/renderer).
- zustand for state (small store per app, see `src/*/store.ts`). Not a final architecture pick, just the least-boilerplate option for now, see TODO.
- electron-log for main-process logging.
- ESLint (flat config, [eslint.config.mjs](eslint.config.mjs)) + Prettier + EditorConfig. husky + lint-staged run both on staged files pre-commit.
- Vitest for unit tests (`src/**/*.test.ts`, logic only, no DOM). Playwright for e2e — launches the actual built Electron app, see [apps/desktop/e2e](apps/desktop/e2e).
- electron-builder for installers (dmg/nsis/AppImage), config in [apps/desktop/electron-builder.yml](apps/desktop/electron-builder.yml).
- Minify is off by default in electron-vite; turned on explicitly in [electron.vite.config.ts](apps/desktop/electron.vite.config.ts). Web app minifies by default (plain `vite build`).
- Security: preload is sandboxed (`sandbox: true`, uses `contextBridge` only), CSP set in [main/index.ts](apps/desktop/src/main/index.ts) for desktop (looser in dev, for Vite HMR) and in [nginx.conf](apps/web/nginx.conf) for the deployed web image.

## Dev

Open in VS Code, reopen in container (devcontainer installs electron's Linux GUI deps + xvfb).

```bash
npm install
npm run dev:desktop            # electron-vite dev, HMR, opens a window
npm run dev:desktop:headless   # same, under xvfb (no display, e.g. in container)
npm run dev:web                # vite dev server, http://localhost:3000
```

Debug via VS Code launch configs: "Electron: dev (main + renderer)" and "Web: Chrome".

```bash
npm run lint            # eslint
npm run format           # prettier --write
npm run test              # vitest, both apps
npm run test:e2e -w apps/desktop   # playwright, needs `npm run build -w apps/desktop` first
```

## Build / package / deploy

```bash
npm run build              # production build, both apps
npm run package:desktop    # installer for current OS -> apps/desktop/release
docker compose up web      # web build served via nginx, http://localhost:3000
```

The web Docker image is a plain OCI image (node build stage -> nginx serve stage), deployable as-is to any container host (Azure Container Apps / App Service for Containers, ECS, Cloud Run, etc). No platform-specific config baked in.

CI: [ci.yml](.github/workflows/ci.yml) runs lint + format check + typecheck + build + unit tests on push/PR, plus a separate e2e job (built app under xvfb).
[package.yml](.github/workflows/package.yml) builds installers for mac/win/linux (matrix) on a `v*` tag or manual trigger, uploads them as artifacts for testers. No code signing configured, unsigned builds only.

## TODO

- [ ] Port modules from [Experiments-flutter](../Experiments-flutter) (packages/features/* -> equivalent here) once shape of this app is proven.
- [ ] Pick a state/view pattern properly (zustand above is a placeholder). Flutter side uses Bloc/Cubit + Riverpod. Electron/web options to weigh:
  - Redux/Flux (reducer + unidirectional flow, closest analog to Bloc)
  - MVI with RxJS (explicit intent -> state stream)
  - Elm-style (model/update/view, no OOP)
  - Plain MVVM with a UI framework
- [ ] Decide main-process vs renderer split for business logic (IPC boundary), separate question from the state pattern above.
- [ ] Extract a shared UI/logic package once desktop and web need the same feature, instead of two copies.
- [ ] Code signing + auto-update (electron-updater) before any real distribution to testers.
- [ ] App icon (electron-builder uses its default one right now).
- [ ] Component tests (Testing Library) once there's a component worth testing beyond a store.
