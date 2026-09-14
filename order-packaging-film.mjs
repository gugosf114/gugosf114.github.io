import { DURATION } from "./order-packaging-timeline.mjs";

export function initPackagingFilm({ getArtwork, canPlay }) {
  const $ = (id) => document.getElementById(id),
    host = $("packagingFilm"),
    mount = $("packagingScene"),
    launch = $("packagingLaunch"),
    play = $("packagingPlay"),
    skip = $("packagingSkip"),
    seek = $("packagingSeek"),
    caption = $("packagingCaption");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    mobile = matchMedia("(max-width: 760px)");
  let scene = null,
    loading = null,
    generation = 0,
    raf = 0,
    last = 0,
    time = 0,
    state = "idle",
    autoTimer = 0,
    wasPlaying = false,
    visible = true,
    paintedAt = 0,
    hasPlayed = false,
    unavailable = false,
    framesRendered = 0,
    autoPending = false;
  const words = {
    cookie: ["A little cookie.", "Your idea, printed on icing."],
    wrap: ["Wrapped one by one.", "A clear sleeve for every cookie."],
    pack: ["Twelve little moments.", "Packed together in a gift box."],
    finish: ["Ready to make their day.", "A window box, finished with a bow."],
    turn: ["A gift worth giving.", "Made by us. Made for your person."],
  };
  function ui(next) {
    state = next;
    host.dataset.state = next;
    play.textContent =
      next === "playing" ? "Pause" : next === "ended" ? "Replay" : "Play";
    play.setAttribute(
      "aria-label",
      next === "playing"
        ? "Pause packaging animation"
        : next === "ended"
          ? "Replay packaging animation"
          : "Play packaging animation",
    );
    launch.textContent =
      next === "unavailable"
        ? "See the gift-box photo"
        : hasPlayed
          ? "Replay the gift-box animation"
          : "See how your cookies are packed · 16 sec";
  }
  function display(t) {
    if (!scene) return;
    const frame = scene.render(t);
    seek.value = String(t);
    const text = words[frame.phase];
    caption.querySelector("strong").textContent = text[0];
    caption.querySelector("span").textContent = text[1];
    host.dataset.phase = frame.phase;
  }
  function tick(stamp) {
    if (state !== "playing" || !scene) return;
    if (!last) last = stamp;
    time = Math.min(DURATION, time + (stamp - last) / 1000);
    last = stamp;
    if (stamp - paintedAt >= 1000 / 30 || time === DURATION) {
      display(time);
      framesRendered++;
      paintedAt = stamp;
    }
    if (time >= DURATION) {
      raf = 0;
      ui("ended");
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    if (state !== "playing") return;
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    ui("paused");
  }
  function fail() {
    unavailable = true;
    cancelAnimationFrame(raf);
    raf = 0;
    generation++;
    scene?.dispose();
    scene = null;
    host.hidden = true;
    document.body.classList.remove("packaging-mobile");
    ui("unavailable");
    launch.textContent = "See the gift-box photo";
  }
  async function start(manual = true) {
    if (!canPlay() || unavailable) return;
    if (!manual && (reduced.matches || mobile.matches || hasPlayed)) return;
    if (!manual && (document.hidden || !visible)) {
      autoPending = true;
      return;
    }
    if (loading) return;
    autoPending = false;
    clearTimeout(autoTimer);
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    framesRendered = 0;
    wasPlaying = false;
    hasPlayed = true;
    host.hidden = false;
    document.body.classList.toggle("packaging-mobile", mobile.matches);
    if (manual && mobile.matches)
      document.querySelector(".workspace-preview").scrollIntoView({
        block: "start",
        behavior: reduced.matches ? "instant" : "smooth",
      });
    launch.disabled = true;
    ui("loading");
    caption.querySelector("strong").textContent = "Your cookie, gift-ready.";
    caption.querySelector("span").textContent = "Preparing the preview…";
    const revision = ++generation;
    if (!scene) {
      loading = import("./order-packaging-scene.mjs")
        .then(({ createPackagingScene }) => {
          if (revision !== generation || !canPlay()) return;
          scene = createPackagingScene(mount, getArtwork(), fail);
        })
        .catch(() => {
          if (revision === generation) fail();
        })
        .finally(() => {
          loading = null;
          launch.disabled = false;
        });
      await loading;
    } else launch.disabled = false;
    if (revision !== generation || !canPlay() || !scene) return;
    time = 0;
    last = 0;
    paintedAt = 0;
    display(0);
    ui("playing");
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    clearTimeout(autoTimer);
    generation++;
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    wasPlaying = false;
    scene?.dispose();
    scene = null;
    host.hidden = true;
    document.body.classList.remove("packaging-mobile");
    launch.disabled = false;
    ui(unavailable ? "unavailable" : "idle");
    autoPending = false;
  }
  play.addEventListener("click", () => {
    if (state === "playing") pause();
    else if (state === "paused" && scene) {
      last = 0;
      ui("playing");
      raf = requestAnimationFrame(tick);
    } else start(true);
  });
  skip.addEventListener("click", stop);
  launch.addEventListener("click", () => {
    if (unavailable)
      window.open(
        "images/gallery/printed/wrapped-cookies-shipping-box.webp",
        "_blank",
        "noopener",
      );
    else start(true);
  });
  seek.addEventListener("input", () => {
    if (!scene) return;
    pause();
    time = Number(seek.value);
    display(time);
    ui(time >= DURATION ? "ended" : "paused");
  });
  const visibility = () => {
    if (document.hidden || !visible) {
      if (state === "playing") {
        wasPlaying = true;
        pause();
      }
    } else if (autoPending && canPlay()) {
      start(false);
    } else if (wasPlaying && state === "paused" && scene && canPlay()) {
      wasPlaying = false;
      last = 0;
      ui("playing");
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", visibility);
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      visibility();
    },
    { threshold: 0.05 },
  );
  observer.observe($("previewStage"));
  reduced.addEventListener("change", () => {
    if (reduced.matches) stop();
  });
  autoTimer = setTimeout(() => start(false), 650);
  const controller = {
    start,
    stop,
    pause,
    onStep(step) {
      if (step !== "upload") stop();
    },
    seek(seconds) {
      if (!scene) return;
      pause();
      time = Math.max(0, Math.min(DURATION, seconds));
      display(time);
      ui(time === DURATION ? "ended" : "paused");
    },
    get state() {
      return state;
    },
    get time() {
      return time;
    },
    get stats() {
      return scene ? { ...scene.stats, framesRendered } : null;
    },
  };
  return controller;
}
