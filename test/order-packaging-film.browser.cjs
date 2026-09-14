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
    out = path.join(require("node:os").tmpdir(), "mbc-native-film");
  fs.mkdirSync(out, { recursive: true });
  const shot = (n) =>
    p.screenshot({
      path: path.join(out, n + ".png"),
      fullPage: true,
      animations: "disabled",
    });
  const seek = async (t) =>
    p.evaluate(
      (t) =>
        new Promise((resolve) => {
          const v = document.getElementById("packagingVideo");
          v.addEventListener("seeked", resolve, { once: true });
          window.__mbcPackagingFilm.seek(t);
          if (!v.seeking) resolve();
        }),
      t,
    );
  try {
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto(url);
    await p.waitForFunction(
      () => window.__mbcPackagingFilm?.state === "playing",
    );
    await p.waitForFunction(() => window.__mbcPackagingFilm.time > 0.4);
    const info = await p.locator("#packagingVideo").evaluate((v) => ({
      duration: v.duration,
      width: v.videoWidth,
      height: v.videoHeight,
    }));
    assert.equal(info.duration, 16);
    assert.equal(info.width, 1080);
    assert.equal(info.height, 1080);
    assert.equal(
      requests.some((x) => x.includes("/vendor/three/")),
      false,
      "video playback never loads WebGL",
    );
    for (const [n, t] of [
      ["01-cookie", 1],
      ["02-wrapped", 5.5],
      ["03-box", 11.8],
      ["04-end", 16],
    ]) {
      await seek(t);
      await shot(n);
    }
    console.log(
      "End seek state",
      await p
        .locator("#packagingVideo")
        .evaluate((v) => ({
          time: v.currentTime,
          duration: v.duration,
          paused: v.paused,
          ended: v.ended,
          state: window.__mbcPackagingFilm.state,
        })),
    );
    assert.equal(
      await p.evaluate(() => window.__mbcPackagingFilm.state),
      "ended",
    );
    await p.locator("#packagingPlay").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "ended",
      null,
      { timeout: 24000 },
    );
    console.log(
      "Native playback:",
      await p.evaluate(() => window.__mbcPackagingFilm.stats),
    );
    await seek(8);
    await p.locator("#packagingPlay").click();
    await p.waitForFunction(() => window.__mbcPackagingFilm.time > 8.1);
    assert.ok((await p.evaluate(() => window.__mbcPackagingFilm.time)) < 10);
    await p.locator("#browseDesigns").click();
    await p.waitForFunction(() => document.body.dataset.step === "templates");
    assert.equal(await p.locator("#packagingFilm").isVisible(), false);
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.waitForTimeout(900);
    assert.equal(await p.locator("#packagingVideo").getAttribute("src"), null);
    assert.equal(await p.locator("#packagingWatch").isVisible(), true);
    await shot("05-obvious-play");
    await p.locator("#packagingWatch").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "playing",
    );
    await p.locator("#packagingSkip").click();
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.locator("#packagingLaunch").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "playing",
    );
    await seek(11.8);
    await shot("06-mobile");
    await p.locator("#packagingSkip").click();
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    const fail = await b.contexts()[0].newPage();
    await fail.setViewportSize({ width: 1440, height: 1000 });
    await fail.emulateMedia({ reducedMotion: "reduce" });
    await fail.route("**/cookie-packaging.mp4", (r) => r.abort());
    await fail.goto(url);
    await fail.waitForFunction(() => !!window.__mbcPackagingFilm);
    await fail.locator("#packagingWatch").click();
    await fail.locator("#packagingError").waitFor();
    assert.equal(
      await fail.locator("#packagingError a").getAttribute("href"),
      "media/packaging-preview.html",
    );
    await fail.locator("#browseDesigns").click();
    await fail.waitForFunction(
      () => document.body.dataset.step === "templates",
    );
    await fail.close();
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        format: "H.264 MP4",
        seconds: 16,
        dimensions: "1080x1080",
        screenshots: out,
      }),
    );
  } catch (e) {
    await shot("failure").catch(() => {});
    console.log("Errors", errors);
    throw e;
  } finally {
    await p.close({ runBeforeUnload: false });
    await b.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1800) || e.message);
  process.exitCode = 1;
});
