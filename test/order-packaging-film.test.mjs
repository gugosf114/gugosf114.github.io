import test from "node:test";
import assert from "node:assert/strict";
import {
  DURATION,
  filmFrame,
  cookieSlots,
} from "../order-packaging-timeline.mjs";

test("the finished box contains exactly twelve separate cookies", () => {
  const slots = cookieSlots();
  assert.equal(slots.length, 12);
  assert.equal(new Set(slots.map((s) => s.join(","))).size, 12);
  assert.ok(filmFrame(DURATION).cookies.every((c) => c.packed === 1));
  assert.equal(filmFrame(DURATION).cookies.length, 12);
});
test("wrapping finishes before the cookie settles in the box", () => {
  const frame = filmFrame(6);
  assert.equal(frame.wrapper, 1);
  assert.equal(frame.cookies[0].packed, 0);
  assert.ok(filmFrame(10.8).cookies.every((c) => c.packed === 1));
});
test("the finished box makes one complete turn and playback has a finite end", () => {
  assert.equal(filmFrame(11.8).rotation, 0);
  assert.ok(Math.abs(filmFrame(DURATION).rotation - Math.PI * 2) < 1e-9);
  assert.deepEqual(filmFrame(DURATION + 20), filmFrame(DURATION));
});
