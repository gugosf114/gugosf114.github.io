const assert = require("node:assert/strict"),
  path = require("node:path"),
  fs = require("node:fs"),
  pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const b = await pw.chromium.connectOverCDP(process.env.CDP_URL),
    p = await b.contexts()[0].newPage();
  p.setDefaultTimeout(20000);
  p.on("dialog", (d) => d.accept());
  const errors = [],
    requests = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("request", (r) => requests.push(r.url()));
  await p.route("**/googletagmanager.com/**", (r) => r.fulfill({ body: "" }));
  const url = process.env.STUDIO_URL,
    out = path.join(require("node:os").tmpdir(), "mbc-autoplay-film");
  fs.mkdirSync(out, { recursive: true });
  const shot = (n) =>
    p.screenshot({
      path: path.join(out, n + ".png"),
      fullPage: true,
      animations: "disabled",
    });
  try {
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto(url);
    await p.waitForFunction(() => window.__mbcPackagingFilm?.time > 0.5);
    assert.equal(
      await p
        .locator(
          "#packagingLaunch,#packagingWatch,#packagingPlay,#packagingSkip,#packagingSeek,.packaging-controls",
        )
        .count(),
      0,
    );
    const info = await p
      .locator("#packagingVideo")
      .evaluate((v) => ({
        duration: v.duration,
        width: v.videoWidth,
        controls: v.controls,
        muted: v.muted,
        loop: v.loop,
      }));
    assert.equal(info.duration, 16);
    assert.equal(info.width, 1080);
    assert.equal(info.controls, false);
    assert.equal(info.muted, true);
    assert.equal(info.loop, false);
    assert.equal(
      requests.some((x) => x.includes("/vendor/three/")),
      false,
    );
    await shot("01-desktop-autoplay");
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "ended",
      null,
      { timeout: 23000 },
    );
    await p.waitForTimeout(700);
    assert.ok(
      (await p.locator("#packagingVideo").evaluate((v) => v.currentTime)) >
        15.9,
    );
    await shot("02-final-frame");
    console.log(
      "Full autoplay:",
      await p.evaluate(() => window.__mbcPackagingFilm.stats),
    );
    await p.locator("#browseDesigns").click();
    await p.waitForFunction(() => document.body.dataset.step === "templates");
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    await p.locator("#backButton").click();
    await p.waitForFunction(() => document.body.dataset.step === "upload");
    await p.waitForTimeout(500);
    assert.equal(
      await p.locator("#packagingFilm").isVisible(),
      false,
      "returning to Start does not replay",
    );
    await p.setViewportSize({ width: 390, height: 844 });
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.goto(url);
    await p.waitForFunction(() => window.__mbcPackagingFilm.time > 0.5);
    assert.equal(await p.locator("#packagingFilm").isVisible(), true);
    await shot("03-mobile-autoplay");
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await p.locator("#makeOwn").click();
    await p.waitForFunction(() => document.body.dataset.step === "personalize");
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    const fail = await b.contexts()[0].newPage();
    await fail.setViewportSize({ width: 1440, height: 1000 });
    await fail.route("**/cookie-packaging.mp4", (r) => r.abort());
    await fail.goto(url);
    await fail.waitForFunction(
      () => window.__mbcPackagingFilm?.state === "unavailable",
    );
    assert.equal(await fail.locator("#packagingFilm").isVisible(), false);
    await fail.locator("#browseDesigns").click();
    await fail.waitForFunction(
      () => document.body.dataset.step === "templates",
    );
    await fail.close();
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        checks: [
          "desktop autoplay without controls",
          "full silent playback",
          "last frame holds",
          "no replay on return",
          "mobile autoplay",
          "editor handoff",
          "failed video leaves ordering usable",
        ],
        screenshots: out,
      }),
    );
  } finally {
    await p.close({ runBeforeUnload: false });
    await b.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1800) || e.message);
  process.exitCode = 1;
});
