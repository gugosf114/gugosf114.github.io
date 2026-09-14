// Render the saved 3D scene to a portable 1080p, 30 fps MP4. Requires FFmpeg and an existing test Chrome.
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
        { createTemplate },
        { filmFrame },
      ] = await Promise.all([
        import("./order-packaging-scene.mjs"),
        import("./order-studio-art.mjs"),
        import("./order-studio-designs.mjs"),
        import("./order-packaging-timeline.mjs"),
      ]);
      await document.fonts.ready;
      const mount = document.createElement("div");
      mount.style.cssText =
        "position:fixed;left:-2000px;top:0;width:1080px;height:900px;";
      document.body.append(mount);
      const art = canvas(1024);
      drawArtwork(art, createTemplate("birthday-wish"));
      const scene = createPackagingScene(mount, art),
        output = canvas(1080);
      const ctx = output.getContext("2d");
      const words = {
        cookie: ["A little cookie.", "Your idea, printed on icing."],
        wrap: ["Wrapped one by one.", "A clear sleeve for every cookie."],
        pack: ["Twelve little moments.", "Packed together in a gift box."],
        finish: [
          "Ready to make their day.",
          "A window box, finished with a bow.",
        ],
        turn: ["A gift worth giving.", "Made by us. Made for your person."],
      };
      window.exportPackagingFrame = (t) => {
        scene.render(t);
        ctx.fillStyle = "#eeedf6";
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.drawImage(mount.querySelector("canvas"), 0, 0, 1080, 900);
        const text = words[filmFrame(t).phase];
        ctx.textAlign = "center";
        ctx.fillStyle = "#32283f";
        ctx.font = '500 39px "DM Sans", Arial';
        ctx.fillText(text[0], 540, 973);
        ctx.fillStyle = "#71637d";
        ctx.font = '400 23px "DM Sans", Arial';
        ctx.fillText(text[1], 540, 1020);
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
    for (let i = 0; i < 480; i++) {
      const frame = Buffer.from(
        await page.evaluate((t) => window.exportPackagingFrame(t), i / 30),
        "base64",
      );
      if (!encoder.stdin.write(frame))
        await new Promise((r) => encoder.stdin.once("drain", r));
      if (i === 0) fs.writeFileSync("media/cookie-packaging-poster.png", frame);
      if (i % 60 === 0) console.log("Rendered " + i + "/480 frames");
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
