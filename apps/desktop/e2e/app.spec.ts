import { test, expect, _electron as electron } from "@playwright/test";

// run `npm run build` first, this launches the built app from out/
// checks the app shell only (no weather API key in CI, so no real data to assert on)
test("home shell renders with the weather tab", async () => {
  const app = await electron.launch({ args: ["."] });
  const window = await app.firstWindow();
  await expect(window.getByRole("tab", { name: "Weather" })).toBeVisible();
  await app.close();
});
