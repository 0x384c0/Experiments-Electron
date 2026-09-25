# Experiments Electron

Electron + web app: one shared codebase, two build targets.

## Structure

```
apps/desktop      - Electron shell: electron-vite (main, preload), renders the shared screen
apps/web          - browser shell: plain Vite, renders the same shared screen
packages/shared   - the actual screen (App.tsx), theme, store. Both shells are thin wrappers around this.
```

## Stack

React, MUI, TypeScript, Vite/electron-vite, Vitest, Playwright, electron-builder, npm workspaces.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, adding a feature, UI/design conventions, validating, tests, build, package, and deploy.
