const assert = require("node:assert/strict"),
  pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const b = await pw.chromium.connectOverCDP(process.env.CDP_URL),
    p = await b.contexts()[0].newPage();
  await p.setViewportSize({ width: 1440, height: 1000 });
  try {
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.route("**/cookie-packaging.mp4", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await r.continue().catch(() => {});
    });
    await p.goto(process.env.STUDIO_URL);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.locator("#packagingWatch").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "loading",
    );
    assert.equal(await p.locator("#packagingSkip").isVisible(), true);
    await p.locator("#packagingSkip").click();
    await p.waitForTimeout(1700);
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    assert.equal(await p.locator("#packagingFilm").isVisible(), false);
    console.log("Slow video load cancels cleanly.");
    await p.unroute("**/cookie-packaging.mp4");
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.addInitScript(() => {
      window.testHidden = true;
      Object.defineProperty(document, "hidden", {
        get: () => window.testHidden,
        configurable: true,
      });
    });
    await p.goto(process.env.STUDIO_URL);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.waitForTimeout(900);
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    await p.evaluate(() => {
      window.testHidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "playing",
    );
    await p.locator("#packagingSkip").click();
    console.log("Background tab waits before loading and playing video.");
  } finally {
    await p.close();
    await b.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1500) || e.message);
  process.exitCode = 1;
});
