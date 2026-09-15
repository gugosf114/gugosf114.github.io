import {
  templates,
  categories,
  personalities,
  matchesPersonality,
  backgrounds,
  createTemplate,
  defaultText,
  messageSuggestions,
  suggestAiMessages,
  drawBackground,
} from "./order-studio-designs.mjs?v=square-default-1";
import { drawCookie, canvas } from "./order-studio-art.mjs?v=square-default-1";

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
  let thumbnailObserver;
  function catalog() {
    thumbnailObserver?.disconnect();
    $("templateGrid").replaceChildren();
    const collection = templates.filter(t => occasion === "all" || t.occasion === occasion);
    const results = collection.filter(t => matchesPersonality(t, tone));
    $("catalogSummary").textContent = results.length + " designs" + (occasion === "all" ? " across " + categories.length + " categories" : " · " + categories.find(c => c.id === occasion).name);
    $("edgyNote").hidden = occasion !== "edgy" && tone !== "edgy";
    $("catalogEmpty").hidden = results.length !== 0;
    thumbnailObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        drawCookie(entry.target, createTemplate(entry.target.dataset.templateId));
        thumbnailObserver.unobserve(entry.target);
      }
    }, {rootMargin:'450px'}) : null;
    for (const spec of results) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "template-card";
      card.dataset.template = spec.id;
      const preview = canvas(420);
      preview.setAttribute("aria-hidden", "true");
      preview.dataset.templateId = spec.id;
      if (thumbnailObserver) thumbnailObserver.observe(preview);
      else drawCookie(preview, createTemplate(spec.id));
      const name = document.createElement("strong");
      name.textContent = spec.name;
      const label = document.createElement("span");
      label.textContent = categories.find(c => c.id === spec.occasion).name + " · " +
        (spec.occasion === "edgy" ? "Grown-up humor" : personalities.find(p => p.id === spec.tone).name);
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
          accent: background.accent || null,
          image: null,
        };
        d.text.color = background.ink;
      });
      refresh();
    });
    $("backgroundGrid").append(button);
  }
  $("useBackgroundMessage").addEventListener("click", () => {
    const choice = backgrounds.find(background => background.id === draft().backdrop.id);
    if (!choice?.suggestedMessage) return;
    change(d => { d.text.message = choice.suggestedMessage; });
    chooseTab('words'); refresh();
  });
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
  $("corporateUploadLogo").addEventListener('click',()=>api.addPhoto());
  $("corporateBrandColor").addEventListener('input',()=>change(d=>{d.backdrop.accent=$('corporateBrandColor').value;}));
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
              (t) => t.occasion === selectedOccasion && matchesPersonality(t, selectedTone),
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
    $("corporateLogoTools").hidden = d.occasion !== 'corporate';
    $("corporateUploadLogo").textContent = d.original ? 'Replace company logo' : 'Upload company logo';
    $("corporateLogoStatus").textContent = d.original ? 'Your logo is in place. All wording stays editable.' : 'Add your logo to continue. PNG, JPG or WebP.';
    $("corporateBrandColor").value = d.backdrop.accent || '#55ddd0';
    for (const [id, [key]] of Object.entries(bindings))
      $(id).value = ["size", "x", "y"].includes(key)
        ? Math.round(d.text[key] * 100)
        : d.text[key];
    $("designBackgroundColor").value = d.backdrop.color;
    const backgroundInfo = backgrounds.find(background => background.id === d.backdrop.id);
    $("backgroundMood").hidden = !backgroundInfo?.description;
    $("backgroundMood").textContent = backgroundInfo?.description || '';
    $("useBackgroundMessage").hidden = !backgroundInfo?.suggestedMessage;
    $("useBackgroundMessage").textContent = backgroundInfo?.suggestedMessage ? 'Use this line: “' + backgroundInfo.suggestedMessage.replace(/\n/g, ' ') + '”' : '';

    $("backgroundUploadStatus").textContent = d.backdrop.file
      ? "Using " + d.backdrop.file.name
      : "JPG, PNG or WebP · up to 20 MB. Fills the cookie behind your photo and words.";
    $("personalizationLabel").textContent =
      d.occasion === "corporate" ? "Company, team, date, or milestone" : d.occasion === "anniversary"
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
    if (d.occasion === 'corporate') {
      $("composeAddPhoto").textContent = d.original ? 'Replace company logo' : 'Upload company logo';
      $("composePhotoHint").textContent = 'Add your company logo. It starts fitted above the message, and you can resize or reposition it.';
    }
    $("composeEditPhoto").textContent = d.occasion === 'corporate' ? 'Resize or clean up logo' : 'Crop or remove its background';
    $("composeRemovePhoto").textContent = d.occasion === 'corporate' ? 'Remove logo' : 'Remove photo from design';
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
