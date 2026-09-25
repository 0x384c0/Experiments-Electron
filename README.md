# Experiments Electron

Electron desktop + web hello world. Dev environment setup only.

## Structure

```
apps/desktop  - Electron app (main, preload, renderer html)
apps/web      - same UI shell, served plain over http for browser
```

npm workspaces. No shared package yet, no framework, no bundler. Kept flat on purpose.

## Dev

Open in VS Code, reopen in container (devcontainer installs electron's Linux GUI deps + xvfb).

```bash
npm install
npm run start:desktop   # opens Electron window (needs a display; use start:desktop:headless in container without one)
npm run start:web       # http://localhost:3000
```

Debug via VS Code launch configs: "Electron: Main" and "Web: Chrome".

## Next

Not done yet, for later:

- Port modules from [Experiments-flutter](../Experiments-flutter) (packages/features/* -> equivalent here) once shape of this app is proven.
- Pick a state/view pattern. Flutter side uses Bloc/Cubit + Riverpod. Electron/web options to weigh:
  - Redux/Flux (reducer + unidirectional flow, closest analog to Bloc)
  - MVI with RxJS (explicit intent -> state stream)
  - Elm-style (model/update/view, no OOP)
  - Plain MVVM with a UI framework (Vue is MVVM-shaped natively)
- Decide main-process vs renderer split for business logic (IPC boundary), separate question from the state pattern above.
- Pick a UI framework only when first real feature lands, not before.
