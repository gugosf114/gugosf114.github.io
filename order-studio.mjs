import {
  canvas,
  cloneCanvas,
  drawArtwork,
  drawCookie,
  cookiePoint,
  quantities,
  blobOf,
} from "./order-studio-art.mjs?v=corporate-20";
import { cutSubject } from "./order-studio-cutout.mjs";
import { createTemplate } from "./order-studio-designs.mjs?v=corporate-20";
import { initComposer } from "./order-studio-compose.mjs?v=corporate-20";
import { initPackagingFilm } from "./order-packaging-film.mjs?v=film-loop-1";

const $ = (id) => document.getElementById(id);
const panels = [...document.querySelectorAll("[data-panel]")];
const steps = [
  "upload",
  "templates",
  "personalize",
  "ai",
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
    "Say it on<br>a cookie.",
    "A celebration. An inside joke. A little thank-you. Find a design that says it, or make your own.",
    "Explore designs",
    0,
  ],
  templates: [
    "A good place to start",
    "Something very them.",
    "Pick a cookie you love. Keep it as it is, or make it personal.",
    "",
    0,
  ],
  personalize: [
    "Make it personal",
    "Make it yours.",
    "Change the background. Find the words. Add a picture if you like.",
    "Review my cookie",
    1,
  ],
  ai: [
    "AI writing help · optional",
    "Let’s find the words.",
    "A little context is all we need. Your design stays completely in your hands.",
    "",
    0,
  ],
  shape: [
    "Design · 1 of 2",
    "Find your shape.",
    "Pick round or square. Then zoom and drag your photo until it’s just right.",
    "Continue",
    1,
  ],
  background: [
    "Design · 2 of 2",
    "What stays in<br>the picture?",
    "Keep the whole moment, or let your favorite part stand on its own.",
    "Continue",
    1,
  ],
  finish: [
    "Adjust your cookie",
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
  backdrop: null,
  text: null,
  original: null,
  source: null,
  shape: "round",
  background: null,
  cutPoint: null,
  removePoints: [],
  cutUndo: [],
  view: { zoom: 1, x: 0, y: 0, fit: "cover" },
  approved: null,
  thumbnail: null,
  undo: [],
});
let designs = [blank()],
  active = 0,
  step = "upload",
  tool = "move",
  selectingSubject = false,
  selectionMode = null;
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
let preserveComposition = false;
let composer;
let packagingFilm;
const current = () => designs[active];
const hasDesign = (d = current()) => !!(d.file || d.backdrop);
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
  if (!hasDesign()) return false;
  if (step === "personalize" && current().logoRequired && !current().original) return false;
  if (step === "background") return !!current().background && !selectingSubject;
  if (step === "delivery")
    return quote().ready && designs.every((d) => d.approved);
  return true;
}
function show(next, { history = true, focus = true } = {}) {
  if (busy || paymentLocked || (paid && next !== "complete")) return;
  if (
    next === "upload" &&
    hasDesign() &&
    ["shape", "background", "finish", "review", "personalize"].includes(step)
  )
    current().resumeStep = step;
  if (step === "ai" && next !== "ai") composer?.cancelAi();
  step = next;
  packagingFilm?.onStep(next);
  error();
  selectingSubject = false;
  selectionMode = null;
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
  $("continueButton").hidden = ["pay", "complete", "templates", "ai"].includes(
    step,
  );
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
  $("footerPrice").hidden = !hasDesign() || paid;
  $("resumeDesign").hidden = !hasDesign() || paid;
  $("originalChip").hidden =
    !current().file || step === "pay" || step === "delivery" || paid;
  $("blankMark").hidden = true;
  $("designNumber").hidden = !hasDesign();
  $("designNumber").textContent =
    "Design " +
    (active + 1) +
    (designs.length > 1 ? " of " + designs.length : "");
  if (step === "shape") {
    document
      .querySelector('[data-panel="shape"]')
      .insertBefore($("shapeChoices"), $("shapePositionMount"));
    $("shapePositionMount").appendChild($("positionControls"));
    $("positionControls").hidden = false;
  }
  if (step === "templates") composer?.catalog();
  if (step === "personalize") {
    $("composeShapeMount").appendChild($("shapeChoices"));
    composer?.refresh();
  }
  if (step === "review") $("editDesign").hidden = !current().original;
  if (step === "background") {
    $("backgroundPositionMount").appendChild($("positionControls"));
    syncBackground();
  }
  if (step === "finish") {
    $("finishPositionMount").appendChild($("positionControls"));
    setTool("move");
  }
  if (step === "review") {
    $("reviewPositionMount").appendChild($("positionControls"));
    $("positionControls").hidden = false;
    renderDesigns();
  }
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
  if (step === "shape" || step === "personalize") {
    for (const shape of ["round", "square"])
      drawCookie($(shape + "Option"), { ...d, shape });
  }
  document
    .querySelectorAll("[data-shape]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.shape === d.shape)),
    );
  const editingMask = step === "finish" && tool !== "move";
  const raw = editingMask || originalVisible;
  $("originalChip").hidden =
    !d.file ||
    selectingSubject ||
    ["pay", "delivery", "complete"].includes(step);
  document.body.dataset.selection = selectingSubject ? selectionMode : "";
  $("cookiePreview").setAttribute(
    "aria-label",
    selectingSubject
      ? (selectionMode === "remove"
          ? "Tap what you want removed."
          : "Tap what you want to keep.") +
          " Arrow keys move the selection; Enter applies it."
      : "Your cookie preview. Drag or use arrow keys to position your photo.",
  );
  $("photoEditor").hidden = !raw;
  $("cookiePreview").hidden = raw;
  $("blankMark").hidden = true;
  $("previewLabel").textContent = originalVisible
    ? "Your original photo"
    : selectingSubject
      ? selectionMode === "remove"
        ? "Tap what you want removed"
        : "Tap what you want to keep"
      : editingMask
        ? tool === "erase"
          ? "Brush over what you want to remove"
          : "Brush to bring your photo back"
        : hasDesign(d)
          ? "Your cookie, as you make it"
          : "110 designs. Make one yours.";
  $("previewStatus").textContent = originalVisible
    ? "Original upload"
    : selectingSubject
      ? selectionMode === "remove"
        ? "This tap removes an area"
        : "This tap keeps your subject"
      : editingMask
        ? "Your changes appear on the cookie"
        : step === "review"
          ? "This is the artwork you’re approving"
          : hasDesign(d)
            ? "Live preview"
            : "Ready-made. Ready to make your own.";
  $("previewShape").textContent = hasDesign(d)
    ? d.shape === "round"
      ? "Round cookie"
      : "Square cookie"
    : "Photo cookies";
  $("originalChip").querySelector("span").textContent = originalVisible
    ? "Back to cookie"
    : "View original";
  if (raw && d.original)
    drawEditor(originalVisible ? d.original : d.source, editingMask);
  else {
    drawCookie(
      $("cookiePreview"),
      selectingSubject && selectionMode === "keep"
        ? { ...d, source: d.original }
        : step === "upload" && !hasDesign(d)
          ? createTemplate("birthday-wish")
          : d,
    );
    if (selectingSubject && document.activeElement === $("cookiePreview")) {
      const c = $("cookiePreview"),
        ctx = c.getContext("2d");
      ctx.beginPath();
      ctx.arc(cursor.x * c.width, cursor.y * c.height, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = selectionMode === "remove" ? "#ad2844" : "#34745b";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
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
      brushRadius(c),
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
function syncBackground(forceChoices = false) {
  const d = current(),
    result = d.background === "cut" && !forceChoices;
  $("backgroundChoices").hidden = selectingSubject || result;
  $("subjectHint").hidden = !selectingSubject;
  $("cutResultActions").hidden = selectingSubject || !result;
  $("cleanSpot").hidden = !d.cutPoint;
  $("undoCut").disabled = !d.cutUndo.length;
  $("cancelSelection").hidden = !selectingSubject;
  $("positionControls").hidden = selectingSubject || !result;
  $("keepBackground").setAttribute(
    "aria-pressed",
    String(d.background === "keep"),
  );
  $("removeBackground").setAttribute(
    "aria-pressed",
    String(d.background === "cut"),
  );
  if (selectingSubject) {
    const removing = selectionMode === "remove";
    $("stepTitle").textContent = removing
      ? "Tap what you want removed."
      : "Tap what you want to keep.";
    $("stepDescription").textContent = removing
      ? "Choose one unwanted area on the cookie. Your subject stays in place."
      : "Choose the person, pet, or object on your cookie. We'll cut around it.";
    $("subjectHint").textContent = removing
      ? "This tap removes an area. Cancel returns to your cookie."
      : "This tap keeps your subject and removes the background.";
  } else {
    $("stepTitle").innerHTML = result
      ? "How does that look?"
      : copy.background[1];
    $("stepDescription").textContent = result
      ? "Your crop is right where you left it. Keep going, or clean up an unwanted spot."
      : copy.background[2];
  }
  $("continueButton").innerHTML =
    (result ? "Looks good" : "Continue") + ' <span aria-hidden="true">→</span>';
}
function updatePrice() {
  const q = quote();
  $("footerPrice").innerHTML =
    q.quantity + " cookies <strong>" + money(q.subtotal) + "</strong>";
  $("receiptCookies").textContent = q.quantity + " custom cookies";
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
    (designs.length > 1 ? " for " + designs.length + " designs" : "");
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
    const option = new Option(designs.length + " designs", designs.length);
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
  packagingFilm?.stop();
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
    if (preserveComposition) {
      d.backdrop = old.backdrop;
      d.text = old.text;
      d.templateId = old.templateId;
      d.occasion = old.occasion;
      d.logoRequired = old.logoRequired;
      if (d.occasion === 'corporate') {
        d.shape = old.shape;
        d.view = {zoom:.4,x:0,y:-.21,fit:'contain'};
      }
    }
    preserveComposition = false;
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
function choosePhoto(adding = false, withComposition = false) {
  packagingFilm?.stop();
  pendingAdd = adding;
  preserveComposition = withComposition;
  $("logoUpload").value = "";
  $("logoUpload").click();
}
$("logoUpload").addEventListener("change", (e) => readPhoto(e.target.files[0]));
$("logoUpload").addEventListener("cancel", () => {
  pendingAdd = false;
  preserveComposition = false;
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
  d.cutPoint = null;
  d.removePoints = [];
  d.cutUndo = [];
  selectingSubject = false;
  selectionMode = null;
  originalVisible = false;
  invalidate();
  show("review");
});
function selectSubject(mode = "keep") {
  selectingSubject = true;
  selectionMode = mode;
  originalVisible = false;
  cursor = { x: 0.5, y: 0.5 };
  syncBackground();
  error();
  render();
  $("cookiePreview").focus({ preventScroll: true });
  render();
}
$("removeBackground").addEventListener("click", () => selectSubject("keep"));
$("cleanSpot").addEventListener("click", () => selectSubject("remove"));
function cancelSelection() {
  selectingSubject = false;
  selectionMode = null;
  syncBackground();
  error();
  render();
}
$("cancelSelection").addEventListener("click", cancelSelection);
$("changeBackground").addEventListener("click", () => {
  syncBackground(true);
  render();
});
$("undoCut").addEventListener("click", () => {
  const d = current(),
    previous = d.cutUndo.pop();
  if (!previous) return;
  d.source = previous.source;
  d.cutPoint = previous.point;
  d.removePoints = previous.removals;
  d.background = previous.background;
  d.undo = [];
  selectingSubject = false;
  selectionMode = null;
  invalidate();
  syncBackground();
  error();
  render();
});
async function runCut(point) {
  if (busy || !selectingSubject) return;
  const d = current(),
    stamp = version,
    removing = selectionMode === "remove";
  if (removing && !d.cutPoint) return selectSubject("keep");
  if (removing) {
    const pixel = d.source
      .getContext("2d")
      .getImageData(
        Math.min(d.source.width - 1, Math.floor(point.x * d.source.width)),
        Math.min(d.source.height - 1, Math.floor(point.y * d.source.height)),
        1,
        1,
      ).data;
    if (pixel[3] < 12)
      return error(
        "That spot is already clear. Tap an area still visible on the cookie.",
      );
  }
  const keep = removing ? d.cutPoint : point,
    removals = removing ? [...d.removePoints, point] : [];
  error();
  setBusy(
    true,
    removing ? "Removing that spot…" : "Removing the background…",
    removing
      ? "Keeping the rest of your cookie in place."
      : "The first cut takes a little longer. Your photo stays here.",
  );
  $("cutProgress").value = 0;
  try {
    const result = await cutSubject(
      d.original,
      keep,
      (percent) => {
        $("cutProgress").value = percent;
      },
      removals,
    );
    if (stamp !== version) return;
    if (removing) {
      // Cleanup may only remove pixels. A new prediction cannot bring back an old cut.
      const before = canvas(result.width, result.height);
      before
        .getContext("2d")
        .drawImage(d.source, 0, 0, result.width, result.height);
      const ctx = result.getContext("2d"),
        pixels = ctx.getImageData(0, 0, result.width, result.height),
        old = before
          .getContext("2d")
          .getImageData(0, 0, result.width, result.height);
      for (let i = 3; i < pixels.data.length; i += 4)
        pixels.data[i] = Math.min(pixels.data[i], old.data[i]);
      ctx.putImageData(pixels, 0, 0);
    }
    d.cutUndo.push({
      source: cloneCanvas(d.source),
      point: d.cutPoint,
      removals: [...d.removePoints],
      background: d.background || "keep",
    });
    if (d.cutUndo.length > 8) d.cutUndo.shift();
    d.source = result;
    d.cutPoint = keep;
    d.removePoints = removals;
    d.background = "cut";
    d.undo = [];
    selectingSubject = false;
    selectionMode = null;
    invalidate();
    $("studioStatus").textContent = removing
      ? "Spot removed. Undo is available."
      : "Background removed. Your crop is unchanged.";
  } catch (e) {
    error(
      e.message ||
        "The cutout did not work. Try another spot or keep the whole photo.",
    );
  } finally {
    setBusy(false);
    syncBackground();
    render();
  }
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
  current().view = current().logoRequired ? {zoom:.4,x:0,y:-.21,fit:"contain"} : { zoom: 1, x: 0, y: 0, fit: "contain" };
  invalidate();
  render();
});
$("resetPosition").addEventListener("click", () => {
  originalVisible = false;
  current().view = current().logoRequired ? {zoom:.4,x:0,y:-.21,fit:"contain"} : { zoom: 1, x: 0, y: 0, fit: "cover" };
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
    if (tool !== "move") {
      rememberStroke();
      paint(cursor);
    }
  }
});
editor.addEventListener("focus", render);
const cookie = $("cookiePreview");
function canPosition() {
  return (
    ["shape", "finish", "background", "review"].includes(step) &&
    !selectingSubject &&
    tool === "move" &&
    !busy &&
    !originalVisible
  );
}
cookie.addEventListener("pointerdown", (e) => {
  if (selectingSubject && !busy) {
    e.preventDefault();
    cursor = normalized(e, cookie);
    const d = current(),
      source = selectionMode === "keep" ? d.original : d.source;
    const point = cookiePoint(cursor, { ...d, source });
    if (point) runCut(point);
    else error("Tap inside the photo on the cookie.");
    return;
  }
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
  if (selectingSubject && !busy) {
    const moves = {
      ArrowLeft: [-0.02, 0],
      ArrowRight: [0.02, 0],
      ArrowUp: [0, -0.02],
      ArrowDown: [0, 0.02],
    };
    if (moves[e.key]) {
      e.preventDefault();
      cursor.x = Math.max(0, Math.min(1, cursor.x + moves[e.key][0]));
      cursor.y = Math.max(0, Math.min(1, cursor.y + moves[e.key][1]));
      render();
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const d = current(),
        point = cookiePoint(cursor, {
          ...d,
          source: selectionMode === "keep" ? d.original : d.source,
        });
      if (point) runCut(point);
      else error("Move the selection inside your photo.");
    }
    return;
  }
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
  if (d.logoRequired && !d.original) throw new Error("Add your company logo before approving this corporate design.");
  if (!hasDesign(d) || (d.original && !d.background))
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
      file:
        d.file ||
        d.backdrop?.file ||
        new File([artworkBlob], "custom-cookie-design.png", {
          type: "image/png",
        }),
      artworkBlob,
      approvedBlob,
      shape: d.shape,
      background: d.background || "keep",
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
    if (d.approved?.previewUrl || d.thumbnail) {
      img.src = d.approved?.previewUrl || d.thumbnail;
      img.alt = "Design " + (i + 1);
      item.append(img);
    } else {
      const preview = canvas(80);
      drawCookie(preview, d);
      preview.style.width = "38px";
      preview.style.height = "38px";
      item.append(preview);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = i === active ? "Editing" : "Edit";
    button.disabled = i === active;
    button.addEventListener("click", () => {
      active = i;
      if (current().thumbnail) $("originalThumb").src = current().thumbnail;
      show(current().original ? "shape" : "personalize");
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
        if (current().thumbnail) $("originalThumb").src = current().thumbnail;
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
    show(hasDesign() ? "review" : "upload");
  },
};
$("continueButton").addEventListener("click", async () => {
  if (busy || !canContinue()) return;
  try {
    if (step === "upload") return show("templates");
    if (step === "personalize") return show("review");
    if (step === "shape")
      return show(current().original ? "background" : "personalize");
    if (step === "review") {
      await approve();
      const missing = designs.findIndex((d) => !d.approved);
      if (missing >= 0) {
        active = missing;
        if (current().thumbnail) $("originalThumb").src = current().thumbnail;
        show(hasDesign() ? "review" : "upload");
        return;
      }
      syncQuantity();
      show("delivery");
      return;
    }
    if (step === "background") {
      show("review");
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
  if (["templates", "ai", "personalize"].includes(step)) {
    show("upload");
    return;
  }
  if (step === "shape") {
    show(hasDesign() && !current().original ? "personalize" : "upload");
    return;
  }
  if (selectingSubject) {
    cancelSelection();
    return;
  }
  if (step === "finish") {
    show("review");
    return;
  }
  show(
    step === "review"
      ? current().original
        ? "background"
        : "personalize"
      : steps[Math.max(0, steps.indexOf(step) - 1)],
  );
});
window.history.replaceState({ mbcStudio: true, step: "upload" }, "", "#upload");
window.addEventListener("popstate", (e) => {
  if (busy || paymentLocked) {
    window.history.pushState({ mbcStudio: true, step }, "", "#" + step);
    return;
  }
  let next = e.state?.mbcStudio ? e.state.step : "upload";
  if (!steps.includes(next)) next = "upload";
  if (!hasDesign() && !["templates", "ai"].includes(next)) next = "upload";
  if (["delivery", "pay"].includes(next) && !designs.every((d) => d.approved))
    next = "review";
  if (next === "pay" && !quote().ready) next = "delivery";
  show(next, { history: false });
});
window.addEventListener("beforeunload", (e) => {
  if (!paid && designs.some((d) => hasDesign(d))) {
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
// The main cookie supports keyboard framing and explicit keep/remove selection.
new MutationObserver(() => {
  cookie.tabIndex = ["shape", "finish", "background", "review"].includes(step)
    ? 0
    : -1;
}).observe(document.body, { attributes: true, attributeFilter: ["data-step"] });
composer = initComposer({
  current,
  open: show,
  changed() {
    invalidate();
    render();
  },
  error,
  setBusy,
  start(spec) {
    const old = current();
    if (old.thumbnail) URL.revokeObjectURL(old.thumbnail);
    if (old.approved?.previewUrl) URL.revokeObjectURL(old.approved.previewUrl);
    designs[active] = Object.assign(blank(), spec);
    version++;
    invalidate();
    show("personalize");
  },
  addPhoto() {
    choosePhoto(false, true);
  },
  removePhoto() {
    const d = current();
    if (d.thumbnail) URL.revokeObjectURL(d.thumbnail);
    d.file = null;
    d.original = null;
    d.source = null;
    d.thumbnail = null;
    d.background = null;
    d.cutPoint = null;
    d.cutUndo = [];
    d.removePoints = [];
    d.undo = [];
    version++;
    invalidate();
    render();
  },
});
show("upload", { history: false, focus: false });
document.fonts.ready.then(() => {
  render();
  if (step === "templates") composer.catalog();
});

packagingFilm = initPackagingFilm({
  canPlay: () => step === "upload" && !busy,
});
window.__mbcPackagingFilm = packagingFilm;
