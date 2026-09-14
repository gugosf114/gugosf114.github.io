const assert = require("node:assert/strict"),
  path = require("node:path"),
  fs = require("node:fs");
const pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const b = await pw.chromium.connectOverCDP(
    process.env.CDP_URL || "http://127.0.0.1:9224",
  );
  const p = await b.contexts()[0].newPage();
  p.setDefaultTimeout(15000);
  p.on("dialog", (d) => d.accept());
  const errors = [],
    calls = [],
    aiCalls = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.route("**/googletagmanager.com/**", (r) => r.fulfill({ body: "" }));
  await p.route("https://mbc-chatbot.summer-lake-b6ea.workers.dev/**", (r) => {
    aiCalls.push(r.request().postDataJSON());
    return r.fulfill({
      json: {
        reply:
          '```json\n["Another year, still blooming.","Life is sweeter with you.","Make a wish, garden legend."]\n```',
      },
    });
  });
  await p.route("https://www.paypal.com/sdk/**", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body: `window.paypal={Buttons(config){window.paypalTest=config;return{render(){let btn=document.createElement('button');btn.id='testPayment';btn.textContent='Test payment';document.getElementById('paypal-button-container').append(btn);btn.onclick=async()=>{await config.onClick({}, {resolve(){},reject(){throw new Error('Rejected')}});let id=await config.createOrder();await config.onApprove({orderID:id});};}}}};`,
    }),
  );
  await p.route("https://challenges.cloudflare.com/**", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body: `window.turnstile={render(n,c){window.tsc=c;c.callback('test');return 'test'},reset(){window.tsc.callback('test')}};window.mbcTurnstileLoaded();`,
    }),
  );
  await p.route(
    "https://mbc-order-backend.summer-lake-b6ea.workers.dev/**",
    (r) => {
      const u = new URL(r.request().url()),
        method = r.request().method();
      calls.push({
        path: u.pathname,
        method,
        bytes: r.request().postDataBuffer()?.length || 0,
      });
      let json = { uploaded: true };
      if (u.pathname === "/v1/designs")
        json = { id: "TEMPLATE-TEST", token: "test" };
      if (u.pathname === "/v1/paypal/orders") json = { id: "PAYPAL-TEST" };
      if (u.pathname.endsWith("/capture"))
        json = { paid: true, orderId: "TEMPLATE-TEST" };
      return r.fulfill({ json });
    },
  );
  const url = process.env.STUDIO_URL || "http://127.0.0.1:8765/buy-now.html";
  const out = path.join(require("node:os").tmpdir(), "mbc-design-shop");
  fs.mkdirSync(out, { recursive: true });
  const step = (n) =>
    p.waitForFunction((n) => document.body.dataset.step === n, n);
  const next = () => p.locator("#continueButton").click();
  const art = () => p.locator("#cookiePreview").evaluate((c) => c.toDataURL());
  const shot = (name) =>
    p.screenshot({
      path: path.join(out, name + ".png"),
      fullPage: true,
      animations: "disabled",
    });
  try {
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcDesignStudio);
    await p.locator("#browseDesigns").click();
    await step("templates");
    assert.equal(await p.locator("[data-template]").count(), 9);
    await shot("01-gallery");
    await p.locator("[data-occasion=anniversary]").click();
    assert.equal(await p.locator("[data-template]").count(), 3);
    await p.locator("#catalogTone").selectOption("funny");
    assert.equal(await p.locator("[data-template]").count(), 1);
    await p.locator("[data-template=anniversary-weird]").click();
    await step("personalize");
    assert.equal(
      await p.locator("#designMessage").inputValue(),
      "You’re still\nmy favorite\nweirdo.",
    );
    const before = await art();
    await p.locator("#designPersonalization").fill("George & Jana");
    assert.ok((await art()) !== before, "names change the printed artwork");
    await p.locator("#designMessage").fill("STILL CHOOSING YOU.");
    await p.locator("#designFont").selectOption("classic");
    await p.locator("#designTextColor").fill("#742b4c");
    await p.locator("#designTextColor").dispatchEvent("input");
    await p.locator("[data-text-place=bottom]").click();
    await shot("02-personalize-words");
    await p.locator("#backButton").click();
    await step("upload");
    await p.locator("#resumeDesign").click();
    await step("personalize");
    assert.equal(
      await p.locator("#designPersonalization").inputValue(),
      "George & Jana",
    );
    await p.locator("[data-compose-tab=backdrop]").click();
    await p.locator("[data-backdrop=rainbow]").click();
    const rainbow = await art();
    await p.locator("[data-backdrop=trans]").click();
    assert.ok((await art()) !== rainbow);
    await shot("03-backgrounds");
    await p
      .locator("#backgroundUpload")
      .setInputFiles(path.join(__dirname, "../images/yana-about.webp"));
    await p.waitForFunction(
      () => document.querySelector("#busyOverlay").hidden,
    );
    assert.match(
      await p.locator("#backgroundUploadStatus").textContent(),
      /yana-about/,
    );
    await p.locator("[data-backdrop=flowers]").click();
    await p.locator("[data-compose-tab=words]").click();
    await p.locator("#designMessage").fill("Thank you for showing up.");
    await p.locator("#designPersonalization").fill("From all of us");
    await p.locator("[data-text-place=middle]").click();
    await shot("04-final-design");
    await next();
    await step("review");
    await next();
    await step("delivery");
    const saved = await p.evaluate(() => {
      const d = window.__mbcDesignStudio.getDesigns()[0];
      return {
        file: d.file.name,
        type: d.file.type,
        size: d.file.size,
        art: d.artworkBlob.size,
        background: d.background,
      };
    });
    assert.equal(saved.file, "custom-cookie-design.png");
    assert.equal(saved.type, "image/png");
    assert.ok(saved.size > 1000);
    assert.equal(saved.size, saved.art);
    assert.equal(saved.background, "keep");
    await p.locator("input[name=fulfil][value=pickup]").check();
    await next();
    await step("pay");
    await p.locator("#testPayment").click();
    await step("complete");
    assert.equal(calls.filter((c) => c.method === "PUT").length, 3);
    assert.equal(aiCalls.length, 0, "manual design path never calls AI");
    await p.goto(url);
    await p.waitForFunction(() => !!window.__mbcDesignStudio);
    await p.locator("#makeOwn").click();
    await step("personalize");
    await p.locator("[data-backdrop=rainbow]").click();
    await p.locator("[data-compose-tab=words]").click();
    await p.locator("#designMessage").fill("LOVE IS LOVE.");
    await next();
    await step("review");
    await p.locator("#backButton").click();
    await step("personalize");
    assert.equal(
      await p.locator("#designMessage").inputValue(),
      "LOVE IS LOVE.",
    );
    // Adding and removing a photo must preserve the design's background and words.
    await p.locator("[data-compose-tab=photo]").click();
    const chooser = p.waitForEvent("filechooser");
    await p.locator("#composeAddPhoto").click();
    await (
      await chooser
    ).setFiles(path.join(__dirname, "../images/yana-about.webp"));
    await step("shape");
    await next();
    await p.locator("#keepBackground").click();
    await step("review");
    await p.locator("#editComposition").click();
    await step("personalize");
    assert.equal(
      await p.locator("#designMessage").inputValue(),
      "LOVE IS LOVE.",
    );
    await p.locator("[data-compose-tab=photo]").click();
    await p.locator("#composeRemovePhoto").click();
    await p.locator("[data-compose-tab=words]").click();
    assert.equal(
      await p.locator("#designMessage").inputValue(),
      "LOVE IS LOVE.",
    );
    await p.locator("#backButton").click();
    await p.locator("#startAi").click();
    await step("ai");
    assert.equal(aiCalls.length, 0);
    await p
      .locator("#aiBrief")
      .fill("A birthday for a friend who loves gardening.");
    await p.locator("#generateAiWords").click();
    await p.locator(".ai-suggestion").first().waitFor();
    assert.equal(aiCalls.length, 1);
    assert.equal(await p.locator(".ai-suggestion").count(), 3);
    assert.match(aiCalls[0].messages[0].content, /age group: all ages/);
    await shot("05-ai-words");
    await p.locator(".ai-suggestion").first().click();
    await step("personalize");
    assert.equal(
      await p.locator("#designMessage").inputValue(),
      "Another year, still blooming.",
    );
    await p.locator("#designMessage").fill("Our very own words.");
    assert.equal(
      await p.locator("#designMessage").inputValue(),
      "Our very own words.",
    );
    await p.setViewportSize({ width: 390, height: 844 });
    await shot("06-mobile-editor");
    await p.evaluate(() => window.scrollTo(0, 550));
    const stickyPreview = await p.locator(".workspace-preview").boundingBox();
    assert.ok(
      stickyPreview.y >= 0 && stickyPreview.y <= 12,
      "mobile preview stays visible while scrolling text controls",
    );
    await shot("06b-mobile-live-preview");
    await p.locator("#backButton").click();
    await shot("07-mobile-start");
    await p.locator("#browseDesigns").click();
    await shot("08-mobile-gallery");
    for (const width of [320, 390, 768, 1440, 1920]) {
      await p.setViewportSize({ width, height: 900 });
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        "no overflow at " + width,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify({
        passed: true,
        checks: [
          "nine templates and filters",
          "editable names and messages",
          "background swatches and custom upload",
          "text-only order uploads",
          "no AI on manual path",
          "photo layers preserve words",
          "optional AI returns three editable suggestions",
          "responsive gallery and editor",
        ],
        screenshots: out,
        realPayments: 0,
      }),
    );
  } catch (e) {
    await shot("failure").catch(() => {});
    console.error((await p.locator("body").innerText()).slice(0, 1800));
    throw e;
  } finally {
    await p.close({ runBeforeUnload: false });
    await b.close();
  }
})().catch((e) => {
  console.error(e.stack?.slice(0, 1800) || e.message);
  process.exitCode = 1;
});
