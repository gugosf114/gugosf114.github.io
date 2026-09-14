// Run against the local preview. Connects to an existing CDP Chrome; never launches one.
// PLAYWRIGHT_MODULE=/path/to/playwright-core CDP_URL=http://127.0.0.1:9224 node test/order-studio.browser.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const BASE = process.env.STUDIO_URL || "http://127.0.0.1:8765/buy-now.html";
const OUT =
  process.env.STUDIO_SHOTS ||
  path.join(require("node:os").tmpdir(), "mbc-studio-checks");
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await pw.chromium.connectOverCDP(
    process.env.CDP_URL || "http://127.0.0.1:9224",
  );
  const context = browser.contexts()[0],
    page = await context.newPage(),
    errors = [],
    calls = [];
  page.setDefaultTimeout(15000);
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("Page error: " + e.message);
  });
  page.on("console", (message) => {
    if (message.type() === "error") console.error("Browser: " + message.text());
  });
  page.on("dialog", (d) => d.accept());
  await page.route("**/googletagmanager.com/**", (r) =>
    r.fulfill({ body: "" }),
  );
  await page.route("https://www.paypal.com/sdk/**", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: `window.paypal={Buttons(config){window.paypalTest=config;return{render(){document.getElementById('paypal-button-container').innerHTML='<button id="testPayment" type="button">Test payment</button>';document.getElementById('testPayment').onclick=async()=>{await config.onClick({}, {resolve(){},reject(){throw new Error('Payment rejected')}});let id=await config.createOrder();await config.onApprove({orderID:id});};}}}};`,
    }),
  );
  await page.route("https://challenges.cloudflare.com/**", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: `window.turnstile={render(node,config){window.turnstileTest=config;config.callback('test-token');return 'test';},reset(){window.turnstileTest.callback('test-token');}};window.mbcTurnstileLoaded?.();`,
    }),
  );
  await page.route(
    "https://mbc-order-backend.summer-lake-b6ea.workers.dev/**",
    (r) => {
      const request = r.request(),
        url = new URL(request.url());
      calls.push({
        path: url.pathname,
        method: request.method(),
        body: request.postData(),
      });
      let json = { uploaded: true };
      if (url.pathname === "/v1/designs")
        json = { id: "TEST-ONLY", token: "test" };
      if (url.pathname === "/v1/paypal/orders") json = { id: "PAYPAL-TEST" };
      if (url.pathname.endsWith("/capture"))
        json = { paid: true, orderId: "TEST-ONLY" };
      return r.fulfill({ json });
    },
  );
  const step = async (name) => {
    await page.waitForFunction((n) => document.body.dataset.step === n, name);
  };
  const next = () => page.locator("#continueButton").click();
  const shot = async (name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(OUT, name + ".png"),
      fullPage: true,
    });
  };
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(BASE);
    await page.waitForFunction(() => !!window.__mbcDesignStudio);
    await shot("01-desktop-upload");
    await page.locator("#logoUpload").setInputFiles({
      name: "not-a-photo.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("test"),
    });
    await step("upload");
    assert.match(await page.locator("#studioError").innerText(), /JPG/);
    await page
      .locator("#logoUpload")
      .setInputFiles(path.join(__dirname, "../images/yana-about.webp"));
    await step("shape");
    assert.equal(
      await page.locator("#zoom").isVisible(),
      true,
      "zoom is available while choosing the cookie shape",
    );
    const initialShape = await page
      .locator("#cookiePreview")
      .evaluate((c) => c.toDataURL());
    await page.locator("#zoom").fill("175");
    await page.locator("#zoom").dispatchEvent("input");
    assert.ok(
      (await page.locator("#cookiePreview").evaluate((c) => c.toDataURL())) !==
        initialShape,
      "shape-screen zoom changes the print",
    );
    const roundChoice = await page
      .locator("#roundOption")
      .evaluate((c) => c.toDataURL());
    const cropBox = await page.locator("#cookiePreview").boundingBox();
    const zoomedShape = await page
      .locator("#cookiePreview")
      .evaluate((c) => c.toDataURL());
    await page.mouse.move(
      cropBox.x + cropBox.width / 2,
      cropBox.y + cropBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      cropBox.x + cropBox.width / 2 + 36,
      cropBox.y + cropBox.height / 2 - 24,
      { steps: 5 },
    );
    await page.mouse.up();
    const movedShape = await page
      .locator("#cookiePreview")
      .evaluate((c) => c.toDataURL());
    assert.ok(
      movedShape !== zoomedShape,
      "dragging on the shape screen repositions the photo",
    );
    assert.ok(
      (await page.locator("#roundOption").evaluate((c) => c.toDataURL())) !==
        roundChoice,
      "shape choices reflect the adjusted crop",
    );
    await page.locator("#cookiePreview").focus();
    await page.keyboard.press("ArrowRight");
    assert.ok(
      (await page.locator("#cookiePreview").evaluate((c) => c.toDataURL())) !==
        movedShape,
      "keyboard positioning works on the shape screen",
    );
    assert.equal(
      await page.locator("[data-shape=round]").getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("[data-shape=square]").click();
    const squareCrop = await page
      .locator("#cookiePreview")
      .evaluate((c) => c.toDataURL());
    await page.locator("[data-shape=round]").click();
    await page.locator("[data-shape=square]").click();
    assert.ok(
      (await page.locator("#cookiePreview").evaluate((c) => c.toDataURL())) ===
        squareCrop,
      "changing shape preserves zoom and position",
    );
    await next();
    await step("background");
    assert.equal(await page.locator("#continueButton").isDisabled(), true);
    await page.locator("#keepBackground").click();
    await next();
    await step("finish");
    assert.equal(await page.locator("#zoom").inputValue(), "175");
    assert.ok(
      (await page.locator("#cookiePreview").evaluate((c) => c.toDataURL())) ===
        squareCrop,
      "keeping the photo preserves the shape-screen crop",
    );
    await page.locator("#zoom").fill("150");
    await page.locator("#zoom").dispatchEvent("input");
    await page.locator("#cookiePreview").focus();
    await page.keyboard.press("ArrowLeft");
    await page.locator("#originalChip").click();
    assert.equal(await page.locator("#photoEditor").isVisible(), true);
    await page.locator("#originalChip").click();
    // Erase, restore and undo must change the actual image, not just the controls.
    await page.locator("[data-tool=erase]").click();
    const before = await page
      .locator("#editorCanvas")
      .evaluate((c) => c.toDataURL());
    const beforePixel = await page
      .locator("#editorCanvas")
      .evaluate((c) =>
        Array.from(
          c
            .getContext("2d")
            .getImageData(
              Math.floor(c.width * 0.65),
              Math.floor(c.height * 0.4),
              1,
              1,
            ).data,
        ),
      );
    const box = await page.locator("#editorCanvas").boundingBox();
    await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.4);
    const erased = await page
      .locator("#editorCanvas")
      .evaluate((c) => c.toDataURL());
    assert.ok(erased !== before, "erase changes pixels");
    await page.locator("#undoEdit").click();
    const undone = await page
      .locator("#editorCanvas")
      .evaluate((c) => c.toDataURL());
    assert.ok(undone === before, "undo restores the complete source");
    await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.4);
    await page.locator("[data-tool=restore]").click();
    await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.4);
    const restoredPixel = await page
      .locator("#editorCanvas")
      .evaluate((c) =>
        Array.from(
          c
            .getContext("2d")
            .getImageData(
              Math.floor(c.width * 0.65),
              Math.floor(c.height * 0.4),
              1,
              1,
            ).data,
        ),
      );
    assert.deepEqual(
      restoredPixel,
      beforePixel,
      "restore brings back the original pixel",
    );
    await page.locator("#doneEdges").click();
    await shot("02-desktop-finish");
    await next();
    await step("review");
    await shot("03-desktop-review");
    await next();
    await step("delivery");
    assert.equal(
      await page.evaluate(() => window.__mbcDesignStudio.getDesigns()[0].shape),
      "square",
    );
    assert.equal(
      await page.evaluate(
        () => window.__mbcDesignStudio.getDesigns()[0].artworkBlob.size > 1000,
      ),
      true,
    );
    await page.locator("#backButton").click();
    await page.locator("#editDesign").click();
    await page.locator("#zoom").fill("170");
    await page.locator("#zoom").dispatchEvent("input");
    assert.equal(
      await page.evaluate(() => window.__mbcDesignStudio.getDesigns()[0]),
      null,
      "editing revokes approval",
    );
    await next();
    await next();
    await step("delivery");
    await page.locator("#shippingZip").fill("94107");
    assert.equal(await page.locator("#continueButton").isEnabled(), true);
    assert.equal(
      await page.evaluate(() => window.__mbcOrderPricing.getState().total),
      75,
    );
    await page.locator("#shippingZip").fill("00000");
    assert.equal(await page.locator("#continueButton").isDisabled(), true);
    assert.equal(await page.locator("#manualQuote").isVisible(), true);
    await page.locator("input[name=fulfil][value=pickup]").check();
    await next();
    await step("pay");
    await page.locator("#testPayment").waitFor();
    await shot("04-desktop-pay");
    // Back preserves the same approved print, then another design raises the minimum.
    await page.locator("#backButton").click();
    await page.locator("#backButton").click();
    await step("review");
    const fileChooser = page.waitForEvent("filechooser");
    await page.locator("#addDesign").click();
    await (
      await fileChooser
    ).setFiles(path.join(__dirname, "../images/yana-about.webp"));
    await step("shape");
    await next();
    await page.locator("#keepBackground").click();
    await next();
    await next();
    await next();
    await step("delivery");
    assert.equal(await page.locator("#cookieQty").inputValue(), "24");
    await page.locator("#cookieQty").fill("12");
    await page.locator("#cookieQty").dispatchEvent("change");
    assert.equal(await page.locator("#cookieQty").inputValue(), "24");
    assert.deepEqual(
      await page.evaluate(() =>
        window.__mbcDesignStudio.getDesigns().map((d) => d.quantity),
      ),
      [12, 12],
    );
    await page.locator("#cookieQty").fill("25");
    await page.locator("#cookieQty").dispatchEvent("change");
    assert.deepEqual(
      await page.evaluate(() =>
        window.__mbcDesignStudio.getDesigns().map((d) => d.quantity),
      ),
      [13, 12],
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await shot("05-mobile-delivery");
    for (const size of [
      { width: 320, height: 740 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ]) {
      await page.setViewportSize(size);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        "no horizontal overflow at " + size.width,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await next();
    await step("pay");
    await shot("06-mobile-pay");
    await page.locator("#testPayment").click();
    await step("complete");
    assert.equal(
      calls.filter((c) => c.method === "PUT").length,
      6,
      "both designs upload all three files",
    );
    const finalized = calls.findIndex((c) => c.path.endsWith("/finalize")),
      create = calls.findIndex((c) => c.path === "/v1/paypal/orders");
    assert.ok(finalized < create);
    assert.match(await page.locator("#confirmation").innerText(), /TEST-ONLY/);
    assert.equal(await page.locator("#continueButton").isVisible(), false);
    await shot("07-mobile-complete");
    await page.goto(BASE);
    await shot("08-mobile-upload");
    await page
      .locator("#logoUpload")
      .setInputFiles(path.join(__dirname, "../images/yana-about.webp"));
    await step("shape");
    await shot("09-mobile-shape");
    await next();
    await page.locator("#keepBackground").click();
    await next();
    await shot("10-mobile-finish");
    const previewBox = await page.locator("#cookiePreview").boundingBox();
    const stageBox = await page.locator("#previewStage").boundingBox();
    assert.ok(
      previewBox.y >= stageBox.y &&
        previewBox.y + previewBox.height <= stageBox.y + stageBox.height,
      "the complete cookie stays inside the mobile preview",
    );
    const sliderBox = await page.locator("#zoom").boundingBox();
    const footerBox = await page.locator(".studio-footer").boundingBox();
    assert.ok(
      sliderBox.y + sliderBox.height < footerBox.y,
      "mobile crop controls remain above Continue",
    );
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          passed: true,
          checks: [
            "upload validation",
            "shape selection",
            "background gate",
            "crop and keyboard position",
            "erase/restore/undo pixels",
            "approval invalidation",
            "shipping and pickup",
            "multi-photo minimum",
            "320/390/768/1440/1920 layouts",
            "six uploads before payment",
            "mocked capture confirmation",
          ],
          screenshots: OUT,
          realPayments: 0,
        },
        null,
        2,
      ),
    );
  } finally {
    await page.close({ runBeforeUnload: false });
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack?.slice(0, 1800) || error.message);
  process.exitCode = 1;
});
