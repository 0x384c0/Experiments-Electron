import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import boundaries from "eslint-plugin-boundaries";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/out/**", "**/release/**", "**/node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs["recommended-latest"].rules,
      ...reactRefresh.configs.vite.rules,
      ...jsxA11y.configs.recommended.rules,
    },
  },
  {
    // enforces the point of packages/shared/src/features/* -- a feature can use
    // its own files and `shared`, never another feature's internals or `app`
    // (app composes features, not the other way around). Add a feature and
    // remove it without hunting for who secretly depends on it.
    files: ["packages/shared/src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      // without this, boundaries can't resolve extensionless TS imports at all
      // and silently treats every dependency as unknown -- rule never fires.
      "import/resolver": { typescript: true },
      "boundaries/elements": [
        { type: "app", pattern: "packages/shared/src/app/**" },
        { type: "features", pattern: "packages/shared/src/features/*/**", capture: ["feature"] },
        { type: "shared", pattern: "packages/shared/src/shared/**" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: [
                { to: { element: { type: "features" } } },
                { to: { element: { type: "shared" } } },
              ],
            },
            {
              from: { element: { type: "features" } },
              allow: [
                {
                  to: { element: { type: "features", captured: { feature: "{{from.feature}}" } } },
                },
                { to: { element: { type: "shared" } } },
              ],
            },
            {
              from: { element: { type: "shared" } },
              allow: [],
            },
          ],
        },
      ],
    },
  },
  prettier,
);
