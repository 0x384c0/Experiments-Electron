# Experiments Electron

Electron + web app: one shared codebase, two build targets.

## Structure

```
apps/desktop      - Electron shell: electron-vite (main, preload), renders the shared app
apps/web          - browser shell: plain Vite, renders the same shared app
packages/shared   - the actual app, feature-sliced (app/features/shared). Both shells are thin wrappers around this.
```

## Stack

React, react-router, Redux Toolkit, tsyringe (DI), MUI, TypeScript, Vite/electron-vite, Vitest, Playwright, electron-builder, npm workspaces.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, adding a feature, UI/design conventions, validating, tests, build, package, and deploy.
