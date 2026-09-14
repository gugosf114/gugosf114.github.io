const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const real = process.env.REAL_CUT === "1";
(async () => {
  const browser = await pw.chromium.connectOverCDP(
    process.env.CDP_URL || "http://127.0.0.1:9224",
  );
  const page = await browser.contexts()[0].newPage();
  page.setDefaultTimeout(15000);
  page.on("dialog", (d) => d.accept());
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/googletagmanager.com/**", (r) =>
    r.fulfill({ body: "" }),
  );
  if (!real)
    await page.route("**/order-studio-cutout.mjs", (r) =>
      r.fulfill({
        contentType: "text/javascript",
        body: `
 export async function cutSubject(source,point,progress,removals=[]){
   window.cutCalls=window.cutCalls||[];window.cutCalls.push({point,removals});
   if(window.failNextCut){window.failNextCut=false;throw new Error('Test cutout connection failed. Try again.');}
   const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const ctx=c.getContext('2d');ctx.drawImage(source,0,0);
   ctx.clearRect(0,0,c.width*.45,c.height);ctx.globalCompositeOperation='destination-out';
   for(const p of removals){ctx.beginPath();ctx.arc(p.x*c.width,p.y*c.height,c.width*.07,0,Math.PI*2);ctx.fill();}
   progress(100);return c;
 }`,
      }),
    );
  const step = (n) =>
    page.waitForFunction((n) => document.body.dataset.step === n, n);
  const image = () =>
    page.locator("#cookiePreview").evaluate((c) => c.toDataURL());
  const shots = path.join(require("node:os").tmpdir(), "mbc-background-checks");
  fs.mkdirSync(shots, { recursive: true });
  const shot = (n) =>
    page.screenshot({
      path: path.join(shots, (real ? "real-" : "mock-") + n + ".png"),
      fullPage: true,
    });
  const tapSource = async (x, y) => {
    const box = await page.locator("#cookiePreview").boundingBox();
    // Square source, 125% zoom and one 1% keyboard move right, unchanged throughout.
    await page.mouse.click(
      box.x + box.width * (0.094 + 0.812 * (-0.115 + x * 1.25)),
      box.y + box.height * (0.089 + 0.812 * (-0.125 + y * 1.25)),
    );
  };
  const awaitCut = async () => {
    await page.waitForFunction(
      () => document.getElementById("busyOverlay").hidden,
      null,
      { timeout: 120000 },
    );
    assert.equal(
      await page.locator("#studioError").isVisible(),
      false,
      await page.locator("#studioError").textContent(),
    );
    await page.locator("#cleanSpot").waitFor();
  };
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(
      process.env.STUDIO_URL || "http://127.0.0.1:8765/buy-now.html",
    );
    await page.waitForFunction(() => !!window.__mbcDesignStudio);
    await page
      .locator("#logoUpload")
      .setInputFiles(path.join(__dirname, "../images/yana-about.webp"));
    await step("shape");
    await page.locator("[data-shape=square]").click();
    await page.locator("#zoom").fill("125");
    await page.locator("#zoom").dispatchEvent("input");
    await page.locator("#cookiePreview").focus();
    await page.keyboard.press("ArrowRight");
    const original = await image();
    await page.locator("#continueButton").click();
    await step("background");
    await page.locator("#keepBackground").click();
    await step("review");
    assert.ok(
      (await image()) === original,
      "keep goes straight to review without changing the crop",
    );
    await page.locator("#backButton").click();
    await step("background");
    await page.locator("#removeBackground").click();
    assert.equal(
      await page.locator("#stepTitle").textContent(),
      "Tap what you want to keep.",
    );
    assert.equal(await page.locator("#cookiePreview").isVisible(), true);
    assert.equal(await page.locator("#photoEditor").isVisible(), false);
    assert.equal(await page.locator("#continueButton").isDisabled(), true);
    await shot("choose-subject");
    if (!real) {
      await page.evaluate(() => (window.failNextCut = true));
      await tapSource(0.65, 0.4);
      await page.waitForFunction(
        () => document.getElementById("busyOverlay").hidden,
      );
      assert.equal(await page.locator("#studioError").isVisible(), true);
      assert.equal(await page.locator("#continueButton").isDisabled(), true);
    }
    const started = Date.now();
    await tapSource(0.65, 0.4);
    await awaitCut();
    const first = await image();
    assert.ok(first !== original, "the cut changes the actual print");
    assert.equal(await page.locator("#zoom").inputValue(), "125");
    await shot("first-cut");
    await page.locator("#cleanSpot").click();
    assert.equal(
      await page.locator("#stepTitle").textContent(),
      "Tap what you want removed.",
    );
    await page.locator("#cancelSelection").click();
    assert.ok(
      (await image()) === first,
      "canceling cleanup keeps the existing cut",
    );
    await page.locator("#cleanSpot").click();
    await tapSource(0.78, 0.62);
    await awaitCut();
    const cleaned = await image();
    assert.ok(cleaned !== first, "negative tap removes a visible area");
    await shot("cleanup");
    if (!real) {
      await page.locator("#cleanSpot").click();
      await tapSource(0.76, 0.74);
      await awaitCut();
      const calls = await page.evaluate(() => window.cutCalls);
      assert.equal(calls.at(-1).removals.length, 2);
      assert.ok(Math.abs(calls.at(-1).point.x - 0.65) < 0.003);
      assert.ok(Math.abs(calls.at(-1).point.y - 0.4) < 0.003);
      await page.locator("#undoCut").click();
      assert.ok(
        (await image()) === cleaned,
        "undo removes only the latest cleanup",
      );
    }
    await page.locator("#undoCut").click();
    assert.ok(
      (await image()) === first,
      "undo restores the previous cut exactly",
    );
    await page.locator("#undoCut").click();
    assert.ok(
      (await image()) === original,
      "undo first cut restores the original crop",
    );
    await page.locator("#removeBackground").click();
    await tapSource(0.65, 0.4);
    await awaitCut();
    await page.setViewportSize({ width: 390, height: 844 });
    await shot("mobile-result");
    await page.locator("#continueButton").click();
    await step("review");
    assert.equal(await page.locator("#zoom").isVisible(), true);
    await page.locator("#zoom").fill("145");
    await page.locator("#zoom").dispatchEvent("input");
    await shot("mobile-review");
    await page.locator("#continueButton").click();
    await step("delivery");
    const saved = await page.evaluate(() => {
      const d = window.__mbcDesignStudio.getDesigns()[0];
      return {
        background: d.background,
        shape: d.shape,
        bytes: d.artworkBlob.size,
      };
    });
    assert.equal(saved.background, "cut");
    assert.equal(saved.shape, "square");
    assert.ok(saved.bytes > 1000);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        model: real ? "real MediaPipe" : "controlled mask",
        elapsedSeconds: Math.round((Date.now() - started) / 1000),
        checks: [
          "keep skips correction",
          "tap on framed cookie",
          "crop preserved",
          "explicit keep/remove modes",
          "cleanup changes pixels",
          "exact undo",
          "mobile controls",
          "approved artwork saved",
        ],
        screenshots: shots,
      }),
    );
  } catch (e) {
    await shot("failure").catch(() => {});
    console.error(
      "Current UI:",
      (await page.locator("body").innerText()).slice(0, 2200),
    );
    throw e;
  } finally {
    await page.close({ runBeforeUnload: false });
    await browser.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1600) || e.message);
  process.exitCode = 1;
});
