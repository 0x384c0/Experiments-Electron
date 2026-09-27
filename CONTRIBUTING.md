# Contributing

Full dev pipeline for this repo. See [README.md](README.md) for the high-level structure/pitch.

## 1. Getting started

Open in VS Code, "Reopen in Container" (needs Docker running — see [.devcontainer](.devcontainer)). It builds an image with Electron's Linux GUI deps + xvfb and runs `npm install` for you. Prefer the container over running `npm install`/scripts on the host directly — this repo pulls in hundreds of transitive npm packages, any of which can run arbitrary code at install time; the container contains that.

```bash
npm run dev:web                # vite dev server, http://localhost:3000 (forwarded automatically)
npm run dev:desktop:headless   # electron-vite dev under xvfb, for logic/tests — no visible window
```

The container has no display, so `npm run dev:desktop` (non-headless) won't show a window there — do UI/visual work against the web target while in the container, or run `npm run dev:desktop` on the host directly if you need to see the actual Electron window.

Without the container: any machine with Node `^20.19.0 || >=22.12.0` (see root `package.json` `engines`), then `npm install` and the same scripts above (`dev:desktop` instead of `dev:desktop:headless` works normally there, since the host has a real display).

Debug via VS Code launch configs: "Electron: dev (main + renderer)" and "Web: Chrome" (`.vscode/launch.json`). React DevTools installs itself automatically the first time you run `npm run dev:desktop` (needs network access once; silently skipped if offline, see `apps/desktop/src/main/index.ts`).

## 2. Project structure

```
apps/desktop      - Electron shell (main, preload, electron-vite config, packaging)
apps/web          - browser shell (plain Vite, nginx Dockerfile)
packages/shared   - the actual app. Both shells import from here.
  src/
    app/          - composition root: App.tsx (composes feature screens), store.ts
                    (combines feature reducers), theme.ts. Depends on features/shared,
                    never the other way around.
    features/
      <feature>/
        ui/         - screens/components (the "presentation" layer)
        model/      - state (Redux slice) + injectable services (the "domain"
                      layer -- data layer goes here too once a feature needs one)
    shared/
      lib/          - cross-cutting infra any feature can depend on: the DI
                      container (di.ts), generic hooks (useInjection.ts)
```

