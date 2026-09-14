import {
  canvas,
  cloneCanvas,
  drawArtwork,
  drawCookie,
  photoRect,
  quantities,
  blobOf,
} from "./order-studio-art.mjs";
import { cutSubject } from "./order-studio-cutout.mjs";

const $ = (id) => document.getElementById(id);
const panels = [...document.querySelectorAll("[data-panel]")];
const steps = [
  "upload",
  "shape",
  "background",
  "finish",
  "review",
  "delivery",
  "pay",
];
const copy = {
  upload: [
    "Made by you. Baked by us.",
    "A little cookie.<br>A lot of you.",
    "Turn a favorite photo into something they can hold, share, and eat. Let's make yours.",
    "Choose your photo",
    0,
  ],
  shape: [
    "Design · 1 of 3",
    "Find your shape.",
    "Pick round or square. Then zoom and drag your photo until it’s just right.",
    "Continue",
    1,
  ],
  background: [
    "Design · 2 of 3",
    "What stays in<br>the picture?",
    "Keep the whole moment, or let your favorite part stand on its own.",
    "Continue",
    1,
  ],
  finish: [
    "Design · 3 of 3",
    "Make it just right.",
    "Move it. Zoom in. Tidy an edge if you need to. This is your cookie.",
    "Review my cookie",
    1,
  ],
  review: [
    "One last look",
    "Made yours.",
    "Take a good look. When you love it, approve your design and we’ll take it from here.",
    "Approve & continue",
    2,
  ],
  delivery: [
    "Almost yours",
    "Where’s it going?",
    "A gift for someone. A treat for everyone. Each cookie comes individually wrapped.",
    "Continue to payment",
    3,
  ],
  pay: [
    "The final step",
    "Let’s bake it.",
    "Your photo is approved. Your cookies are ready to become real.",
    "",
    4,
  ],
  complete: [
    "Thank you",
    "You made<br>their day.",
    "Now it’s our turn. We’ll bake, ice, and print your cookies right here in Daly City.",
    "",
    4,
  ],
};
const blank = () => ({
  file: null,
  original: null,
  source: null,
  shape: "round",
  background: null,
  cut: null,
  view: { zoom: 1, x: 0, y: 0, fit: "cover" },
  approved: null,
  thumbnail: null,
  undo: [],
});
let designs = [blank()],
  active = 0,
  step = "upload",
  tool = "move",
  selectingSubject = false;
let busy = false,
  paymentLocked = false,
  originalVisible = false,
  pendingAdd = false,
  paymentPromise = null,
  paymentLoaded = false,
  paid = false;
let pointer = null,
  cursor = { x: 0.5, y: 0.5 },
  version = 0,
  loadVersion = 0;
const current = () => designs[active];
const quote = () => window.__mbcOrderPricing.getState();
const money = (n) => "$" + Math.round(n);

