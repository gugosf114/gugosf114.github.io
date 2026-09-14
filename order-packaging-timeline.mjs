export const DURATION = 16;
const clamp = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => {
  x = clamp(x);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const progress = (time, start, end) =>
  ease((time - start) / (end - start));
const mix = (a, b, t) => a + (b - a) * t;
const vector = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
export function cookieSlots() {
  return Array.from({ length: 12 }, (_, i) => [
    ((i % 4) - 1.5) * 2.52,
    0.34,
    (1 - Math.floor(i / 4)) * 2.62,
  ]);
}
export function filmFrame(value) {
  const t = Math.max(0, Math.min(DURATION, Number(value) || 0)),
    reveal = progress(t, 5.8, 7.5),
    wrapper = progress(t, 2.8, 5.1),
    rotation = progress(t, 11.8, 16) * Math.PI * 2;
  let camera, target;
  if (t < 2.8) {
    const p = progress(t, 0, 2.8);
    camera = vector([0, 5.1, 6.5], [2.4, 3.65, 3.85], p);
    target = [0, 2, 0];
  } else if (t < 5.8) {
    const p = progress(t, 2.8, 5.8);
    camera = vector([2.4, 3.65, 3.85], [1.7, 5.5, 7], p);
    target = [0, 2, 0];
  } else {
    const p = progress(t, 5.8, 8.0);
    camera = vector([1.7, 5.5, 7], [9.5, 14, 15.5], p);
    target = vector([0, 2, 0], [0, 0.5, 0], p);
  }
  const heroRotation =
    t < 2.8
      ? vector([0.72, 0, -0.1], [1.05, -0.28, -0.08], progress(t, 0, 2.8))
      : vector([1.05, -0.28, -0.08], [0.6, 0.12, -0.08], progress(t, 2.8, 5.8));
  const cookies = cookieSlots().map((slot, i) => {
    const packed =
      i === 0
        ? progress(t, 6.8, 8.1)
        : progress(t, 7.1 + i * 0.21, 8.15 + i * 0.21);
    const start =
      i === 0
        ? [0, 2, 0]
        : [slot[0] + (i % 2 ? 0.35 : -0.35), slot[1] + 3.6, slot[2] - 0.6];
    return {
      packed,
      visible: i === 0 || t >= 7.1 + i * 0.21,
      position: vector(start, slot, packed),
      rotation:
        i === 0
          ? vector(heroRotation, [0, 0, 0], packed)
          : vector([0.2, i % 2 ? 0.12 : -0.12, 0.06], [0, 0, 0], packed),
    };
  });
  return {
    time: t,
    wrapper,
    box: reveal,
    lid: progress(t, 10.5, 11.8),
    rotation,
    camera,
    target,
    cookies,
    phase:
      t < 2.8
        ? "cookie"
        : t < 5.8
          ? "wrap"
          : t < 10.5
            ? "pack"
            : t < 11.8
              ? "finish"
              : "turn",
    complete: t >= DURATION,
  };
}
