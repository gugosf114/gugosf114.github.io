import test from "node:test";
import assert from "node:assert/strict";
import {
  templates,
  backgrounds,
  createTemplate,
  messageSuggestions,
  parseAiMessages,
  wrapWords,
} from "../order-studio-designs.mjs";

test("long names and unspaced text wrap without losing letters", () => {
  const ctx = { measureText: (text) => ({ width: [...text].length }) };
  const text = "AlexandertheMagnificent";
  const lines = wrapWords(ctx, text, 8);
  assert.equal(lines.join(""), text);
  assert.ok(lines.every((line) => line.length <= 8));
  assert.deepEqual(wrapWords(ctx, "Happy\nBirthday", 12), [
    "Happy",
    "Birthday",
  ]);
});

test("nine templates cover three occasions and can be personalized independently", () => {
  assert.equal(templates.length, 9);
  for (const occasion of ["birthday", "anniversary", "thanks"])
    assert.equal(templates.filter((t) => t.occasion === occasion).length, 3);
  const first = createTemplate(templates[0].id),
    second = createTemplate(templates[0].id);
  first.text.message = "My own words";
  first.backdrop.color = "#000000";
  assert.notEqual(first.text.message, second.text.message);
  assert.notEqual(first.backdrop.color, second.backdrop.color);
  assert.ok(second.text.message.length > 0);
  assert.ok(backgrounds.some((b) => b.id === "rainbow"));
  assert.ok(backgrounds.some((b) => b.id === "trans"));
});

test("AI messages accept the live service format and reject malformed output", () => {
  assert.deepEqual(
    parseAiMessages(
      '```json\n["Make a wish!", "Another year, still blooming.", "You grow, friend."]\n```',
    ),
    ["Make a wish!", "Another year, still blooming.", "You grow, friend."],
  );
  assert.throws(() => parseAiMessages('{"reply":"ask about ordering"}'));
  assert.throws(() => parseAiMessages('["' + "x".repeat(121) + '"]'));
});

test("message suggestions remain editable text and use the selected occasion", () => {
  const lines = messageSuggestions("birthday", "funny");
  assert.ok(lines.length >= 3);
  assert.ok(lines.every((x) => typeof x === "string" && x.length <= 120));
  assert.notDeepEqual(lines, messageSuggestions("thanks", "sweet"));
});
