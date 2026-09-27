# AI Agent Guide: Experiments-Electron

Context for AI agents working in this repo.

## Project overview

Electron + web reference template, npm workspaces, no real feature yet on purpose — this proves the dev/build/test/deploy pipeline first. Desktop and web are two build targets of **one app**, not two separate apps.

- [apps/desktop](apps/desktop) — Electron shell (main, preload, electron-vite config, packaging).
- [apps/web](apps/web) — browser shell (plain Vite, nginx Dockerfile).
- [packages/shared](packages/shared) — the actual app, feature-sliced (`app/` composition root, `features/*/{ui,model}`, `shared/lib`). Both shells import from here and are otherwise thin wrappers. See [CONTRIBUTING.md](CONTRIBUTING.md) section 2/3 before adding or moving anything here.

Full structure/pitch: [README.md](README.md). Full pipeline (setup, adding a feature, testing, deploying): [CONTRIBUTING.md](CONTRIBUTING.md) — read it before making a change that touches more than one file.

## Run everything in the devcontainer, not the host

The user's explicit policy: `npm install`, any `npm run *`, `npx *`, or anything else that executes package code (postinstall scripts, build tooling) runs **inside the devcontainer**, not directly on the host machine — this repo pulls in hundreds of transitive npm packages, any of which can run arbitrary code at install time, and the container contains that blast radius.

- Before running such a command, check for a running container: `docker ps --filter name=experiments-electron-devcontainer`.
- If it's up, run commands inside it: `docker exec -u node experiments-electron-devcontainer bash -lc "cd /workspaces/Experiments-Electron && <command>"`. Use `-u node`, not root — root can build/package fine but Electron itself refuses to run its sandbox as root (see the gotcha below).
- If it's not running, start it yourself rather than falling back to the host: `npx --yes @devcontainers/cli up --workspace-folder .` (same tool VS Code's Dev Containers extension uses). Rebuild instead if `.devcontainer/Dockerfile` or `devcontainer.json` changed: `npx --yes @devcontainers/cli build --workspace-folder . --no-cache` first.
- Read-only actions (reading files, `git status`/`git log`, grepping) don't need the container — only actual package execution does.
- If the container genuinely can't be started (Docker not running, etc.), say so and ask before falling back to the host — don't silently run `npm install` there.

## Architecture status

Decided: [Feature-Sliced Design](https://feature-sliced.design) layering, Redux Toolkit for state, tsyringe for DI, enforced by `eslint-plugin-boundaries` — see [CONTRIBUTING.md](CONTRIBUTING.md) section 2/3. What's still open is tracked in the Roadmap section there (main/renderer split for business logic, routing once there's a second screen). Don't silently change the state/DI pattern — it ripples through every feature; ask first.

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
- **`node_modules` is bind-mounted from the host by default and holds platform-specific binaries** (Electron's). Without the named volumes in `.devcontainer/devcontainer.json`, a `node_modules` built on the host leaks into the container (and back), and Electron tries to exec the wrong platform's binary — surfaces as garbage shell errors like `not found` / `Unterminated quoted string`, not an obvious "wrong binary" message.
- **Electron refuses to run its Chromium sandbox as root**, and a fresh non-root install's `chrome-sandbox` binary isn't set up with the root-owned setuid bit it needs either. Both `npm run dev:desktop:headless` and CI's e2e step set `ELECTRON_DISABLE_SANDBOX=1` for exactly this reason — it's safe there (throwaway headless container/CI run), never do this for a real packaged build users will run.
- **`xvfb-run` needs `xauth` installed alongside `xvfb`**, not just `xvfb` alone — missing it fails with `xauth command not found`, easy to miss since the base devcontainer image doesn't include it by default.
- **electron-builder derives the packaged executable name from the npm package's `name` field by default** (`@experiments-electron/desktop`) — the `@`/`/` characters are invalid on Linux and only fail there (AppImage), not on macOS/Windows targets. Set `executableName` explicitly in `apps/desktop/electron-builder.yml` rather than relying on the default. This only ever surfaces if the Linux target is actually built and tested, which is easy to skip if you only test packaging on macOS.
- **`eslint-plugin-boundaries` silently no-ops without a resolver.** It needs `settings["import/resolver"]` configured (`eslint-import-resolver-typescript` here) to resolve extensionless TS imports to real file paths — without it, every dependency looks "unknown" to the plugin and the rule never fires, with no error or warning telling you why. If a boundary violation you expect to be caught isn't, check this first, not the policy itself. (`ESLINT_PLUGIN_BOUNDARIES_DEBUG=true npx eslint <file>` shows exactly how it resolved a given import, `"path": null` on the `to` side means resolution failed.)
- **Use `{{from.x}}` template syntax in boundaries policies, not `${from.x}`** — the latter still works but is deprecated (v5→v6 migration) and prints a warning on every lint run.
- **A feature's selectors must not import the app's `RootState`** (that's a `features -> app` edge, exactly backwards — `app` composes features, not the other way around, and the boundary rule blocks it). Type a selector against a locally-scoped state shape instead (see `HelloWorldRootState` in `helloWorldSlice.ts`).
- **Decorator compiler options (`experimentalDecorators`, `useDefineForClassFields: false`) must be set in every tsconfig that transitively typechecks decorated code, not just the package that defines it.** `tsc` builds one program per tsconfig-consuming project, and it walks into `packages/shared`'s source through the workspace symlink — `apps/desktop`'s and `apps/web`'s own tsconfigs needed the same decorator settings once `packages/shared` started using tsyringe's `@injectable()`/`@inject()`, even though those apps never write a decorator themselves.
- **tsyringe needs the `reflect-metadata` polyfill imported at runtime regardless of whether real `design:paramtypes` metadata gets emitted.** Vite/esbuild doesn't emit that metadata at all (a known esbuild limitation) — so every constructor injection here uses explicit `@inject(SomeToken)` rather than relying on automatic type-based resolution, which works fine without real metadata. `reflect-metadata` is still required though: `@injectable()`'s own implementation calls `Reflect.getMetadata(...)` unconditionally and throws if the polyfill was never loaded.
- **`npm run dev -w apps/web` can bind IPv6-loopback-only (`[::1]:3000`) inside this container's network stack**, invisible unless you check with `ss -tlnp` — the process is genuinely alive and "listening," but VS Code's port forwarding (and `curl`/browsers on the host) connect via IPv4 and just get connection refused, no useful error pointing at the real cause. `server.host: true` in `apps/web/vite.config.ts` fixes it (binds `0.0.0.0`). If a forwarded port silently doesn't load again, check the actual bind address before assuming the process crashed.
- **A `git commit` from the host runs husky's pre-commit hook against the host's `node_modules`**, which is deliberately never `npm install`ed (see the container-first policy above) — it'll fail with a `Cannot find package` error for anything only installed in the container. Run the commit itself from inside the container too (`docker exec -u node ... git commit ...`) rather than reaching for `--no-verify`.

## Other things worth knowing

- Minimal third-party libs on purpose (explicit project goal) — don't add a new dependency (state lib, UI kit, router, etc.) without a concrete need in front of you; note it as a TODO instead if it's speculative.
- Security posture is deliberate, not default: sandboxed preload + CSP (desktop via main process, web via nginx). See [CONTRIBUTING.md](CONTRIBUTING.md) section 10 before touching either.
- Deploy workflows are manual (`workflow_dispatch`) by convention — don't add push-triggered deploys without asking.
