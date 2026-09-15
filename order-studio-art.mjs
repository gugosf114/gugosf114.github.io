import { drawBackground, drawWords } from "./order-studio-designs.mjs?v=ai-original-1";
// All positions use the same normalized print square for preview and saved artwork.
export function photoRect(width, height, view) {
  const scale =
    (view.fit === "contain"
      ? view.shape === "round"
        ? 0.96 / Math.hypot(width, height)
        : Math.min(1 / width, 1 / height) * 0.88
      : Math.max(1 / width, 1 / height)) * view.zoom;
  const w = width * scale,
    h = height * scale;
  return { x: (1 - w) / 2 + view.x, y: (1 - h) / 2 + view.y, w, h };
}
export function sourcePoint(point, rect) {
  return { x: (point.x - rect.x) / rect.w, y: (point.y - rect.y) / rect.h };
}
export function cookiePoint(point, design) {
  // Match the print placement in drawCookie, including its thin icing rim.
  const p = { x: (point.x - 0.094) / 0.812, y: (point.y - 0.089) / 0.812 };
  if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1) return null;
  if (design.shape === "round" && Math.hypot(p.x - 0.5, p.y - 0.5) > 0.5)
    return null;
  if (design.shape === "square") {
    const dx = Math.max(0.065 - p.x, 0, p.x - 0.935),
      dy = Math.max(0.065 - p.y, 0, p.y - 0.935);
    if (Math.hypot(dx, dy) > 0.065) return null;
  }
  const r = photoRect(design.source.width, design.source.height, {
    ...design.view,
    shape: design.shape,
  });
  const source = sourcePoint(p, r);
  return source.x >= 0 && source.x <= 1 && source.y >= 0 && source.y <= 1
    ? source
    : null;
}
export function quantities(total, count) {
  if (total < count * 12)
    throw new Error("Each design needs at least 12 cookies.");
  return Array.from({ length: count }, (_, i) =>
    i === 0 ? total - (count - 1) * 12 : 12,
  );
}
export function canvas(width, height = width) {
  const node = document.createElement("canvas");
  node.width = width;
  node.height = height;
  return node;
}
export function cloneCanvas(source) {
  const copy = canvas(source.width, source.height);
  copy.getContext("2d").drawImage(source, 0, 0);
  return copy;
}
export function shapePath(ctx, shape, x, y, size) {
  ctx.beginPath();
  if (shape === "square") ctx.roundRect(x, y, size, size, size * 0.065);
  else ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
}
export function drawArtwork(target, design) {
  const ctx = target.getContext("2d"),
    size = target.width;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  shapePath(ctx, design.shape, 0, 0, size);
  ctx.clip();
  drawBackground(ctx, size, design.backdrop);
  if (design.logoRequired) {
    ctx.beginPath();ctx.roundRect(.24*size,.10*size,.52*size,.38*size,.035*size);
    ctx.fillStyle='#ffffff';ctx.fill();
  }
  if (design.source) {
    const r = photoRect(design.source.width, design.source.height, {
      ...design.view,
      shape: design.shape,
    });
    ctx.drawImage(
      design.source,
      r.x * size,
      r.y * size,
      r.w * size,
      r.h * size,
    );
  }
  drawWords(ctx, size, design.text, design.shape);
  ctx.restore();
}
export function drawCookie(target, design) {
  const ctx = target.getContext("2d"),
    s = target.width;
  ctx.clearRect(0, 0, s, s);
  const edge = 0.065 * s,
    body = 0.87 * s;
  ctx.save();
  ctx.shadowColor = "rgba(66,36,17,.22)";
  ctx.shadowBlur = s * 0.025;
  ctx.shadowOffsetY = s * 0.022;
  shapePath(ctx, design.shape, edge, edge, body);
  const baked = ctx.createLinearGradient(0, edge, 0, s - edge);
  baked.addColorStop(0, "#e6b773");
  baked.addColorStop(0.5, "#c9904c");
  baked.addColorStop(1, "#a76b30");
  ctx.fillStyle = baked;
  ctx.fill();
  ctx.restore();
  // Deterministic crumbs give the cookie an edge without a stock photograph.
  ctx.save();
  shapePath(ctx, design.shape, edge, edge, body);
  ctx.clip();
  for (let i = 0; i < 460; i++) {
    const x = (((Math.sin(i * 127.1) * 43758.5453) % 1) + 1) % 1;
    const y = (((Math.sin(i * 311.7) * 13758.3453) % 1) + 1) % 1;
    ctx.fillStyle = i % 3 ? "rgba(110,64,20,.16)" : "rgba(255,237,182,.5)";
    ctx.beginPath();
    ctx.arc(x * s, y * s, s * (0.0009 + (i % 5) * 0.0005), 0, 7);
    ctx.fill();
  }
  ctx.restore();
  shapePath(ctx, design.shape, s * 0.083, s * 0.078, s * 0.834);
  ctx.fillStyle = "#f7eedf";
  ctx.fill();
  const art = canvas(s);
  drawArtwork(art, design);
  ctx.drawImage(art, s * 0.094, s * 0.089, s * 0.812, s * 0.812);
  ctx.save();
  shapePath(ctx, design.shape, s * 0.083, s * 0.078, s * 0.834);
  ctx.strokeStyle = "rgba(255,255,255,.8)";
  ctx.lineWidth = s * 0.003;
  ctx.stroke();
  ctx.restore();
  if (design.logoRequired && !design.source) {
    ctx.save();ctx.fillStyle='#7e8da0';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='600 '+(.038*s)+'px Arial';ctx.fillText('YOUR LOGO',.5*s,(.089+.812*.29)*s);ctx.restore();
  }
}
export function blobOf(target) {
  return new Promise((resolve, reject) =>
    target.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(
              new Error("Your preview could not be saved. Please try again."),
            ),
      "image/png",
    ),
  );
}
