export const backgrounds = [
  { id: "paper", name: "Icing white", color: "#fffdf8", ink: "#382b42" },
  { id: "rose", name: "Blush", color: "#f8dfe7", ink: "#742b4c" },
  { id: "lilac", name: "Lilac", color: "#e9e1f7", ink: "#4d376d" },
  { id: "midnight", name: "Midnight", color: "#222543", ink: "#fff2be" },
  { id: "confetti", name: "Confetti", color: "#fff3d9", ink: "#763952" },
  { id: "fireworks", name: "Fireworks", color: "#242240", ink: "#fff0b3" },
  { id: "flowers", name: "Flowers", color: "#f5e8ee", ink: "#78324a" },
  { id: "hearts", name: "Hearts", color: "#fff0f2", ink: "#a92f53" },
  { id: "rainbow", name: "Rainbow Pride", color: "#e40303", ink: "#ffffff" },
  { id: "trans", name: "Trans Pride", color: "#5bcefa", ink: "#3a2846" },
  { id: "sunshine", name: "Sunshine", color: "#ffe8a9", ink: "#87431f" },
  { id: "custom", name: "Your color", color: "#dceee5", ink: "#2b5747" },
];
const spec = (
  id,
  name,
  occasion,
  tone,
  bg,
  message,
  font = "clean",
  color = null,
) => ({ id, name, occasion, tone, bg, message, font, color });
export const templates = [
  spec(
    "birthday-wish",
    "Make a wish",
    "birthday",
    "sweet",
    "fireworks",
    "MAKE A\nWISH!",
    "classic",
  ),
  spec(
    "birthday-winging",
    "Still winging it",
    "birthday",
    "funny",
    "confetti",
    "Another year.\nStill winging it.",
  ),
  spec(
    "birthday-you",
    "A very you birthday",
    "birthday",
    "bold",
    "lilac",
    "A WHOLE DAY\nABOUT YOU.",
    "bold",
  ),
  spec(
    "anniversary-choose",
    "Still choosing you",
    "anniversary",
    "sweet",
    "hearts",
    "Still\nchoosing you.",
    "classic",
  ),
  spec(
    "anniversary-weird",
    "My favorite weirdo",
    "anniversary",
    "funny",
    "rose",
    "You’re still\nmy favorite\nweirdo.",
  ),
  spec(
    "anniversary-us",
    "Here’s to us",
    "anniversary",
    "bold",
    "midnight",
    "HERE’S\nTO US.",
    "classic",
  ),
  spec(
    "thanks-flower",
    "Thanks for showing up",
    "thanks",
    "sweet",
    "flowers",
    "Thank you\nfor showing up.",
    "classic",
  ),
  spec(
    "thanks-legend",
    "Absolute legend",
    "thanks",
    "funny",
    "sunshine",
    "You absolute\nlegend.",
  ),
  spec(
    "thanks-big",
    "A very big thank you",
    "thanks",
    "bold",
    "lilac",
    "BIG\nTHANK YOU.",
    "bold",
  ),
];
export function createTemplate(id) {
  const t = templates.find((t) => t.id === id);
  if (!t) throw new Error("Choose an available design.");
  const b = backgrounds.find((b) => b.id === t.bg);
  return {
    templateId: t.id,
    occasion: t.occasion,
    backdrop: { id: b.id, color: b.color, image: null },
    text: {
      message: t.message,
      personalization: "",
      font: t.font,
      color: t.color || b.ink,
      size: 0.095,
      x: 0.5,
      y: 0.5,
    },
    shape: "round",
  };
}
export const defaultText = () => ({
  message: "",
  personalization: "",
  font: "clean",
  color: "#382b42",
  size: 0.085,
  x: 0.5,
  y: 0.5,
});
export function messageSuggestions(occasion, tone) {
  const pool = templates.filter((t) => t.occasion === occasion);
  const preferred = pool.filter((t) => t.tone === tone),
    others = pool.filter((t) => t.tone !== tone);
  return [...preferred, ...others].map((t) => t.message.replace(/\n/g, " "));
}
export function parseAiMessages(reply) {
  const text = String(reply || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "The suggestions did not arrive correctly. Please try again.",
    );
  }
  if (
    !Array.isArray(data) ||
    data.length < 1 ||
    data.length > 5 ||
    data.some((v) => typeof v !== "string" || !v.trim() || v.length > 120)
  )
    throw new Error(
      "The suggestions did not arrive in the right format. Please try again.",
    );
  return data.slice(0, 3).map((v) => v.trim());
}
export async function suggestAiMessages(
  { brief, occasion, tone, audience },
  signal,
) {
  const prompt = `Write exactly three messages for edible greeting-card cookies. Occasion: ${occasion}. Tone: ${tone}. Recipient age group: ${audience}. Customer's description: ${brief.slice(0, 500)}. Each message must be at most 90 characters, readable on a cookie, and appropriate for the age group. Keep the humor kind and suitable for all ages. No sexual material, slurs, or insults about protected traits. Do not invent names, ages, dates, prices, or delivery promises. Return ONLY a JSON array of three strings. No prose or markdown.`;
  const response = await fetch(
    "https://mbc-chatbot.summer-lake-b6ea.workers.dev",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      signal,
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error ||
        "The writing assistant is unavailable. Try again, or choose a ready-made message.",
    );
  return parseAiMessages(data.reply);
}

