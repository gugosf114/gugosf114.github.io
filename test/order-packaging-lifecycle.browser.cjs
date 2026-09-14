const assert = require("node:assert/strict"),
  pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const b = await pw.chromium.connectOverCDP(process.env.CDP_URL),
    p = await b.contexts()[0].newPage();
  await p.setViewportSize({ width: 1440, height: 1000 });
  try {
    await p.route("**/cookie-packaging.mp4", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await r.continue().catch(() => {});
    });
    await p.goto(process.env.STUDIO_URL, { waitUntil: "domcontentloaded" });
    await p.waitForFunction(
      () => window.__mbcPackagingFilm?.state === "loading",
    );
    await p.locator("#browseDesigns").click();
    await p.waitForFunction(() => document.body.dataset.step === "templates");
    await p.waitForTimeout(1700);
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    assert.equal(await p.locator("#packagingFilm").isVisible(), false);
    console.log("Starting a design cancels the loading video.");
    await p.unroute("**/cookie-packaging.mp4");
    await p.addInitScript(() => {
      window.testHidden = true;
      Object.defineProperty(document, "hidden", {
        get: () => window.testHidden,
        configurable: true,
      });
    });
    await p.goto(process.env.STUDIO_URL);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.waitForTimeout(700);
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    await p.evaluate(() => {
      window.testHidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForFunction(() => window.__mbcPackagingFilm.time > 0.5);
    await p.evaluate(() => {
      window.testHidden = true;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const paused = await p
      .locator("#packagingVideo")
      .evaluate((v) => v.currentTime);
    await p.waitForTimeout(400);
    assert.ok(
      Math.abs(
        (await p.locator("#packagingVideo").evaluate((v) => v.currentTime)) -
          paused,
      ) < 0.1,
    );
    await p.evaluate(() => {
      window.testHidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForFunction(
      (t) => window.__mbcPackagingFilm.time > t + 0.2,
      paused,
    );
    console.log(
      "Hidden tabs defer autoplay, pause, and resume without controls.",
    );
  } finally {
    await p.close();
    await b.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1500) || e.message);
  process.exitCode = 1;
});