function error(message = "") {
  $("studioError").textContent = message;
  $("studioError").hidden = !message;
}
function invalidate(design = current()) {
  if (design.approved?.previewUrl)
    URL.revokeObjectURL(design.approved.previewUrl);
  design.approved = null;
  window.__mbcOrderUpload?.invalidate();
}
function setBusy(value, title = "Preparing your photo…", detail = "") {
  busy = value;
  $("studio").dataset.busy = String(value);
  $("busyOverlay").hidden = !value;
  $("busyTitle").textContent = title;
  $("busyDetail").textContent = detail;
  $("cutProgress").hidden = !title.includes("background");
  $("continueButton").disabled = value || !canContinue();
  $("backButton").disabled = value;
  $("originalChip").disabled = value;
  $("studioStatus").textContent = value ? title : "";
}
function canContinue() {
  if (step === "upload") return true;
  if (!current().file) return false;
  if (step === "background") return !!current().background && !selectingSubject;
  if (step === "delivery")
    return quote().ready && designs.every((d) => d.approved);
  return true;
}
function show(next, { history = true, focus = true } = {}) {
  if (busy || paymentLocked || (paid && next !== "complete")) return;
  step = next;
  error();
  selectingSubject = false;
  originalVisible = false;
  tool = "move";
  if (history)
    window.history.pushState({ mbcStudio: true, step }, "", "#" + step);
  const info = copy[step];
  document.body.dataset.step = step;
  $("stepCounter").textContent = info[0];
  $("stepTitle").innerHTML = info[1];
  $("stepDescription").textContent = info[2];
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== step;
    panel.inert = panel.hidden;
  });
  document.querySelectorAll(".journey li").forEach((li, i) => {
    li.classList.toggle("is-done", i < info[4] || paid);
    if (i === info[4]) li.setAttribute("aria-current", "step");
    else li.removeAttribute("aria-current");
    li.querySelector("span").textContent = i < info[4] || paid ? "✓" : i + 1;
  });
  $("backButton").hidden = step === "upload" || step === "complete";
  $("continueButton").hidden = step === "pay" || step === "complete";
  $("continueButton").innerHTML =
    info[3] +
    ' <span aria-hidden="true">' +
    (step === "upload" ? "↗" : "→") +
    "</span>";
  $("footerNote").textContent =
    step === "upload"
      ? "Your photo stays on this device until checkout."
      : step === "pay"
        ? "Secure payment. Your exact design goes to our bakery."
        : "Your changes stay here as you go.";
  $("footerPrice").hidden = !current().file || paid;
  $("originalChip").hidden =
    !current().file || step === "pay" || step === "delivery" || paid;
  $("blankMark").hidden = !!current().file;
  $("designNumber").hidden = !current().file;
  $("designNumber").textContent =
    "Photo " +
    (active + 1) +
    (designs.length > 1 ? " of " + designs.length : "");
  if (step === "shape") {
    $("shapePositionMount").appendChild($("positionControls"));
    $("positionControls").hidden = false;
  }
  if (step === "background") syncBackground();
  if (step === "finish") {
    $("finishPositionMount").appendChild($("positionControls"));
    setTool("move");
  }
  if (step === "review") renderDesigns();
  if (step === "pay") loadPayment();
  if (focus) {
    $("stepTitle").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  updatePrice();
  render();
}
function render() {
  const d = current();
  if (step === "shape") {
    for (const shape of ["round", "square"])
      drawCookie($(shape + "Option"), { ...d, shape });
  }
  document
    .querySelectorAll("[data-shape]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.shape === d.shape)),
    );
  const editingMask = step === "finish" && tool !== "move";
  const raw = selectingSubject || editingMask || originalVisible;
  $("photoEditor").hidden = !raw;
  $("cookiePreview").hidden = raw;
  $("blankMark").hidden = !!d.file;
  $("previewLabel").textContent = originalVisible
    ? "Your original photo"
    : selectingSubject
      ? "Tap the person, pet, or object to keep"
      : editingMask
        ? tool === "erase"
          ? "Brush over what you want to remove"
          : "Brush to bring your photo back"
        : d.file
          ? "Your cookie, as you make it"
          : "A blank cookie. Endless possibilities.";
  $("previewStatus").textContent = originalVisible
    ? "Original upload"
    : selectingSubject
      ? "You choose what stays"
      : editingMask
        ? "Your changes appear on the cookie"
        : step === "review"
          ? "This is the artwork you’re approving"
          : d.file
            ? "Live preview"
            : "Made from your favorite moment";
  $("previewShape").textContent = d.file
    ? d.shape === "round"
      ? "Round cookie"
      : "Square cookie"
    : "Photo cookies";
  $("originalChip").querySelector("span").textContent = originalVisible
    ? "Back to cookie"
    : "View original";
  if (raw && d.original)
    drawEditor(
      originalVisible || selectingSubject ? d.original : d.source,
      selectingSubject || editingMask,
    );
  else drawCookie($("cookiePreview"), d);
  $("continueButton").disabled = busy || !canContinue();
  $("zoom").value = Math.round(d.view.zoom * 100);
  $("zoomValue").textContent = Math.round(d.view.zoom * 100) + "%";
}
function drawEditor(source, mark) {
  const c = $("editorCanvas");
  c.width = source.width;
  c.height = source.height;
  const context = c.getContext("2d");
  context.clearRect(0, 0, c.width, c.height);
  context.drawImage(source, 0, 0);
  // Explicit dimensions keep portrait and landscape images inside the editor.
  const stage = $("photoEditor").getBoundingClientRect();
  const ratio = Math.min(stage.width / c.width, stage.height / c.height);
  c.style.width = Math.floor(c.width * ratio) + "px";
  c.style.height = Math.floor(c.height * ratio) + "px";
  if (mark && document.activeElement === c) {
    context.beginPath();
    context.arc(
      cursor.x * c.width,
      cursor.y * c.height,
      selectingSubject ? 8 : brushRadius(c),
      0,
      Math.PI * 2,
    );
    context.strokeStyle = "#fff";
    context.lineWidth = 3;
    context.stroke();
    context.strokeStyle = "#cb2366";
    context.lineWidth = 1.5;
    context.stroke();
  }
}
function syncBackground() {
  $("keepBackground").setAttribute(
    "aria-pressed",
    String(current().background === "keep"),
  );
  $("removeBackground").setAttribute(
    "aria-pressed",
    String(current().background === "cut"),
  );
  $("subjectHint").hidden = !selectingSubject;
  $("recutButton").hidden = current().background !== "cut" || selectingSubject;
}
function updatePrice() {
  const q = quote();
  $("footerPrice").innerHTML =
    q.quantity + " cookies <strong>" + money(q.subtotal) + "</strong>";
  $("receiptCookies").textContent = q.quantity + " photo cookies";
  $("fulfilLabel").textContent =
    q.fulfil === "pickup" ? "Daly City pickup" : "FedEx " + q.serviceLabel;
  $("pickupNote").hidden = q.fulfil !== "pickup";
  $("manualQuote").hidden =
    q.fulfil !== "ship" || q.zip.length !== 5 || q.ready;
  $("qtyDown").disabled = q.quantity <= designs.length * 12;
  $("cookieQty").min = designs.length * 12;
  $("quantityNote").textContent =
    "$5 each · " +
    designs.length * 12 +
    "-cookie minimum" +
    (designs.length > 1 ? " for " + designs.length + " photos" : "");
  $("continueButton").disabled = busy || !canContinue();
}
function syncQuantity() {
  const q = quote(),
    minimum = designs.length * 12;
  if (q.quantity < minimum) {
    $("cookieQty").value = minimum;
    $("cookieQty").dispatchEvent(new Event("change"));
  }
  if (
    [...$("photoCount").options].every(
      (o) => Number(o.value) !== designs.length,
    )
  ) {
    const option = new Option(designs.length + " photos", designs.length);
    $("photoCount").add(option);
  }
  $("photoCount").value = designs.length;
  window.__mbcOrderPricing.update();
}
window.addEventListener("mbc:quotechange", () => {
  // Existing pricing clamps to twelve; the studio also enforces twelve per photo.
  if (quote().quantity < designs.length * 12) {
    syncQuantity();
    return;
  }
  if (Number($("photoCount").value) !== designs.length) {
    syncQuantity();
    return;
  }
  window.__mbcOrderUpload?.invalidate();
  updatePrice();
});

