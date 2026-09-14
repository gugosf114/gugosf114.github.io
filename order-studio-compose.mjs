import {
  templates,
  backgrounds,
  createTemplate,
  defaultText,
  messageSuggestions,
  suggestAiMessages,
  drawBackground,
} from "./order-studio-designs.mjs";
import { drawCookie, canvas } from "./order-studio-art.mjs";

export function initComposer(api) {
  const $ = (id) => document.getElementById(id);
  let occasion = "all",
    tone = "all",
    tab = "words",
    aiController = null;
  const draft = () => {
    const d = api.current();
    d.text ??= defaultText();
    d.backdrop ??= { id: "paper", color: "#fffdf8", image: null };
    return d;
  };
  const change = (fn) => {
    fn(draft());
    api.changed();
  };
  function chooseTab(next) {
    tab = next;
    document
      .querySelectorAll("[data-compose-tab]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.composeTab === tab)),
      );
    document.querySelectorAll("[data-compose-panel]").forEach((p) => {
      p.hidden = p.dataset.composePanel !== tab;
      p.inert = p.hidden;
    });
  }
  document
    .querySelectorAll("[data-compose-tab]")
    .forEach((b) =>
      b.addEventListener("click", () => chooseTab(b.dataset.composeTab)),
    );
  function catalog() {
    $("templateGrid").replaceChildren();
    for (const spec of templates.filter(
      (t) =>
        (occasion === "all" || t.occasion === occasion) &&
        (tone === "all" || t.tone === tone),
    )) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "template-card";
      card.dataset.template = spec.id;
      const preview = canvas(420);
      preview.setAttribute("aria-hidden", "true");
      drawCookie(preview, createTemplate(spec.id));
      const name = document.createElement("strong");
      name.textContent = spec.name;
      const label = document.createElement("span");
      label.textContent =
        {
          birthday: "Birthday",
          anniversary: "Anniversary",
          thanks: "Thank you",
        }[spec.occasion] +
        " · " +
        spec.tone;
      const action = document.createElement("small");
      action.textContent = "Use this design";
      card.append(preview, label, name, action);
      card.addEventListener("click", () => {
        api.start(createTemplate(spec.id));
        chooseTab("words");
      });
      $("templateGrid").append(card);
    }
  }
  $("occasionFilters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-occasion]");
    if (!b) return;
    occasion = b.dataset.occasion;
    document
      .querySelectorAll("[data-occasion]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.occasion === occasion)),
      );
    catalog();
  });
  $("catalogTone").addEventListener("change", () => {
    tone = $("catalogTone").value;
    catalog();
  });
  $("browseDesigns").addEventListener("click", () => api.open("templates"));
  $("resumeDesign").addEventListener("click", () =>
    api.open(api.current().resumeStep || "personalize"),
  );
  $("makeOwn").addEventListener("click", () => {
    api.start({
      backdrop: { id: "paper", color: "#fffdf8", image: null },
      text: defaultText(),
    });
    chooseTab("backdrop");
  });
  $("startAi").addEventListener("click", () => api.open("ai"));
  $("editComposition").addEventListener("click", () => {
    api.open("personalize");
    chooseTab("words");
  });
  const bindings = {
    designMessage: ["message", String],
    designPersonalization: ["personalization", String],
    designFont: ["font", String],
    designTextColor: ["color", String],
    designTextSize: ["size", (v) => Number(v) / 100],
    designTextX: ["x", (v) => Number(v) / 100],
    designTextY: ["y", (v) => Number(v) / 100],
  };
  for (const [id, [key, convert]] of Object.entries(bindings))
    $(id).addEventListener("input", () =>
      change((d) => {
        d.text[key] = convert($(id).value);
      }),
    );
  document.querySelectorAll("[data-text-place]").forEach((b) =>
    b.addEventListener("click", () => {
      change((d) => {
        d.text.x = 0.5;
        d.text.y = { top: 0.25, middle: 0.5, bottom: 0.75 }[
          b.dataset.textPlace
        ];
      });
      $("designTextX").value = 50;
      $("designTextY").value = draft().text.y * 100;
    }),
  );
  for (const background of backgrounds) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "background-choice";
    button.dataset.backdrop = background.id;
    button.setAttribute("aria-pressed", "false");
    const swatch = canvas(100);
    drawBackground(swatch.getContext("2d"), 100, background);
    swatch.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.textContent = background.name;
    button.append(swatch, name);
    button.addEventListener("click", () => {
      change((d) => {
        d.backdrop = {
          id: background.id,
          color: background.color,
          image: null,
        };
        d.text.color = background.ink;
      });
      refresh();
    });
    $("backgroundGrid").append(button);
  }
  $("designBackgroundColor").addEventListener("input", () => {
    change((d) => {
      d.backdrop = {
        id: "custom",
        color: $("designBackgroundColor").value,
        image: null,
      };
    });
    refresh();
  });
  $("uploadBackground").addEventListener("click", () => {
    $("backgroundUpload").value = "";
    $("backgroundUpload").click();
  });
  $("backgroundUpload").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 20 * 1024 * 1024
    )
      return api.error("Choose a JPG, PNG or WebP background under 20 MB.");
    const active = api.current();
    let bitmap;
    api.setBusy(
      true,
      "Opening your background…",
      "Fitting the image behind your design.",
    );
    try {
      bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height)),
        image = canvas(
          Math.round(bitmap.width * scale),
          Math.round(bitmap.height * scale),
        );
      image.getContext("2d").drawImage(bitmap, 0, 0, image.width, image.height);
      if (active !== api.current()) return;
      change((d) => {
        d.backdrop = { id: "uploaded", color: "#fffdf8", image, file };
      });
      refresh();
    } catch {
      api.error("That background could not be opened. Try another picture.");
    } finally {
      bitmap?.close();
      api.setBusy(false);
    }
  });
  $("composeAddPhoto").addEventListener("click", () => api.addPhoto());
  $("composeEditPhoto").addEventListener("click", () => api.open("shape"));
  $("composeRemovePhoto").addEventListener("click", () => {
    api.removePhoto();
    refresh();
  });
  $("showMessageIdeas").addEventListener("click", () => {
    const box = $("messageIdeas");
    box.hidden = !box.hidden;
    if (box.hidden) return;
    box.replaceChildren();
    for (const text of messageSuggestions(
      draft().occasion || "birthday",
      "sweet",
    )) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = text;
      button.addEventListener("click", () => {
        change((d) => {
          d.text.message = text;
        });
        refresh();
        box.hidden = true;
      });
      box.append(button);
    }
  });
  $("generateAiWords").addEventListener("click", async () => {
    const brief = $("aiBrief").value.trim();
    if (brief.length < 10)
      return api.error(
        "Tell us a little more—at least a few words about the person or occasion.",
      );
    const button = $("generateAiWords");
    button.disabled = true;
    $("aiSuggestions").replaceChildren();
    $("aiStatus").textContent = "Finding a few ways to say it…";
    api.error();
    aiController = new AbortController();
    const timer = setTimeout(() => aiController.abort(), 30000);
    try {
      const selectedOccasion = $("aiOccasion").value,
        selectedTone = $("aiTone").value;
      const results = await suggestAiMessages(
        {
          brief,
          occasion: selectedOccasion,
          tone: selectedTone,
          audience: $("aiAudience").value,
        },
        aiController.signal,
      );
      for (const message of results) {
        const suggestion = document.createElement("button");
        suggestion.type = "button";
        suggestion.className = "ai-suggestion";
        const quote = document.createElement("strong");
        quote.textContent = message;
        const hint = document.createElement("span");
        hint.textContent = "Start with this";
        suggestion.append(quote, hint);
        suggestion.addEventListener("click", () => {
          const spec =
            templates.find(
              (t) => t.occasion === selectedOccasion && t.tone === selectedTone,
            ) || templates.find((t) => t.occasion === selectedOccasion);
          const design = createTemplate(spec.id);
          design.text.message = message;
          api.start(design);
          chooseTab("words");
        });
        $("aiSuggestions").append(suggestion);
      }
      $("aiStatus").textContent =
        "Three ideas, ready to make your own. Review the wording before using it.";
    } catch (e) {
      $("aiStatus").textContent =
        "You can still choose a ready-made design or write your own message.";
      api.error(
        e.name === "AbortError"
          ? "The writing assistant took too long. Please try again."
          : e.message,
      );
    } finally {
      clearTimeout(timer);
      aiController = null;
      button.disabled = false;
    }
  });
  function refresh() {
    const d = draft();
    for (const [id, [key]] of Object.entries(bindings))
      $(id).value = ["size", "x", "y"].includes(key)
        ? Math.round(d.text[key] * 100)
        : d.text[key];
    $("designBackgroundColor").value = d.backdrop.color;
    $("backgroundUploadStatus").textContent = d.backdrop.file
      ? "Using " + d.backdrop.file.name
      : "JPG, PNG or WebP · up to 20 MB. Fills the cookie behind your photo and words.";
    $("personalizationLabel").textContent =
      d.occasion === "anniversary"
        ? "Names, a date, or your own little extra"
        : d.occasion === "birthday"
          ? "A name, age, or your own little extra"
          : "A name or your own little extra";
    document
      .querySelectorAll("[data-backdrop]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.backdrop === d.backdrop.id),
        ),
      );
    $("composeEditPhoto").hidden = !d.original;
    $("composeRemovePhoto").hidden = !d.original;
    $("composeAddPhoto").textContent = d.original
      ? "Choose a different photo"
      : "Add a photo";
    $("composePhotoHint").textContent = d.original
      ? "Your photo is part of this design. Crop it, remove its background, or try another."
      : "A picture is optional. A face, a pet, or a favorite moment makes it personal.";
    chooseTab(tab);
  }
  return {
    refresh,
    catalog,
    cancelAi() {
      aiController?.abort();
    },
  };
}
