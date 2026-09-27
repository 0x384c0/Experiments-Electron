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

Copy `.env.example` to `.env` at the repo root and fill in real values (currently just a free [weatherapi.com](https://www.weatherapi.com/) key) — without it, the weather feature loads and shows a clear error state rather than data, which is fine for working on anything else.

Debug via VS Code launch configs: "Electron: dev (main + renderer)" and "Web: Chrome" (`.vscode/launch.json`). React DevTools installs itself automatically the first time you run `npm run dev:desktop` (needs network access once; silently skipped if offline, see `apps/desktop/src/main/index.ts`).

## 2. Project structure

```
apps/desktop      - Electron shell (main, preload, electron-vite config, packaging)
apps/web          - browser shell (plain Vite, nginx Dockerfile)
packages/shared   - the actual app. Both shells import from here.
  src/
    app/          - composition root: App.tsx (routes + composes feature screens),
                    store.ts (combines feature reducers), theme.ts. Depends on
                    features/shared, never the other way around.
    features/
      <feature>/
        ui/         - screens/components (the "presentation" layer)
        model/      - state (Redux slice) + presentation-state mappers
        domain/     - use cases (interactor) + repository + domain models --
                      add this once a feature actually calls an external API
                      or has business rules beyond formatting for display
        data/       - API client / DTOs -- same, add once there's a real API
    shared/
      lib/          - cross-cutting infra any feature can depend on: the DI
                      container (di.ts), typed Redux hooks (hooks.ts), the
                      generic async-fetch-into-a-slice helper (asyncResource.ts)
```

This is [Feature-Sliced Design](https://feature-sliced.design) (a documented methodology, not house convention): a "feature" is a self-contained slice with its own `ui`/`model`, addable and removable independently. It's enforced, not just documented — `eslint.config.mjs`'s `boundaries/dependencies` rule fails the build if a feature imports another feature's internals directly, or if anything imports "up" into `app`. If you find yourself needing to reach into another feature, either promote the shared piece into `shared/` or compose them at the `app` layer.

`packages/shared` has no build step — Vite compiles its TS/TSX straight from source through the npm workspace symlink, exactly like app code, so editing it hot-reloads in both shells at once. Never duplicate a component into `apps/desktop` or `apps/web` — if both platforms need it, it belongs in `packages/shared`; if only one does, it's platform chrome and stays in that app's `main.tsx`/`index.html`/main-process code.

## 3. Adding a feature

Follow the existing `features/weather` slice as the template (it has all four layers, including the DI chain and an async-fetch slice):

- **`data/`**: the API client (`weatherApi.ts`) — DTOs matching the wire format, a plain `@injectable()` class wrapping `fetch`. Reads config (API keys) via `import.meta.env.VITE_*`, cast through `Record<string, string | undefined>` (Vite's `ImportMetaEnv` type isn't augmented for custom vars, casting is simpler than adding a cross-program ambient `.d.ts` — see AGENTS.md). Real secrets go in `.env` (gitignored); document the var in the root `.env.example`.
- **`domain/`**: domain models (plain TS interfaces, not DTOs — the repository maps DTO -> domain), a repository (`@injectable()`, wraps the API client, does the DTO-to-domain mapping), an interactor (`@injectable()`, wraps the repository — the one thing a slice actually calls). Only split repository/interactor into separate injectable classes if there's a real reason to (matches source app fidelity here); a trivial feature can collapse them.
- **`model/`**: a Redux Toolkit slice. For anything that fetches async data, use `initialAsyncResourceState`/`addAsyncResourceCases` from `shared/lib/asyncResource.ts` instead of hand-rolling loading/error/data state — see `weatherSlice.ts`. The thunk resolves DI classes directly (`container.resolve(WeatherInteractor)`) — thunks aren't components, no `useInjection`-style hook applies. Presentation-state mappers (formatting domain data for display) also live here, as plain functions, not injectable classes — nothing swaps them at runtime.
- **Selectors take a locally-scoped state shape** (see `WeatherRootState` in `weatherSlice.ts`), never the app's full `RootState` — a feature must not import from `app` (see the boundary rule above; this is what it's actually there to prevent).
- **Dispatching a thunk** needs `useAppDispatch` from `shared/lib/hooks.ts`, not plain `useDispatch()` — the plain version doesn't know the store has thunk middleware and won't type-check `dispatch(someThunk())`. `useAppDispatch` is generic on purpose (doesn't reference `AppDispatch` from `app/store`, which would be the same forbidden `features -> app` edge).
- **`*.test.ts`**: co-located unit tests, next to the file they test. Prefer testing pure mappers and reducers (fast, no DI/network); resolving through the DI container in a test needs registering real or fake implementations first — not set up yet, do that when a feature actually needs it.
- **Register the slice** in `app/store.ts`'s `configureStore({ reducer: {...} })`.
- **Register the screen(s)** in `app/App.tsx`'s `<Routes>` — this is the one place allowed to know about every feature (it composes them), and the one place a router lives (see below).
- **If a feature needs something from Node/Electron the browser can't have** (filesystem, native dialogs, secure storage, etc.), add it to `apps/desktop/src/preload` behind `contextBridge`, expose it on `window.api`, and register a DI token backed by it in desktop's `main.tsx` — the web shell registers a browser-appropriate implementation (or omits the feature) behind the same token. This is currently unused (no feature needs it yet) but is how it's wired when one does. Never `require()` Node modules from feature code directly — it won't run in the browser target, and the desktop renderer is sandboxed (`sandbox: true`).
- **Calling any external API**: extend the CSP's `connect-src` (and `img-src` if it serves images) in both `apps/desktop/src/main/index.ts` and `apps/web/nginx.conf` — CSP defaults `connect-src` to `default-src 'self'`, so a fresh `fetch()` to a new origin fails as an opaque "Failed to fetch" in the packaged app with no indication it's a CSP block, not a network problem.

**Where business logic lives — decided**: default is `packages/shared` (runs in the renderer for desktop, directly in the browser for web — same code, no rework, no main process involved for either target). Only punch a hole through `contextBridge` into the main process when a piece of a feature genuinely can't run in a browser sandbox:

- native OS access (filesystem, native dialogs, secure storage/keychain, a local DB file),
- security-sensitive work that shouldn't execute in the renderer's context at all,
- CPU-heavy work that would block the UI thread (renderer is single-threaded, same as a browser tab).

That's a per-piece exception, not a per-feature one — keep as much of a feature in `packages/shared` as actually works in a browser, and only wall off the specific part that can't. The alternative (business logic living in the main process, renderer just dispatching over IPC) was considered and rejected: it would require a real backend server behind every such feature for the web target to have anything to talk to, which breaks the one-shared-codebase premise this template is built around.

**Routing**: `react-router` (`<Routes>` in `app/App.tsx`), but the actual `Router` component is shell-specific, wired in each `main.tsx`, not in shared code — desktop uses `HashRouter`, web uses `BrowserRouter`. The packaged desktop app is loaded via `file://`, which has no server to resolve a browser-history path on refresh; `HashRouter` sidesteps that entirely by keeping the route in the URL fragment. Don't switch desktop to `BrowserRouter` to "match" web — they're intentionally different here, same as the per-shell DI registration.

## 4. UI & design

- MUI (Material Design). Theme lives at `packages/shared/src/app/theme.ts`, wrap new roots in the same `ThemeProvider`/`CssBaseline` pattern used in both `main.tsx` files.
- `Stack`'s `alignItems`/`justifyContent`/etc. aren't part of its own props in this MUI version — pass them through `sx` instead (`<Stack sx={{ alignItems: "center" }}>`, not `<Stack alignItems="center">`). Only `direction`/`spacing`/`divider` are real `Stack` props; check `node_modules/@mui/material/Stack/Stack.d.ts` if unsure rather than assuming an older MUI API.
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

Vitest. Tests live next to the file they test (e.g. `weatherMappers.test.ts`, `weatherSlice.test.ts`) since that's where the actual logic is — the two app shells are just wiring and don't carry test-worthy logic on their own.

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

All deploy workflows are manual (`workflow_dispatch`), not triggered on push.

- **[deploy_desktop.yml](.github/workflows/deploy_desktop.yml)** — matrix-builds mac/win/linux installers, publishes them to one GitHub Release named from `apps/desktop/package.json`'s version. Unsigned builds, no code signing configured.
- **[deploy_web.yml](.github/workflows/deploy_web.yml)** — builds the web app and publishes it to GitHub Pages. One-time manual repo setup: Settings -> Pages -> Source: "GitHub Actions".
- **[deploy_azure.yml](.github/workflows/deploy_azure.yml)** — builds the web Docker image, pushes to Azure Container Registry, updates a Container App. Disabled until `AZURE_CREDENTIALS` (and related) secrets are set — it checks first and skips with a warning rather than failing. See [.github/deploy_azure.env.example](.github/deploy_azure.env.example) for what to add under Settings -> Secrets and variables -> Actions.

Bumping the desktop app version before a release: edit `version` in `apps/desktop/package.json` — that's what names the GitHub Release.

## 10. Security notes

- Desktop preload is sandboxed (`sandbox: true`) and only exposes what's explicitly listed via `contextBridge` in `apps/desktop/src/preload/index.ts`. Don't flip `sandbox` back to `false` to make something "just work" — fix it via `contextBridge` instead.
- CSP is set in two places, deliberately different for dev vs prod: `apps/desktop/src/main/index.ts` (looser when `!app.isPackaged`, for Vite HMR) and `apps/web/nginx.conf` (prod only, no dev exception needed since nginx never serves the dev server). Keep both in sync if you tighten or loosen the policy.

## 11. Roadmap / open decisions

- `home` + `weather` are ported (`packages/shared/src/features/`); continue porting the remaining features from the source app one at a time, following the `weather` slice as the template.
- Home's tabs are hardcoded in `app/App.tsx` (just `Weather` right now). Revisit once there are enough features to need a side drawer / secondary-nav split (the source app's actual shape: 3 bottom-tab destinations + a handful of drawer-only ones) rather than growing the tab bar indefinitely.
- Code signing + auto-update (`electron-updater`) before any real distribution to testers — an unsigned auto-update channel is worse than none.
- App icon (electron-builder uses its default one right now).
- Component tests (Testing Library) once there's a component worth testing beyond a store.
- Bump ESLint back to `^10` once `eslint-plugin-react`/`eslint-plugin-jsx-a11y` declare peer support for it.
- Turborepo/Nx if `packages/*` grows beyond a couple of packages — plain npm workspaces is proportionate at this size.
