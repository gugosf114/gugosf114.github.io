const assert = require("node:assert/strict"),
  path = require("node:path"),
  fs = require("node:fs");
const pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const b = await pw.chromium.connectOverCDP(
    process.env.CDP_URL || "http://127.0.0.1:9224",
  );
  const p = await b.contexts()[0].newPage();
  p.setDefaultTimeout(20000);
  p.on("dialog", (d) => d.accept());
  const errors = [],
    logs = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (["error", "warning"].includes(m.type()))
      logs.push(m.text().slice(0, 220));
  });
  await p.route("**/googletagmanager.com/**", (r) => r.fulfill({ body: "" }));
  const url = process.env.STUDIO_URL || "http://127.0.0.1:8765/buy-now.html",
    out = path.join(require("node:os").tmpdir(), "mbc-packaging-film");
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
    await p.waitForFunction(
      () => window.__mbcPackagingFilm?.state === "playing",
      null,
      { timeout: 45000 },
    );
    for (const [name, time] of [
      ["01-cookie", 0],
      ["02-closeup", 2.6],
      ["03-wrapped", 5.5],
      ["04-pack", 9.8],
      ["05-box", 11.8],
      ["06-turn", 13.7],
      ["07-finish", 16],
    ]) {
      await p.evaluate((t) => window.__mbcPackagingFilm.seek(t), time);
      await shot(name);
      console.log(
        name,
        await p.evaluate(() => ({
          time: window.__mbcPackagingFilm.time,
          state: window.__mbcPackagingFilm.state,
          stats: window.__mbcPackagingFilm.stats,
        })),
      );
    }
    assert.equal(
      await p.evaluate(() => window.__mbcPackagingFilm.state),
      "ended",
    );
    assert.equal(
      await p.locator("#packagingScene").getAttribute("data-cookie-count"),
      "12",
    );
    await p.locator("#packagingPlay").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "ended",
      null,
      { timeout: 26000 },
    );
    const playback = await p.evaluate(() => window.__mbcPackagingFilm.stats);
    console.log("Full playback:", playback);
    assert.ok(
      playback.framesRendered > 100,
      "full playback renders a moving sequence",
    );
    await p.evaluate(() => window.__mbcPackagingFilm.seek(8));
    assert.equal(
      await p.evaluate(() => window.__mbcPackagingFilm.state),
      "paused",
    );
    await p.locator("#packagingPlay").click();
    await p.waitForFunction(() => window.__mbcPackagingFilm.time > 8.1);
    assert.ok(
      (await p.evaluate(() => window.__mbcPackagingFilm.time)) < 10,
      "Play resumes at the scrubbed position",
    );
    await p.evaluate(() => window.__mbcPackagingFilm.seek(16));
    await p.locator("#packagingPlay").click();
    await p.waitForFunction(() => window.__mbcPackagingFilm.time > 0);
    await p.locator("#browseDesigns").click();
    await p.waitForFunction(() => document.body.dataset.step === "templates");
    assert.equal(await p.locator("#packagingFilm").isVisible(), false);
    assert.equal(
      await p.locator(".packaging-webgl").count(),
      0,
      "editor handoff releases WebGL",
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.waitForTimeout(900);
    assert.equal(
      await p.locator(".packaging-webgl").count(),
      0,
      "reduced motion does not load a 3D scene",
    );
    assert.equal(await p.locator("#packagingFilm").isVisible(), false);
    await p.locator("#packagingLaunch").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "playing",
    );
    await p.locator("#packagingSkip").click();
    assert.equal(await p.locator(".packaging-webgl").count(), 0);
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcPackagingFilm);
    await p.waitForTimeout(900);
    assert.equal(await p.locator("#packagingFilm").isVisible(), false);
    await p.locator("#packagingLaunch").click();
    await p.waitForFunction(
      () => window.__mbcPackagingFilm.state === "playing",
    );
    await p.evaluate(() => window.__mbcPackagingFilm.seek(16));
    await shot("08-mobile");
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await p.locator("#packagingSkip").click();
    const fallback = await b.contexts()[0].newPage();
    await fallback.emulateMedia({ reducedMotion: "reduce" });
    await fallback.route("**/order-packaging-scene.mjs", (r) => r.abort());
    await fallback.goto(url);
    await fallback.waitForFunction(() => !!window.__mbcPackagingFilm);
    await fallback.locator("#packagingLaunch").click();
    await fallback.waitForFunction(
      () => window.__mbcPackagingFilm.state === "unavailable",
    );
    assert.equal(await fallback.locator("#packagingFilm").isVisible(), false);
    await fallback.locator("#browseDesigns").click();
    await fallback.waitForFunction(
      () => document.body.dataset.step === "templates",
    );
    await fallback.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(logs, []);
    console.log(JSON.stringify({ passed: true, screenshots: out, logs }));
  } catch (e) {
    console.error("Browser logs:", logs);
    console.error("Page errors:", errors);
    await shot("failure").catch(() => {});
    throw e;
  } finally {
    await p.close({ runBeforeUnload: false });
    await b.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1800) || e.message);
  process.exitCode = 1;
});