async function readPhoto(file) {
  if (!file) return;
  if (busy) return;
  error();
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return error(
      "Choose a JPG, PNG or WebP photo. On an iPhone, export the photo as JPEG first.",
    );
  if (file.size > 20 * 1024 * 1024)
    return error(
      "That photo is over 20 MB. Choose a smaller copy and try again.",
    );
  const token = ++loadVersion;
  setBusy(true, "Opening your photo…", "Getting your cookie ready.");
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    if (token !== loadVersion) return;
    if (pendingAdd) {
      designs.push(blank());
      active = designs.length - 1;
      pendingAdd = false;
    }
    const d = blank(),
      scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    d.original = canvas(
      Math.round(bitmap.width * scale),
      Math.round(bitmap.height * scale),
    );
    d.original
      .getContext("2d")
      .drawImage(bitmap, 0, 0, d.original.width, d.original.height);
    d.source = cloneCanvas(d.original);
    d.file = file;
    const old = current();
    if (old.thumbnail) URL.revokeObjectURL(old.thumbnail);
    if (old.approved?.previewUrl) URL.revokeObjectURL(old.approved.previewUrl);
    designs[active] = d;
    d.thumbnail = URL.createObjectURL(file);
    $("originalThumb").src = d.thumbnail;
    version++;
    syncQuantity();
    setBusy(false);
    show("shape");
  } catch {
    error("This photo could not be opened. Try another JPG, PNG or WebP.");
  } finally {
    bitmap?.close();
    setBusy(false);
  }
}
function choosePhoto(adding = false) {
  pendingAdd = adding;
  $("logoUpload").value = "";
  $("logoUpload").click();
}
$("logoUpload").addEventListener("change", (e) => readPhoto(e.target.files[0]));
$("logoUpload").addEventListener("cancel", () => {
  pendingAdd = false;
});
$("uploadButton").addEventListener("click", () => choosePhoto());
for (const type of ["dragenter", "dragover"])
  $("uploadButton").addEventListener(type, (e) => {
    e.preventDefault();
    $("uploadButton").classList.add("is-dragging");
  });