export function drawBackground(ctx, size, backdrop) {
  const id = backdrop?.id || "paper";
  ctx.fillStyle = backdrop?.color || "#fffdf8";
  ctx.fillRect(0, 0, size, size);
  if (backdrop?.image) {
    const img = backdrop.image,
      scale = Math.max(size / img.width, size / img.height);
    ctx.drawImage(
      img,
      (size - img.width * scale) / 2,
      (size - img.height * scale) / 2,
      img.width * scale,
      img.height * scale,
    );
    return;
  }
  if (id === "rainbow" || id === "trans") {
    const colors =
      id === "rainbow"
        ? ["#e40303", "#ff8c00", "#ffed00", "#008026", "#004dff", "#750787"]
        : ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"];
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        0,
        (size * i) / colors.length,
        size,
        Math.ceil(size / colors.length),
      );
    });
  } else if (id === "confetti") {
    const colors = ["#cf386c", "#e6ad2a", "#5c8c73", "#8e6bb4"];
    for (let i = 0; i < 60; i++) {
      const angle = i * 2.39996,
        r = 0.37 + (i % 5) * 0.025;
      ctx.save();
      ctx.translate(
        (0.5 + Math.cos(angle) * r) * size,
        (0.5 + Math.sin(angle) * r) * size,
      );
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % 4];
      ctx.fillRect(-0.005 * size, -0.012 * size, 0.01 * size, 0.024 * size);
      ctx.restore();
    }
  } else if (id === "fireworks") {
    const points = [
      [0.24, 0.2, 0.15],
      [0.8, 0.3, 0.17],
      [0.27, 0.8, 0.13],
      [0.79, 0.8, 0.1],
    ];
    points.forEach(([x, y, r], j) => {
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8;
        ctx.beginPath();
        ctx.moveTo(
          (x + Math.cos(a) * r * 0.35) * size,
          (y + Math.sin(a) * r * 0.35) * size,
        );
        ctx.lineTo((x + Math.cos(a) * r) * size, (y + Math.sin(a) * r) * size);
        ctx.strokeStyle = j % 2 ? "#f0a7c7" : "#ecd594";
        ctx.lineWidth = size * 0.002;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
          (x + Math.cos(a) * r * 1.12) * size,
          (y + Math.sin(a) * r * 1.12) * size,
          size * 0.003,
          0,
          7,
        );
        ctx.fillStyle = "#fff0b3";
        ctx.fill();
      }
    });
  } else if (id === "hearts") {
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        x = 0.5 + Math.cos(a) * 0.4,
        y = 0.5 + Math.sin(a) * 0.4;
      ctx.save();
      ctx.translate(x * size, y * size);
      ctx.rotate(a + Math.PI / 2);
      ctx.scale(size * 0.034, size * 0.034);
      ctx.beginPath();
      ctx.moveTo(0, 0.8);
      ctx.bezierCurveTo(-2, -0.5, -1, -1.7, 0, -0.7);
      ctx.bezierCurveTo(1, -1.7, 2, -0.5, 0, 0.8);
      ctx.fillStyle = i % 2 ? "#ce6983" : "#e8a2b0";
      ctx.fill();
      ctx.restore();
    }
  } else if (id === "flowers") {
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5,
        x = 0.5 + Math.cos(a) * 0.41,
        y = 0.5 + Math.sin(a) * 0.41;
      for (let p = 0; p < 5; p++) {
        const angle = (p * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.ellipse(
          (x + Math.cos(angle) * 0.021) * size,
          (y + Math.sin(angle) * 0.021) * size,
          0.024 * size,
          0.013 * size,
          angle,
          0,
          7,
        );
        ctx.fillStyle = i % 2 ? "#cf7797" : "#b490ba";
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x * size, y * size, 0.011 * size, 0, 7);
      ctx.fillStyle = "#efc779";
      ctx.fill();
    }
  } else if (id === "sunshine") {
    ctx.strokeStyle = "#e4b64e";
    ctx.lineWidth = size * 0.015;
    for (let i = 0; i < 28; i++) {
      const a = (i * Math.PI) / 14;
      ctx.beginPath();
      ctx.moveTo(
        (0.5 + Math.cos(a) * 0.39) * size,
        (0.5 + Math.sin(a) * 0.39) * size,
      );
      ctx.lineTo(
        (0.5 + Math.cos(a) * 0.51) * size,
        (0.5 + Math.sin(a) * 0.51) * size,
      );
      ctx.stroke();
    }
  }
}
const faces = {
  clean: '"DM Sans", Arial, sans-serif',
  classic: "Georgia, serif",
  bold: '"Trebuchet MS", Arial, sans-serif',
};
export function wrapWords(ctx, text, width) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (ctx.measureText(word).width > width) {
        if (line) {
          lines.push(line);
          line = "";
        }
        for (const letter of [...word]) {
          if (line && ctx.measureText(line + letter).width > width) {
            lines.push(line);
            line = "";
          }
          line += letter;
        }
      } else {
        const next = line ? line + " " + word : word;
        if (line && ctx.measureText(next).width > width) {
          lines.push(line);
          line = word;
        } else line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}
