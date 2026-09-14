const assert = require("node:assert/strict"),
  pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const b = await pw.chromium.connectOverCDP(
    process.env.CDP_URL || "http://127.0.0.1:9224",
  );
  const url = process.env.STUDIO_URL || "http://127.0.0.1:8765/buy-now.html";
  const p = await b.contexts()[0].newPage();
  await p.setViewportSize({ width: 1440, height: 1000 });
  try {
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.route("**/order-packaging-scene.mjs", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await r.continue();
    });
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.locator("#packagingLaunch").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "loading",
    );
    assert.equal(await p.locator("#packagingSkip").isVisible(), true);
    await p.locator("#packagingSkip").click();
    await p.waitForTimeout(1700);
    assert.equal(await p.locator(".packaging-webgl").count(), 0);
    assert.equal(await p.locator("#packagingFilm").isVisible(), false);
    await p.locator("#browseDesigns").click();
    await p.waitForFunction(() => document.body.dataset.step === "templates");
    console.log(
      "Slow-loading animation cancels without allocating a renderer; editor works.",
    );
    await p.unroute("**/order-packaging-scene.mjs");
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.addInitScript(() => {
      window.testHidden = true;
      Object.defineProperty(document, "hidden", {
        get: () => window.testHidden,
        configurable: true,
      });
    });
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.waitForTimeout(1000);
    assert.equal(await p.locator(".packaging-webgl").count(), 0);
    await p.evaluate(() => {
      window.testHidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "playing",
    );
    await p.locator("#packagingSkip").click();
    console.log("Background-tab autoplay waits until visible.");
  } finally {
    await p.close({ runBeforeUnload: false });
    await b.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1500) || e.message);
  process.exitCode = 1;
});