$("uploadButton").addEventListener("dragleave", () =>
  $("uploadButton").classList.remove("is-dragging"),
);
$("uploadButton").addEventListener("drop", (e) => {
  e.preventDefault();
  $("uploadButton").classList.remove("is-dragging");
  readPhoto(e.dataTransfer.files[0]);
});
// A dropped file outside the target must not navigate away and lose the order.
window.addEventListener("dragover", (e) => {
  if (e.dataTransfer.types.includes("Files")) e.preventDefault();
});
window.addEventListener("drop", (e) => {
  if (e.dataTransfer.types.includes("Files")) e.preventDefault();
});

document.querySelectorAll("[data-shape]").forEach((button) =>
  button.addEventListener("click", () => {
    originalVisible = false;
    current().shape = button.dataset.shape;
    invalidate();
    render();
  }),
);
$("keepBackground").addEventListener("click", () => {
  const d = current();
  d.background = "keep";
  d.source = cloneCanvas(d.original);
  d.undo = [];
  selectingSubject = false;
  originalVisible = false;
  invalidate();
  syncBackground();
  error();
  render();
});
function selectSubject() {
  selectingSubject = true;
  originalVisible = false;
  cursor = { x: 0.5, y: 0.5 };
  syncBackground();
  error();
  render();
  $("editorCanvas").focus({ preventScroll: true });
}
$("removeBackground").addEventListener("click", selectSubject);
$("recutButton").addEventListener("click", selectSubject);
async function runCut(point) {
  if (busy || !selectingSubject) return;
  const d = current(),
    stamp = version;
  error();
  setBusy(
    true,
    "Removing the background…",
    "The first cut takes a little longer. Your photo stays here.",
  );
  $("cutProgress").value = 0;
  try {
    const result = await cutSubject(d.original, point, (percent) => {
      $("cutProgress").value = percent;
    });
    if (stamp !== version) return;
    d.source = result;
    d.cut = cloneCanvas(result);
    d.background = "cut";
    d.undo = [];
    centerSubject(d);
    selectingSubject = false;
    invalidate();
    syncBackground();
    $("studioStatus").textContent =
      "Background removed. Continue to adjust your cookie.";
  } catch (e) {
    error(
      e.message ||
        "The cutout did not work. Try another spot or keep your whole photo.",
    );
  } finally {
    setBusy(false);
    render();
  }
}
function centerSubject(d) {
  const { width: w, height: h } = d.source,
    data = d.source.getContext("2d").getImageData(0, 0, w, h).data;
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2)
      if (data[(y * w + x) * 4 + 3] > 128) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
  if (maxX <= minX || maxY <= minY) return;
  const base = photoRect(w, h, { zoom: 1, x: 0, y: 0, fit: "cover" });
  const zoom = Math.min(
    3,
    0.78 / Math.max(((maxX - minX) / w) * base.w, ((maxY - minY) / h) * base.h),
  );
  d.view = { zoom: Math.max(0.5, zoom), x: 0, y: 0, fit: "cover" };
  const r = photoRect(w, h, d.view);
  d.view.x = 0.5 - (r.x + ((minX + maxX) / 2 / w) * r.w);
  d.view.y = 0.5 - (r.y + ((minY + maxY) / 2 / h) * r.h);
}

function setTool(next) {
  tool = next;
  originalVisible = false;
  document
    .querySelectorAll("[data-tool]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.tool === tool)),
    );
  $("positionControls").hidden = tool !== "move";
  $("brushControls").hidden = tool === "move";
  $("undoEdit").disabled = !current().undo.length;
  render();
}
document
  .querySelectorAll("[data-tool]")
  .forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
