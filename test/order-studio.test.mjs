import test from "node:test";
import assert from "node:assert/strict";
import {
  photoRect,
  sourcePoint,
  quantities,
  cookiePoint,
} from "../order-studio-art.mjs";
import { cutStrokes } from "../order-studio-cutout.mjs";

test("a tap on a zoomed, repositioned cookie maps to the original image", () => {
  for (const shape of ["round", "square"]) {
    const design = {
      shape,
      source: { width: 1600, height: 900 },
      view: { zoom: 1.6, x: 0.05, y: -0.04, fit: "cover" },
    };
    const r = photoRect(1600, 900, { ...design.view, shape });
    const original = { x: 0.52, y: 0.47 };
    const hit = cookiePoint(
      {
        x: 0.094 + 0.812 * (r.x + original.x * r.w),
        y: 0.089 + 0.812 * (r.y + original.y * r.h),
      },
      design,
    );
    assert.ok(
      Math.abs(hit.x - original.x) < 1e-10 &&
        Math.abs(hit.y - original.y) < 1e-10,
    );
    assert.equal(
      cookiePoint({ x: 0, y: 0 }, design),
      null,
      "cookie rim and empty stage cannot select a subject",
    );
  }
});

test("cleanup keeps the positive subject and appends explicit negative taps", () => {
  const keep = { x: 0.5, y: 0.4 },
    remove = [
      { x: 0.2, y: 0.7 },
      { x: 0.8, y: 0.9 },
    ];
  assert.deepEqual(cutStrokes(keep, remove), [
    { brushMode: 1, point: [keep], isCompleted: true },
    ...remove.map((point) => ({
      brushMode: 2,
      point: [point],
      isCompleted: true,
    })),
  ]);
  assert.equal(remove.length, 2);
});

test("crop preserves aspect ratio and uses the same transform for taps", () => {
  const rect = photoRect(1600, 900, { zoom: 1, x: 0, y: 0, fit: "cover" });
  assert.equal(rect.h, 1);
  assert.equal(rect.w / rect.h, 1600 / 900);
  assert.deepEqual(sourcePoint({ x: 0.5, y: 0.5 }, rect), { x: 0.5, y: 0.5 });
  const moved = photoRect(1600, 900, {
    zoom: 2,
    x: 0.15,
    y: -0.1,
    fit: "cover",
  });
  const original = { x: 0.4, y: 0.6 };
  const displayed = {
    x: moved.x + original.x * moved.w,
    y: moved.y + original.y * moved.h,
  };
  const recovered = sourcePoint(displayed, moved);
  assert.ok(Math.abs(recovered.x - original.x) < 1e-10);
  assert.ok(Math.abs(recovered.y - original.y) < 1e-10);
});

test("whole-photo fit keeps a portrait or wide image inside the print", () => {
  for (const [w, h] of [
    [600, 1200],
    [2000, 500],
  ]) {
    const r = photoRect(w, h, { zoom: 1, x: 0, y: 0, fit: "contain" });
    assert.ok(r.x >= 0 && r.y >= 0);
    assert.ok(r.x + r.w <= 1 && r.y + r.h <= 1);
  }
});

test("every design has twelve cookies minimum and quantities sum to the order", () => {
  assert.deepEqual(quantities(25, 2), [13, 12]);
  assert.deepEqual(quantities(36, 3), [12, 12, 12]);
  assert.throws(() => quantities(12, 2), /12 cookies/);
});

test("fit whole photo keeps all four corners inside a round cookie", () => {
  const r = photoRect(1000, 1000, {
    fit: "contain",
    zoom: 1,
    x: 0,
    y: 0,
    shape: "round",
  });
  assert.ok(Math.hypot(r.x - 0.5, r.y - 0.5) <= 0.5);
  assert.ok(Math.hypot(r.x + r.w - 0.5, r.y + r.h - 0.5) <= 0.5);
});