This is [Feature-Sliced Design](https://feature-sliced.design) (a documented methodology, not house convention), mapped onto this Flutter-ported app's original `presentation`/`domain`/`data`-per-feature + DI shape: a "feature" here is the equivalent of a Flutter feature package. It's enforced, not just documented — `eslint.config.mjs`'s `boundaries/dependencies` rule fails the build if a feature imports another feature's internals directly, or if anything imports "up" into `app`. If you find yourself needing to reach into another feature, either promote the shared piece into `shared/` or compose them at the `app` layer.

`packages/shared` has no build step — Vite compiles its TS/TSX straight from source through the npm workspace symlink, exactly like app code, so editing it hot-reloads in both shells at once. Never duplicate a component into `apps/desktop` or `apps/web` — if both platforms need it, it belongs in `packages/shared`; if only one does, it's platform chrome and stays in that app's `main.tsx`/`index.html`/main-process code.

## 3. Adding a feature

Follow the existing `features/hello-world` slice as the template:

- **`ui/`**: the screen/component. Resolve dependencies via `useInjection(SomeService)` (from `shared/lib/di`), never reach for `window.api` or a platform check directly — inject an abstraction instead (see `HelloWorldService` for the pattern: it depends on `PlatformInfo`, an interface, not a concrete platform check).
- **`model/`**: a Redux Toolkit slice (`createSlice`) for state, plus any `@injectable()` service classes (tsyringe) for logic that needs a dependency injected. A slice's selectors take a locally-scoped state shape (see `HelloWorldRootState` in `helloWorldSlice.ts`), never the app's full `RootState` — a feature must not import from `app` (see the boundary rule above; this is what it's actually there to prevent).
- **`model/*.test.ts`**: co-located unit tests, next to the slice/service they test.
- **Register the slice** in `app/store.ts`'s `configureStore({ reducer: {...} })`.
- **Register the screen** in `app/App.tsx` (composes it in, gains a router here once there's a second screen — see Roadmap).
- **Each shell's `main.tsx`** registers the platform-specific DI implementations before rendering (`container.registerInstance(SomeToken, ...)`) — that's the _only_ place platform differences should exist. If a feature needs something from Node/Electron the browser can't have (filesystem, native dialogs, etc.), add it to `apps/desktop/src/preload` behind `contextBridge`, expose it on `window.api`, and register a DI token backed by it in desktop's `main.tsx` — the web shell registers a browser-appropriate implementation (or omits the feature) behind the same token. Never `require()` Node modules from feature code directly — it won't run in the browser target, and the desktop renderer is sandboxed (`sandbox: true`).
- Once there's more than one screen: add `react-router` at the `app` layer — still shared by both shells, see Roadmap below.

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

Lint rules: `typescript-eslint` recommended + `react` + `react-hooks` + `react-refresh` + `jsx-a11y` (accessibility) + `boundaries` (feature isolation, see section 2/3) + `eslint-config-prettier` (disables formatting rules Prettier already owns). ESLint itself is pinned to `^9`, one major behind current, because `eslint-plugin-react`/`eslint-plugin-jsx-a11y` don't declare an ESLint 10 peer range yet — bump it once they do.

The `boundaries` rule needs `eslint-import-resolver-typescript` configured (`settings["import/resolver"]` in `eslint.config.mjs`) to resolve extensionless TS imports at all — without it, it silently treats every dependency as unresolvable and the rule never fires, no error, no warning. If you ever see it stop catching a real violation, check that setting first.

husky + lint-staged run `eslint --fix` and `prettier --write` on staged files automatically on commit — a failing lint blocks the commit. Don't bypass with `--no-verify`; fix the lint error or, if it's wrong, fix the rule in `eslint.config.mjs`.

## 6. Unit tests

Vitest. Tests live next to the file they test, inside the feature's `model/` (e.g. `helloWorldSlice.test.ts`) since that's where the actual logic is — the two app shells are just wiring and don't carry test-worthy logic on their own.

```bash
npm run test   # vitest run, packages/shared
```

Add a component test (Testing Library) once there's a component worth testing beyond a store — not installed yet, see Roadmap below.

## 7. E2E tests

Playwright, launches the real built Electron app (not a mock) — see `apps/desktop/e2e/app.spec.ts`.

```bash
npm run build -w apps/desktop   # e2e runs against the built app, not dev server
npm run test:e2e -w apps/desktop
```

CI runs this under `xvfb-run` in a separate job (`.github/workflows/ci.yml`) since GitHub's Linux runners have no display, with `ELECTRON_DISABLE_SANDBOX=1` (Electron won't run its Chromium sandbox as a non-root/non-setuid install — fine for a throwaway CI/container run, never do this for a real packaged build). Same combination in `npm run dev:desktop:headless`. `xvfb-run` also needs `xauth` installed alongside it, or it fails outright.

## 8. Build & package

```bash
npm run build              # production build, both apps -> apps/desktop/out, apps/web/dist
npm run package:desktop    # installer for the current OS -> apps/desktop/release
docker compose up web      # web build served via nginx -> http://localhost:3000
```

Minify: on by default for the web app (`vite build`); explicitly enabled for desktop in `apps/desktop/electron.vite.config.ts` (electron-vite defaults `minify: false`, unlike plain Vite — don't remove that config thinking it's redundant).

Dev-only code (like the React DevTools installer in `main/index.ts`) must be gated on `import.meta.env.DEV`, not a runtime check like `app.isPackaged` — only the build-time flag lets Rollup actually drop the code from the packaged app instead of just skipping it at runtime.

`executableName` is set explicitly in `electron-builder.yml` — the default (sanitized from the npm package name `@experiments-electron/desktop`) breaks the Linux AppImage build specifically (invalid path characters), while macOS/Windows targets don't hit it. Test Linux packaging (`npm run package:desktop` in the devcontainer) before assuming a packaging change works everywhere; it's easy to only test on macOS and miss a Linux-only failure.

## 9. Deploy

All deploy workflows are manual (`workflow_dispatch`), not triggered on push — matching [Experiments-flutter](../Experiments-flutter/.github/workflows)'s convention.

- **[deploy_desktop.yml](.github/workflows/deploy_desktop.yml)** — matrix-builds mac/win/linux installers, publishes them to one GitHub Release named from `apps/desktop/package.json`'s version. Unsigned builds, no code signing configured.
- **[deploy_web.yml](.github/workflows/deploy_web.yml)** — builds the web app and publishes it to GitHub Pages. One-time manual repo setup: Settings -> Pages -> Source: "GitHub Actions".
- **[deploy_azure.yml](.github/workflows/deploy_azure.yml)** — builds the web Docker image, pushes to Azure Container Registry, updates a Container App. Disabled until `AZURE_CREDENTIALS` (and related) secrets are set — it checks first and skips with a warning rather than failing. See [.github/deploy_azure.env.example](.github/deploy_azure.env.example) for what to add under Settings -> Secrets and variables -> Actions.

Bumping the desktop app version before a release: edit `version` in `apps/desktop/package.json` — that's what names the GitHub Release.

## 10. Security notes

- Desktop preload is sandboxed (`sandbox: true`) and only exposes what's explicitly listed via `contextBridge` in `apps/desktop/src/preload/index.ts`. Don't flip `sandbox` back to `false` to make something "just work" — fix it via `contextBridge` instead.
- CSP is set in two places, deliberately different for dev vs prod: `apps/desktop/src/main/index.ts` (looser when `!app.isPackaged`, for Vite HMR) and `apps/web/nginx.conf` (prod only, no dev exception needed since nginx never serves the dev server). Keep both in sync if you tighten or loosen the policy.

## 11. Roadmap / open decisions

- Port modules from [Experiments-flutter](../Experiments-flutter) (`packages/features/*` -> equivalent `packages/shared/src/features/*` here) — the ground is prepared (layering, DI, state pattern), this is the actual next step.
- Decide main-process vs renderer split for business logic (IPC boundary) as real features surface a need for it — orthogonal to the layering/DI/state decisions already made.
- Once there's more than one screen: `react-router` at the `app` layer, still shared by both shells.
- Code signing + auto-update (`electron-updater`) before any real distribution to testers — an unsigned auto-update channel is worse than none.
- App icon (electron-builder uses its default one right now).
- Component tests (Testing Library) once there's a component worth testing beyond a store.
- Bump ESLint back to `^10` once `eslint-plugin-react`/`eslint-plugin-jsx-a11y` declare peer support for it.
- Turborepo/Nx if `packages/*` grows beyond a couple of packages — plain npm workspaces is proportionate at this size.
