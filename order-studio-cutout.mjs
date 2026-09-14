// MediaPipe MagicTouch, the same pinned model used by the previous order page.
// https://developers.google.com/edge/mediapipe/solutions/vision/interactive_segmenter/web_js
import { canvas } from "./order-studio-art.mjs";
const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/interactive_segmenter_v2/magic_touch/int8/1/interactive_segmentation.task";
let loading;
async function getSegmenter(progress) {
  if (loading) return loading;
  loading = (async () => {
    const response = await fetch(MODEL, {
      cache: "force-cache",
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok)
      throw new Error(
        "The cutout tool could not load. Check your connection and try again.",
      );
    const total = Number(response.headers.get("content-length")) || 30525312;
    let buffer;
    if (response.body) {
      const reader = response.body.getReader(),
        chunks = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.byteLength;
        progress(Math.min(95, Math.round((size / total) * 95)));
      }
      buffer = new Uint8Array(size);
      let offset = 0;
      for (const part of chunks) {
        buffer.set(part, offset);
        offset += part.byteLength;
      }
    } else buffer = new Uint8Array(await response.arrayBuffer());
    const mp = await import(CDN + "/vision_bundle.mjs");
    const files = await mp.FilesetResolver.forVisionTasks(CDN + "/wasm");
    const segmenter = await mp.InteractiveSegmenter.createFromOptions(files, {
      baseOptions: { delegate: "CPU", modelAssetBuffer: buffer },
    });
    progress(100);
    return segmenter;
  })().catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}
export async function cutSubject(source, point, progress) {
  const segmenter = await getSegmenter(progress);
  // Let the browser paint the status before synchronous inference.
  await new Promise((resolve) => setTimeout(resolve, 30));
  segmenter.setImage(source);
  const mask = segmenter.segment([
    { brushMode: 1, point: [point], isCompleted: true },
  ]);
  try {
    const values = mask.getAsFloat32Array(),
      w = mask.width,
      h = mask.height;
    const startX = Math.max(0, Math.min(w - 1, Math.round(point.x * (w - 1))));
    const startY = Math.max(0, Math.min(h - 1, Math.round(point.y * (h - 1))));
    let start = startY * w + startX;
    if (values[start] < 0.34) {
      let found = false;
      for (let r = 1; r < 32 && !found; r++)
        for (
          let y = Math.max(0, startY - r);
          y <= Math.min(h - 1, startY + r) && !found;
          y++
        ) {
          for (
            let x = Math.max(0, startX - r);
            x <= Math.min(w - 1, startX + r);
            x++
          ) {
            if (values[y * w + x] >= 0.34) {
              start = y * w + x;
              found = true;
              break;
            }
          }
        }
      if (!found)
        throw new Error(
          "Tap closer to the middle of the person, pet, or object you want to keep.",
        );
    }
    const seen = new Uint8Array(w * h),
      queue = new Int32Array(w * h);
    let head = 0,
      tail = 1;
    queue[0] = start;
    seen[start] = 1;
    while (head < tail) {
      const i = queue[head++],
        x = i % w,
        y = Math.floor(i / w);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (
            (!dx && !dy) ||
            x + dx < 0 ||
            x + dx >= w ||
            y + dy < 0 ||
            y + dy >= h
          )
            continue;
          const n = (y + dy) * w + x + dx;
          if (!seen[n] && values[n] >= 0.34) {
            seen[n] = 1;
            queue[tail++] = n;
          }
        }
    }
    if (tail / (w * h) < 0.005 || tail / (w * h) > 0.97)
      throw new Error(
        "We could not separate that subject. Try another spot, or keep the full photo.",
      );
    const result = canvas(w, h),
      ctx = result.getContext("2d");
    ctx.drawImage(source, 0, 0, w, h);
    const pixels = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < w * h; i++) {
      let v = Math.max(0, Math.min(1, (values[i] - 0.18) / 0.62));
      v = v * v * (3 - 2 * v);
      pixels.data[i * 4 + 3] = seen[i]
        ? Math.round(v * pixels.data[i * 4 + 3])
        : 0;
    }
    ctx.putImageData(pixels, 0, 0);
    return result;
  } finally {
    mask.close();
  }
}
