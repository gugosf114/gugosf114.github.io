import { generateAiDesigns, makeAiDesign } from './order-studio-ai.mjs?v=ai-original-1';
import {
  templates,
  categories,
  personalities,
  matchesPersonality,
  backgrounds,
  createTemplate,
  defaultText,
  messageSuggestions,
  drawBackground,
} from "./order-studio-designs.mjs?v=ai-original-1";
import { drawCookie, canvas } from "./order-studio-art.mjs?v=ai-original-1";

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
    if (brief.length < 10) return api.error("Tell us a little more about the person or occasion.");
    aiController?.abort();
    const controller = new AbortController(); aiController=controller;
    const request = {brief,occasion:$("aiOccasion").value,tone:$("aiTone").value,
      audience:$("aiAudience").value,style:$("aiStyle").value};
    const button=$("generateAiWords"),grid=$("aiSuggestions");
    button.disabled=true;button.textContent="Creating your designs…";
    grid.replaceChildren();grid.setAttribute('aria-busy','true');api.error();
    $("aiStatus").textContent="Imagining three original designs, then painting each background. This can take a minute or two.";
    const cards = Array.from({length:3},(_,index)=>{
      const card=document.createElement('div');card.className='ai-design-card ai-design-pending';
      const art=document.createElement('div');art.className='ai-design-placeholder';art.setAttribute('aria-hidden','true');
      const title=document.createElement('strong');title.textContent='Imagining design '+(index+1)+'…';
      const status=document.createElement('p');status.textContent='Original artwork is on its way.';
      card.append(art,title,status);grid.append(card);return {card,art,title,status};
    });
    let ready=0;
    const timer=setTimeout(()=>controller.abort('timeout'),250000);
    try {
      await generateAiDesigns(request,controller.signal,async event=>{
        if(aiController!==controller || controller.signal.aborted)return;
        if(event.type==='status')$("aiStatus").textContent=event.message;
        if(event.type==='concept') {
          const card=cards[event.index];card.title.textContent=event.concept.title;
          card.status.textContent='Painting an original background…';
        }
        if(event.type==='design_error') {
          const card=cards[event.index];card.card.classList.remove('ai-design-pending');
          card.art.remove();card.status.textContent=event.message;
        }
        if(event.type==='design') {
          const design=await makeAiDesign(event,request);
          if(aiController!==controller || controller.signal.aborted)return;
          const {card,art,title,status}=cards[event.index];
          const preview=canvas(440);preview.className='ai-generated-preview';
          drawCookie(preview,design);preview.setAttribute('aria-label','Cookie design: '+design.text.message);
          art.replaceWith(preview);title.textContent=event.concept.title;status.textContent=design.text.message;
          card.classList.remove('ai-design-pending');
          const use=document.createElement('button');use.type='button';use.className='ai-use-design';use.textContent='Make this mine';
          use.addEventListener('click',()=>{api.start(design);chooseTab('words');});card.append(use);
          ready++;$("aiStatus").textContent=ready+' of 3 designs ready. You can choose one now.';
        }
        if(event.type==='done') {
          if(!ready)throw new Error('No artwork finished this time. Please try again.');
          $("aiStatus").textContent=ready+' original designs ready. Choose one, edit the words, or try another background.';
        }
      });
    } catch(e) {
      if(aiController!==controller)return;
      if(e.name==='AbortError' && controller.signal.reason!=='timeout')return;
      api.error(e.name==='AbortError'?'The artist took too long. Try again; any finished designs are still here.':e.message);
      $("aiStatus").textContent=ready?'You can still use any completed design.':'You can try again or continue with your own design.';
    } finally {
      clearTimeout(timer);
      if(aiController===controller){
        aiController=null;button.disabled=false;button.textContent='Create three original designs';grid.setAttribute('aria-busy','false');
        for(const item of cards)if(item.card.classList.contains('ai-design-pending')){
          item.card.classList.remove('ai-design-pending');item.art.remove();item.status.textContent='This concept did not finish. You can try again.';
        }
      }
    }
  });
  $("regenerateAiBackground").addEventListener('click',async()=>{
    const active=draft();if(!active.ai?.token)return;
    aiController?.abort();const controller=new AbortController();aiController=controller;
    const button=$("regenerateAiBackground");button.disabled=true;
    $("aiBackgroundStatus").textContent='Painting a new background. Your current design stays here until it is ready.';api.error();
    const timer=setTimeout(()=>controller.abort('timeout'),210000);
    let replaced=false;
    try {
      await generateAiDesigns({mode:'background',token:active.ai.token,refinement:$("aiBackgroundRefinement").value.trim()},controller.signal,async event=>{
        if(event.type==='design_error')throw new Error(event.message);
        if(event.type==='design') {
          const replacement=await makeAiDesign(event,active.ai.request);
          if(api.current()!==active || controller.signal.aborted)return;
          change(d=>{d.backdrop=replacement.backdrop;d.ai={...d.ai,token:replacement.ai.token};});
          replaced=true;refresh();$("aiBackgroundStatus").textContent='New background ready. Your words, photo, and positioning are unchanged.';
        }
      });
      if(!replaced && api.current()===active)throw new Error('No new background arrived. Please try again.');
    } catch(e) {
      if(api.current()!==active || (e.name==='AbortError' && controller.signal.reason!=='timeout'))return;
      api.error(e.name==='AbortError'?'The new background took too long. Your current design is still here.':e.message);
      $("aiBackgroundStatus").textContent='Your current background is unchanged.';
    } finally {
      clearTimeout(timer);if(aiController===controller)aiController=null;button.disabled=false;
    }
  });
  function refresh() {
    const d = draft();
    $("aiBackgroundTools").hidden = !d.ai?.token;
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

    $("backgroundUploadStatus").textContent = d.backdrop.id === "ai-generated" ? "Original AI artwork. Your wording and photos remain separate and editable." : d.backdrop.file
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
