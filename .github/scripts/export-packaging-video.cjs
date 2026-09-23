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
        turn: ["Twelve cookies. One gift box.", "$60 for 12 · individually wrapped · plus shipping"],
        table: ["From our bakery to your table.", "Beautifully packed. Ready to share."],
        serve: ["Just open. And serve.", "The box is the presentation."],
      };
      // Gold price seal: presses in once the full box closes, rides the turn, fades at the table.
      const drawPriceSeal = (t) => {
        const inP = progress(t, 15.6, 16.3), outP = progress(t, 18.9, 19.5);
        const a = inP * (1 - outP);
        if (a <= 0) return;
        const cx = 872, cy = 176, r = 104;
        const s = 0.6 + 0.4 * inP + 0.06 * Math.sin(Math.max(0, Math.min(1, (t - 15.6) / 0.7)) * Math.PI) ;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(cx, cy);
        ctx.rotate(-0.16 + 0.1 * (1 - inP));
        ctx.scale(s, s);
        ctx.shadowColor = "rgba(98,45,43,.28)"; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
        // scalloped edge
        ctx.beginPath();
        for (let i = 0; i <= 64; i++) {
          const ang = (i / 64) * Math.PI * 2, rr = r + (i % 2 ? 0 : 7);
          ctx[i ? "lineTo" : "moveTo"](Math.cos(ang) * rr, Math.sin(ang) * rr);
        }
        ctx.closePath();
        const g = ctx.createLinearGradient(-r, -r, r, r);
        g.addColorStop(0, "#f7dc8c"); g.addColorStop(0.45, "#e2ae4a"); g.addColorStop(1, "#b77a22");
        ctx.fillStyle = g; ctx.fill();
        ctx.shadowColor = "transparent";
        // inner rings
        ctx.lineWidth = 2.2; ctx.strokeStyle = "rgba(255,246,214,.85)";
        ctx.beginPath(); ctx.arc(0, 0, r - 13, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = "rgba(122,74,20,.55)";
        ctx.beginPath(); ctx.arc(0, 0, r - 19, 0, Math.PI * 2); ctx.stroke();
        // foil sweep
        const sweep = progress(t, 16.1, 17.4);
        if (sweep > 0 && sweep < 1) {
          ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
          const sx = -r * 1.6 + sweep * r * 3.2, sg = ctx.createLinearGradient(sx - 40, -r, sx + 40, r);
          sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,.55)"); sg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = sg; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
        }
        ctx.textAlign = "center"; ctx.fillStyle = "#5a2a14";
        ctx.font = '700 15px "Nunito", Arial'; ctx.fillText("12  COOKIES", 0, -38);
        ctx.font = '400 62px "Fredoka One", Arial'; ctx.fillText("$60", 0, 22);
        ctx.font = '700 15px "Nunito", Arial'; ctx.fillText("+ SHIPPING", 0, 52);
        ctx.restore();
      };
      window.exportPackagingFrame = (t) => {
        scene.render(t);
        ctx.fillStyle = "#efe9dc";
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.drawImage(mount.querySelector("canvas"), 0, 0, 1080, 900);
        drawPriceSeal(t);
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
