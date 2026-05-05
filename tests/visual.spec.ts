import { test, expect } from "@playwright/test";

test("demo renders three cases (image / video / canvas)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });

  // Force lib's reduced-motion path: each element renders exactly one frame.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo/index.html?test=1");

  // Wait for the test-mode hook to flag all three sources rendered.
  await page.waitForFunction(
    () => (window as unknown as { __asciiTestReady?: Promise<boolean> }).__asciiTestReady,
    null,
    { timeout: 10_000 },
  );
  await page.evaluate(
    () => (window as unknown as { __asciiTestReady: Promise<boolean> }).__asciiTestReady,
  );

  // Each <ascii-canvas> must have an output canvas with non-empty image data.
  const cases = ["case-image", "case-video", "case-canvas"] as const;
  for (const id of cases) {
    const hasContent = await page.evaluate((elId) => {
      const el = document.getElementById(elId)!;
      const canvas = el.shadowRoot!.querySelector("canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const { width, height } = canvas;
      if (width === 0 || height === 0) return false;
      const data = ctx.getImageData(0, 0, width, height).data;
      // Non-empty: at least one alpha > 0 means we drew text on it.
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }
      return false;
    }, id);
    expect(hasContent, `${id} should have rendered content`).toBe(true);
  }

  // Whole page screenshot for visual regression. First run produces baseline.
  await expect(page).toHaveScreenshot("demo.png", {
    maxDiffPixelRatio: 0.02,
    animations: "disabled",
  });

  expect(errors, "no page or console errors").toEqual([]);
});