$("doneEdges").addEventListener("click", () => setTool("move"));
$("zoom").addEventListener("input", () => {
  originalVisible = false;
  current().view.zoom = Number($("zoom").value) / 100;
  invalidate();
  render();
});
$("fitPhoto").addEventListener("click", () => {
  originalVisible = false;
  current().view = { zoom: 1, x: 0, y: 0, fit: "contain" };
  invalidate();
  render();
});
$("resetPosition").addEventListener("click", () => {
  originalVisible = false;
  current().view = { zoom: 1, x: 0, y: 0, fit: "cover" };
  invalidate();
  render();
});
$("brushSize").addEventListener("input", () => {
  $("brushValue").textContent = $("brushSize").value;
  render();
});
function brushRadius(c) {
  return (
    ((Number($("brushSize").value) / 500) * Math.max(c.width, c.height)) / 2
  );
}
function rememberStroke() {
  const d = current();
  d.undo.push(cloneCanvas(d.source));
  if (d.undo.length > 12) d.undo.shift();
  $("undoEdit").disabled = false;
}
function paint(point) {
  const d = current(),
    ctx = d.source.getContext("2d"),
    x = point.x * d.source.width,
    y = point.y * d.source.height;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, brushRadius(d.source), 0, Math.PI * 2);
  if (tool === "erase") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fill();
  } else {
    ctx.clip();
    ctx.clearRect(0, 0, d.source.width, d.source.height);
    ctx.drawImage(d.original, 0, 0, d.source.width, d.source.height);
  }
  ctx.restore();
  d.background = "cut";
  invalidate();
  render();
}
$("undoEdit").addEventListener("click", () => {
  const d = current();
  if (!d.undo.length) return;
  d.source = d.undo.pop();
  invalidate();
  $("undoEdit").disabled = !d.undo.length;
  render();
});
function normalized(e, c) {
  const r = c.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
    y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
  };
}
const editor = $("editorCanvas");
editor.addEventListener("pointerdown", (e) => {
  if (busy || originalVisible) return;
  cursor = normalized(e, editor);
  if (selectingSubject) {
    runCut(cursor);
    return;
  }
  if (step !== "finish" || tool === "move") return;
  e.preventDefault();
  editor.setPointerCapture(e.pointerId);
  pointer = { id: e.pointerId, point: cursor };
  rememberStroke();
  paint(cursor);
});
editor.addEventListener("pointermove", (e) => {
  if (!pointer || pointer.id !== e.pointerId || busy) return;
  const p = normalized(e, editor),
    previous = pointer.point;
  const distance = Math.hypot(p.x - previous.x, p.y - previous.y),
    n = Math.max(
      1,
      Math.ceil((distance * 500) / (Number($("brushSize").value) / 3)),
    );
  for (let i = 1; i <= n; i++)
    paint({
      x: previous.x + ((p.x - previous.x) * i) / n,
      y: previous.y + ((p.y - previous.y) * i) / n,
    });
  cursor = p;
  pointer.point = p;
});
function stopPointer() {
  pointer = null;
}
editor.addEventListener("pointerup", stopPointer);
editor.addEventListener("pointercancel", stopPointer);
editor.addEventListener("lostpointercapture", stopPointer);
editor.addEventListener("keydown", (e) => {
  if (busy || originalVisible) return;
  const arrows = {
    ArrowLeft: [-0.02, 0],
    ArrowRight: [0.02, 0],
    ArrowUp: [0, -0.02],
    ArrowDown: [0, 0.02],
  };
  if (arrows[e.key]) {
    e.preventDefault();
    cursor.x = Math.max(0, Math.min(1, cursor.x + arrows[e.key][0]));
    cursor.y = Math.max(0, Math.min(1, cursor.y + arrows[e.key][1]));
    render();
  }
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (selectingSubject) runCut(cursor);
    else if (tool !== "move") {
      rememberStroke();
      paint(cursor);
    }
  }
});
editor.addEventListener("focus", render);
const cookie = $("cookiePreview");
function canPosition() {
  return (
    (step === "shape" || step === "finish") &&
    tool === "move" &&
    !busy &&
    !originalVisible
  );
}
cookie.addEventListener("pointerdown", (e) => {
  if (!canPosition()) return;
  e.preventDefault();
  cookie.setPointerCapture(e.pointerId);
  pointer = {
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    v: { ...current().view },
  };
});
cookie.addEventListener("pointermove", (e) => {
  if (!pointer || pointer.id !== e.pointerId || !pointer.v) return;
  const size = cookie.getBoundingClientRect().width * 0.812;
  current().view.x = Math.max(
    -2,
    Math.min(2, pointer.v.x + (e.clientX - pointer.x) / size),
  );
  current().view.y = Math.max(
    -2,
    Math.min(2, pointer.v.y + (e.clientY - pointer.y) / size),
  );
  invalidate();
  render();
});
cookie.addEventListener("pointerup", stopPointer);
cookie.addEventListener("pointercancel", stopPointer);
cookie.addEventListener("lostpointercapture", stopPointer);
cookie.addEventListener("keydown", (e) => {
  if (!canPosition()) return;
  const arrows = {
    ArrowLeft: [-0.01, 0],
    ArrowRight: [0.01, 0],
    ArrowUp: [0, -0.01],
    ArrowDown: [0, 0.01],
  };
  if (!arrows[e.key]) return;
  e.preventDefault();
  current().view.x += arrows[e.key][0];
  current().view.y += arrows[e.key][1];
  invalidate();
  render();
});
$("originalChip").addEventListener("click", () => {
  originalVisible = !originalVisible;
  render();
});
window.addEventListener("resize", render);

