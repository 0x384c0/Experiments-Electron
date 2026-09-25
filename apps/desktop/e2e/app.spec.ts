import { test, expect, _electron as electron } from "@playwright/test";

// run `npm run build` first, this launches the built app from out/
test("window shows hello world", async () => {
  const app = await electron.launch({ args: ["."] });
  const window = await app.firstWindow();
  await expect(window.getByText("Hello World")).toBeVisible();
  await app.close();
});
