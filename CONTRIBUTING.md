# Contributing

Full dev pipeline for this repo. See [README.md](README.md) for the high-level structure/pitch.

## 1. Getting started

Open in VS Code, "Reopen in Container" (needs Docker running — see [.devcontainer](.devcontainer)). It builds an image with Electron's Linux GUI deps + xvfb and runs `npm install` for you.

Without the container: any machine with Node `^20.19.0 || >=22.12.0` (see root `package.json` `engines`), then:

```bash
npm install
```

```bash
npm run dev:desktop            # electron-vite dev, HMR, opens a window
npm run dev:desktop:headless   # same, under xvfb (no display, e.g. in the container)
npm run dev:web                # vite dev server, http://localhost:3000
```

Debug via VS Code launch configs: "Electron: dev (main + renderer)" and "Web: Chrome" (`.vscode/launch.json`).

## 2. Project structure

```
apps/desktop      - Electron shell (main, preload, electron-vite config, packaging)
apps/web          - browser shell (plain Vite, nginx Dockerfile)
packages/shared   - the actual app: screens, theme, state. Both shells import from here.
```

`packages/shared` has no build step — Vite compiles its TS/TSX straight from source through the npm workspace symlink, exactly like app code, so editing it hot-reloads in both shells at once. Never duplicate a component into `apps/desktop` or `apps/web` — if both platforms need it, it belongs in `packages/shared`; if only one does, it's platform chrome and stays in that app's `main.tsx`/`index.html`/main-process code.

## 3. Adding a feature

- New screen/component/state -> `packages/shared/src/`. Export it from `packages/shared/src/index.ts`.
- Each shell's `main.tsx` only wires in what's actually platform-specific (e.g. desktop passes `window.api.platform` from its preload via `contextBridge`; web doesn't have that, so it passes a literal). Don't leak platform checks into shared code — pass what differs in as a prop/param instead.
- If a feature needs something from Node/Electron APIs the browser can't have (filesystem, native dialogs, etc.), add it to `apps/desktop/src/preload` behind `contextBridge`, expose a typed method on `window.api` (see `apps/desktop/src/preload/api.d.ts`), and have the web shell either omit that feature or provide a browser-appropriate fallback. Never `require()` Node modules from shared/renderer code directly — it won't run in the browser target and the desktop renderer is sandboxed (`sandbox: true`).
- Once there's more than one screen, add a `packages/shared/src/screens/` folder and a router (react-router or similar) — still shared by both shells, see README TODO.

## 4. UI & design

- MUI (Material Design). Theme lives at `packages/shared/src/theme.ts`, wrap new roots in the same `ThemeProvider`/`CssBaseline` pattern used in both `main.tsx` files.
- Keep style-related CSS-in-JS (`sx` prop, `styled()`) — that's what the CSP's `style-src 'unsafe-inline'` in both `apps/desktop/src/main/index.ts` and `apps/web/nginx.conf` already accounts for. Don't add inline `<script>` or `eval`-based styling; that needs a CSP change (`script-src`), which is a bigger call.
- No design library beyond MUI. If you need a component MUI doesn't have, build it in `packages/shared`, don't add another UI kit without discussing it first — Electron templates get bloated fast.

## 5. Validate

```bash
npm run lint            # eslint (flat config, eslint.config.mjs)
npm run format           # prettier --write
npm run format:check    # prettier --check, what CI runs
npm run typecheck        # tsc --noEmit, all three workspace packages
```

husky + lint-staged run `eslint --fix` and `prettier --write` on staged files automatically on commit — a failing lint blocks the commit. Don't bypass with `--no-verify`; fix the lint error or, if it's wrong, fix the rule in `eslint.config.mjs`.

## 6. Unit tests

Vitest. Tests live in `packages/shared` (`*.test.ts`, next to the file they test) since that's where the actual logic is — the two app shells are just wiring and don't carry test-worthy logic on their own.

```bash
npm run test   # vitest run, packages/shared
```

Add a component test (Testing Library) once there's a component worth testing beyond a store — not installed yet, see README TODO.

## 7. E2E tests

Playwright, launches the real built Electron app (not a mock) — see `apps/desktop/e2e/app.spec.ts`.

```bash
npm run build -w apps/desktop   # e2e runs against the built app, not dev server
npm run test:e2e -w apps/desktop
```

CI runs this under `xvfb-run` in a separate job (`.github/workflows/ci.yml`) since GitHub's Linux runners have no display.

## 8. Build & package

```bash
npm run build              # production build, both apps -> apps/desktop/out, apps/web/dist
npm run package:desktop    # installer for the current OS -> apps/desktop/release
docker compose up web      # web build served via nginx -> http://localhost:3000
```

Minify: on by default for the web app (`vite build`); explicitly enabled for desktop in `apps/desktop/electron.vite.config.ts` (electron-vite defaults `minify: false`, unlike plain Vite — don't remove that config thinking it's redundant).

## 9. Deploy

All deploy workflows are manual (`workflow_dispatch`), not triggered on push — matching [Experiments-flutter](../Experiments-flutter/.github/workflows)'s convention.

- **[deploy_desktop.yml](.github/workflows/deploy_desktop.yml)** — matrix-builds mac/win/linux installers, publishes them to one GitHub Release named from `apps/desktop/package.json`'s version. Unsigned builds, no code signing configured.
- **[deploy_web.yml](.github/workflows/deploy_web.yml)** — builds the web app and publishes it to GitHub Pages. One-time manual repo setup: Settings -> Pages -> Source: "GitHub Actions".
- **[deploy_azure.yml](.github/workflows/deploy_azure.yml)** — builds the web Docker image, pushes to Azure Container Registry, updates a Container App. Disabled until `AZURE_CREDENTIALS` (and related) secrets are set — it checks first and skips with a warning rather than failing. See [.github/deploy_azure.env.example](.github/deploy_azure.env.example) for what to add under Settings -> Secrets and variables -> Actions.

Bumping the desktop app version before a release: edit `version` in `apps/desktop/package.json` — that's what names the GitHub Release.

## 10. Security notes

- Desktop preload is sandboxed (`sandbox: true`) and only exposes what's explicitly listed via `contextBridge` in `apps/desktop/src/preload/index.ts`. Don't flip `sandbox` back to `false` to make something "just work" — fix it via `contextBridge` instead.
- CSP is set in two places, deliberately different for dev vs prod: `apps/desktop/src/main/index.ts` (looser when `!app.isPackaged`, for Vite HMR) and `apps/web/nginx.conf` (prod only, no dev exception needed since nginx never serves the dev server). Keep both in sync if you tighten or loosen the policy.