async function approve() {
  const d = current();
  if (!d.file || !d.background)
    throw new Error("Finish your photo design first.");
  if (d.approved) return;
  setBusy(
    true,
    "Saving your design…",
    "Keeping the exact picture you approved.",
  );
  try {
    const art = canvas(1200),
      preview = canvas(1200);
    drawArtwork(art, d);
    drawCookie(preview, d);
    const [artworkBlob, approvedBlob] = await Promise.all([
      blobOf(art),
      blobOf(preview),
    ]);
    d.approved = {
      slot: active + 1,
      file: d.file,
      artworkBlob,
      approvedBlob,
      shape: d.shape,
      background: d.background,
      approvedAt: new Date().toISOString(),
      previewUrl: URL.createObjectURL(approvedBlob),
    };
    window.__mbcOrderUpload?.invalidate();
  } finally {
    setBusy(false);
  }
}
function renderDesigns() {
  $("designTray").hidden = designs.length === 1;
  $("designSlots").replaceChildren();
  designs.forEach((d, i) => {
    const item = document.createElement("div");
    item.className = "design-item";
    const img = document.createElement("img");
    img.src = d.approved?.previewUrl || d.thumbnail;
    img.alt = "Photo " + (i + 1);
    item.append(img);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = i === active ? "Editing" : "Edit";
    button.disabled = i === active;
    button.addEventListener("click", () => {
      active = i;
      $("originalThumb").src = current().thumbnail;
      show("shape");
    });
    item.append(button);
    if (designs.length > 1) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Remove photo " + (i + 1));
      remove.addEventListener("click", () => {
        if (d.approved?.previewUrl) URL.revokeObjectURL(d.approved.previewUrl);
        URL.revokeObjectURL(d.thumbnail);
        designs.splice(i, 1);
        active = Math.min(i < active ? active - 1 : active, designs.length - 1);
        $("originalThumb").src = current().thumbnail;
        syncQuantity();
        renderDesigns();
        render();
      });
      item.append(remove);
    }
    $("designSlots").append(item);
  });
}
$("editDesign").addEventListener("click", () => show("finish"));
$("addDesign").addEventListener("click", async () => {
  try {
    await approve();
    choosePhoto(true);
  } catch (e) {
    error(e.message);
  }
});
window.__mbcDesignStudio = {
  getDesigns() {
    const amounts = quantities(quote().quantity, designs.length);
    return designs.map((d, i) =>
      d.approved ? { ...d.approved, slot: i + 1, quantity: amounts[i] } : null,
    );
  },
  requiredCount() {
    return designs.length;
  },
  openMissing() {
    active = Math.max(
      0,
      designs.findIndex((d) => !d.approved),
    );
    show(current().file ? "review" : "upload");
  },
};
$("continueButton").addEventListener("click", async () => {
  if (busy || !canContinue()) return;
  try {
    if (step === "upload") return choosePhoto();
    if (step === "review") {
      await approve();
      const missing = designs.findIndex((d) => !d.approved);
      if (missing >= 0) {
        active = missing;
        $("originalThumb").src = current().thumbnail;
        show(current().file ? "review" : "upload");
        return;
      }
      syncQuantity();
      show("delivery");
      return;
    }
    if (step === "delivery" && !quote().ready) return;
    show(steps[steps.indexOf(step) + 1]);
  } catch (e) {
    error(e.message);
  }
});
$("backButton").addEventListener("click", () => {
  if (busy) return;
  show(steps[Math.max(0, steps.indexOf(step) - 1)]);
});
window.history.replaceState({ mbcStudio: true, step: "upload" }, "", "#upload");
window.addEventListener("popstate", (e) => {
  if (busy || paymentLocked) {
    window.history.pushState({ mbcStudio: true, step }, "", "#" + step);
    return;
  }
  let next = e.state?.mbcStudio ? e.state.step : "upload";
  if (!steps.includes(next)) next = "upload";
  if (!current().file) next = "upload";
  if (["delivery", "pay"].includes(next) && !designs.every((d) => d.approved))
    next = "review";
  if (next === "pay" && !quote().ready) next = "delivery";
  show(next, { history: false });
});
window.addEventListener("beforeunload", (e) => {
  if (!paid && designs.some((d) => d.file)) {
    e.preventDefault();
    e.returnValue = "";
  }
});
function script(src) {
  return new Promise((resolve, reject) => {
    const node = document.createElement("script");
    node.src = src;
    node.onload = resolve;
    node.onerror = () => {
      node.remove();
      reject(
        new Error(
          "Secure payment could not load. Check your connection and try again.",
        ),
      );
    };
    document.head.append(node);
  });
}
async function loadPayment() {
  if (paymentLoaded) {
    window.mbcTurnstileLoaded?.();
    return;
  }
  if (paymentPromise) return paymentPromise;
  $("paymentLoading").hidden = false;
  $("retryPayment").hidden = true;
  paymentPromise = (async () => {
    if (!window.paypal)
      await script(
        "https://www.paypal.com/sdk/js?client-id=BAAWrqUBSYrM5GuFpN43KZHxZAJvb_39F9mt1SIA4TX2tYQVOo0N9Hmfw-BbC55szL-UoAlsXCOPaW3_fE&currency=USD&intent=capture&enable-funding=card&disable-funding=paylater&components=buttons",
      );
    if (!window.__mbcOrderUpload) await script("buy-now-order.js");
    if (!window.turnstile)
      await script(
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=mbcTurnstileLoaded&render=explicit",
      );
    window.mbcTurnstileLoaded?.();
    paymentLoaded = true;
    $("paymentLoading").hidden = true;
  })()
    .catch((e) => {
      $("paymentLoading").textContent = e.message;
      $("retryPayment").hidden = false;
    })
    .finally(() => {
      paymentPromise = null;
    });
  return paymentPromise;
}
$("retryPayment").addEventListener("click", loadPayment);
window.addEventListener("mbc:paymentstate", (e) => {
  paymentLocked = e.detail.locked;
  $("backButton").disabled = paymentLocked;
  $("footerNote").textContent = paymentLocked
    ? "Finish or cancel in the secure payment window."
    : "Your changes stay here as you go.";
});
window.addEventListener("mbc:orderpaid", (e) => {
  paid = true;
  $("confirmation").textContent =
    "Order " +
    e.detail.orderId +
    ". Your approved photos are with our bakery. Look for your order confirmation by email.";
  show("complete");
});
$("helpButton").addEventListener("click", () => $("helpDialog").showModal());
$("closeHelp").addEventListener("click", () => $("helpDialog").close());
$("helpDialog").addEventListener("click", (e) => {
  if (e.target === $("helpDialog")) {
    const r = $("helpDialog").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      $("helpDialog").close();
  }
});
// Keep an explicit keyboard editing target only while positioning.
new MutationObserver(() => {
  cookie.tabIndex = step === "shape" || step === "finish" ? 0 : -1;
  cookie.setAttribute(
    "aria-label",
    step === "shape" || step === "finish"
      ? "Position your photo. Drag, or use arrow keys to move it."
      : "Your cookie preview",
  );
}).observe(document.body, { attributes: true, attributeFilter: ["data-step"] });
show("upload", { history: false, focus: false });
