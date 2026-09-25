# Experiments Electron

Electron desktop + web hello world. Dev environment setup.

## Structure

```
apps/desktop  - Electron app, electron-vite (main, preload, React renderer)
apps/web      - same React hello world, plain Vite, runs in a browser
```

npm workspaces. No shared package between the two yet. React apps are separate copies on purpose, until a real feature needs sharing.

## Stack

- React 19 + Vite 7 for UI. electron-vite wraps Vite for the desktop app's 3 processes (main/preload/renderer).
- zustand for state (small store per app, see `src/*/store.ts`). Not a final architecture pick, just the least-boilerplate option for now.
- electron-log for main-process logging.
- electron-builder for installers (dmg/nsis/AppImage), config in [apps/desktop/electron-builder.yml](apps/desktop/electron-builder.yml).
- Minify is off by default in electron-vite; turned on explicitly in [electron.vite.config.ts](apps/desktop/electron.vite.config.ts). Web app minifies by default (plain `vite build`).

## Dev

Open in VS Code, reopen in container (devcontainer installs electron's Linux GUI deps + xvfb).

```bash
npm install
npm run dev:desktop            # electron-vite dev, HMR, opens a window
npm run dev:desktop:headless   # same, under xvfb (no display, e.g. in container)
npm run dev:web                # vite dev server, http://localhost:3000
```

Debug via VS Code launch configs: "Electron: dev (main + renderer)" and "Web: Chrome".

## Build / package / deploy

```bash
npm run build              # production build, both apps
npm run package:desktop    # installer for current OS -> apps/desktop/release
docker compose up web      # web build served via nginx, http://localhost:3000
```

CI: [.github/workflows/ci.yml](.github/workflows/ci.yml) runs typecheck + build on push/PR.
[.github/workflows/package.yml](.github/workflows/package.yml) builds installers for mac/win/linux (matrix) on a `v*` tag or manual trigger, uploads them as artifacts for testers. No code signing configured, unsigned builds only.

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
