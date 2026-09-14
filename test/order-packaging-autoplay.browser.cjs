const assert = require("node:assert/strict"),
  pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const b = await pw.chromium.connectOverCDP(process.env.CDP_URL),
    p = await b.contexts()[0].newPage();
  try {
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto(process.env.STUDIO_URL);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.waitForTimeout(1600);
    assert.ok(
      (await p.locator("#packagingVideo").evaluate((v) => v.currentTime)) > 0,
      "mobile introduction must autoplay without a click",
    );
    assert.equal(
      await p
        .locator(
          "#packagingLaunch,#packagingWatch,#packagingPlay,#packagingSkip,#packagingSeek",
        )
        .count(),
      0,
      "no playback controls in the order flow",
    );
    console.log("Mobile autoplay and absent controls verified.");
  } finally {
    await p.close();
    await b.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
