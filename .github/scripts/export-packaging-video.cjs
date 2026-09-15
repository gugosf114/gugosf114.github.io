// Render the saved 3D scene to a portable 1080p, 30 fps MP4. Requires FFmpeg and a rendering Chrome session.
const fs = require("node:fs"),
  path = require("node:path"),
  { spawn } = require("node:child_process");
const pw = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
(async () => {
  const browser = await pw.chromium.connectOverCDP(
      process.env.CDP_URL || "http://127.0.0.1:9224",
    ),
    page = await browser.contexts()[0].newPage();
  let encoder;
  try {
    await page.setViewportSize({ width: 1200, height: 1200 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(
      process.env.STUDIO_URL || "http://127.0.0.1:8765/buy-now.html",
    );
    await page.waitForFunction(() => !!window.__mbcPackagingFilm);
    await page.evaluate(async () => {
      const [
        { createPackagingScene },
        { drawArtwork, canvas },
        { createFilmArtwork },
        { filmFrame, DURATION, progress },
      ] = await Promise.all([
        import("./order-packaging-scene.mjs"),
        import("./order-studio-art.mjs"),
        import("./order-packaging-art.mjs"),
        import("./order-packaging-timeline.mjs"),
      ]);
      await Promise.all([
        document.fonts.load('400 39px "Fredoka One"'),
        document.fonts.load('600 23px "Nunito"'),
        document.fonts.load('500 39px "DM Sans"'),
      ]);
      await document.fonts.ready;
      const brandLogo = new Image();
      brandLogo.src = "logo_icon.png";
      await brandLogo.decode();
      const qrImage = new Image(); qrImage.src = "media/film-art/website-qr.png"; await qrImage.decode();
      const mount = document.createElement("div");
      mount.style.cssText =
        "position:fixed;left:-2000px;top:0;width:1080px;height:900px;";
      document.body.append(mount);
      const art = await createFilmArtwork();
      window.packagingExportFrames = DURATION * 30;
      const scene = createPackagingScene(mount, art, undefined, brandLogo, qrImage),
        output = canvas(1080);
      const ctx = output.getContext("2d");
      const opening = canvas(1080);
      const words = {
        cookie: ["Make a little wish.", "Start with a design. Make it yours."],
        family: ["Keep a little memory.", "Your favorite faces, printed on icing."],
        baby: ["Celebrate a first.", "A face. A name. A moment to remember."],
        business: ["Make your brand memorable.", "Company logos, beautifully baked."],
        wrap: ["Wrapped one by one.", "A clear sleeve for every cookie."],
        pack: ["So many ways to make their day.", "Your moments. Your message. Your brand."],
        finish: [
          "Ready to make their day.",
          "Your cookies, nestled in our signature box.",
        ],
        turn: ["A gift worth giving.", "Made by us. Made for your person."],
        table: ["From our bakery to your table.", "Beautifully packed. Ready to share."],
        serve: ["Just open. And serve.", "The box is the presentation."],
      };
      window.exportPackagingFrame = (t) => {
        scene.render(t);
        ctx.fillStyle = "#efe9dc";
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.drawImage(mount.querySelector("canvas"), 0, 0, 1080, 900);
        const text = words[filmFrame(t).phase];
        ctx.textAlign = "center";
        ctx.fillStyle = "#622d2b";
        ctx.font = '400 39px "Fredoka One", Arial';
        ctx.fillText(text[0], 540, 973);
        ctx.fillStyle = "#82665b";
        ctx.font = '600 23px "Nunito", Arial';
        ctx.fillText(text[1], 540, 1020);
        if (t === 0) opening.getContext("2d").drawImage(output,0,0);
        if (t >= DURATION - .8) {
          ctx.globalAlpha = progress(t,DURATION-.8,DURATION-.03);
          ctx.drawImage(opening,0,0); ctx.globalAlpha = 1;
        }
        return output.toDataURL("image/png").split(",")[1];
      };
      window.disposePackagingExport = () => {
        scene.dispose();
        mount.remove();
      };
    });
    const out = path.resolve("media/cookie-packaging.mp4");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    encoder = spawn(
      process.env.FFMPEG_PATH || "ffmpeg",
      [
        "-y",
        "-loglevel",
        "error",
        "-f",
        "image2pipe",
        "-framerate",
        "30",
        "-i",
        "pipe:0",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        out,
      ],
      { windowsHide: true, stdio: ["pipe", "ignore", "pipe"] },
    );
    encoder.stderr.on("data", (x) => process.stderr.write(x));
    const completion = new Promise((resolve, reject) =>
      encoder.on("exit", (code) =>
        code === 0 ? resolve() : reject(new Error("Encoder exit " + code)),
      ),
    );
    const frames = await page.evaluate(() => window.packagingExportFrames);
    for (let i = 0; i < frames; i++) {
      const frame = Buffer.from(
        await page.evaluate((t) => window.exportPackagingFrame(t), i / 30),
        "base64",
      );
      if (!encoder.stdin.write(frame))
        await new Promise((r) => encoder.stdin.once("drain", r));
      if (i === 0) fs.writeFileSync("media/cookie-packaging-poster.png", frame);
      if (i % 60 === 0) console.log("Rendered " + i + "/" + frames + " frames");
    }
    encoder.stdin.end();
    await completion;
    await page.evaluate(() => window.disposePackagingExport());
    console.log("Exported " + out + " (" + fs.statSync(out).size + " bytes)");
  } finally {
    if (encoder && encoder.exitCode === null) encoder.kill();
    await page.close({ runBeforeUnload: false });
    await browser.close();
  }
})().catch((e) => {
  console.error(e.stack || e.message);
  process.exitCode = 1;
});