export function drawWords(ctx, size, text, shape) {
  if (!text?.message?.trim() && !text?.personalization?.trim()) return;
  const full = [text.message, text.personalization].filter(Boolean).join("\n");
  const x = Math.max(0.22, Math.min(0.78, text.x ?? 0.5)),
    y = Math.max(0.17, Math.min(0.83, text.y ?? 0.5));
  const safeWidth = Math.min(0.74, 2 * Math.min(x, 1 - x) - 0.1) * size;
  let fontSize = (text.size || 0.085) * size,
    lines = [];
  const wrap = () => {
    ctx.font = `${text.font === "bold" ? 700 : 500} ${fontSize}px ${faces[text.font] || faces.clean}`;
    lines = wrapWords(ctx, full, safeWidth);
    return lines;
  };
  for (let n = 0; n < 35; n++) {
    wrap();
    const height = lines.length * fontSize * 1.18;
    let fits = height <= 2 * Math.min(y, 1 - y) * size - 0.09 * size;
    for (let i = 0; i < lines.length; i++) {
      const dy =
        (y - 0.5) * size + (i - (lines.length - 1) / 2) * fontSize * 1.18;
      const max =
        shape === "round"
          ? 2 *
            Math.sqrt(
              Math.max(
                0,
                (0.45 * size) ** 2 - (Math.abs(dy) + fontSize * 0.6) ** 2,
              ),
            )
          : safeWidth;
      fits &&= ctx.measureText(lines[i]).width <= Math.min(safeWidth, max);
    }
    if (fits) break;
    fontSize *= 0.94;
  }
  ctx.font = `${text.font === "bold" ? 700 : 500} ${fontSize}px ${faces[text.font] || faces.clean}`;
  ctx.fillStyle = text.color || "#382b42";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (String(text.color || "#382b42").toLowerCase() === "#ffffff") {
    ctx.shadowColor = "rgba(0,0,0,.2)";
    ctx.shadowBlur = size * 0.004;
  }
  lines.forEach((line, i) =>
    ctx.fillText(
      line,
      x * size,
      y * size + (i - (lines.length - 1) / 2) * fontSize * 1.18,
    ),
  );
  ctx.shadowBlur = 0;
}
