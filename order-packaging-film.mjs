import { DURATION, filmFrame } from "./order-packaging-timeline.mjs";

// The fixed introduction is rendered from order-packaging-scene.mjs and served
// as H.264 video so playback does not depend on WebGL or graphics settings.
export function initPackagingFilm({ canPlay }) {
  const $ = (id) => document.getElementById(id),
    host = $("packagingFilm"),
    video = $("packagingVideo"),
    launch = $("packagingLaunch"),
    watch = $("packagingWatch"),
    play = $("packagingPlay"),
    skip = $("packagingSkip"),
    seek = $("packagingSeek");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
    mobile = matchMedia("(max-width: 760px)");
  let state = "idle",
    hasPlayed = false,
    visible = true,
    autoPending = false,
    wasPlaying = false,
    timer = 0,
    revision = 0;
  video.muted = true;
  function ui(next) {
    state = next;
    host.dataset.state = next;
    play.textContent =
      next === "playing" ? "Pause" : next === "ended" ? "Replay" : "Play";
    play.setAttribute(
      "aria-label",
      next === "playing"
        ? "Pause packaging animation"
        : "Play packaging animation",
    );
    launch.textContent = hasPlayed
      ? "Replay packaging video · 16 sec"
      : "Play packaging video · 16 sec";
    watch.hidden =
      !canPlay() ||
      next === "playing" ||
      next === "loading" ||
      next === "ended";
    watch.querySelector("strong").textContent =
      next === "ended" ? "Replay animation" : "Play animation";
  }
  function update() {
    seek.value = String(video.currentTime || 0);
    host.dataset.phase = filmFrame(video.currentTime).phase;
    host.dataset.time = String(video.currentTime || 0);
  }
  function stop() {
    clearTimeout(timer);
    revision++;
    autoPending = false;
    wasPlaying = false;
    video.pause();
    host.hidden = true;
    document.body.classList.remove("packaging-mobile");
    video.removeAttribute("src");
    video.load();
    ui("idle");
  }
  function pause() {
    if (state !== "playing") return;
    video.pause();
    ui("paused");
  }
  async function start(manual = true) {
    if (!canPlay() || state === "loading") return;
    if (!manual && (reduced.matches || mobile.matches || hasPlayed)) return;
    if (!manual && (document.hidden || !visible)) {
      autoPending = true;
      return;
    }
    clearTimeout(timer);
    autoPending = false;
    wasPlaying = false;
    hasPlayed = true;
    const current = ++revision;
    host.hidden = false;
    document.body.classList.toggle("packaging-mobile", mobile.matches);
    $("packagingError").hidden = true;
    if (state === "unavailable") {
      video.removeAttribute("src");
      video.load();
    }
    if (!video.getAttribute("src")) video.src = "media/cookie-packaging.mp4";
    if (video.ended || state === "ended") video.currentTime = 0;
    ui("loading");
    if (manual && mobile.matches)
      document.querySelector(".workspace-preview").scrollIntoView({
        block: "start",
        behavior: reduced.matches ? "instant" : "smooth",
      });
    try {
      await video.play();
      if (current === revision && canPlay()) ui("playing");
      else video.pause();
    } catch (e) {
      if (current !== revision) return;
      ui("paused");
      if (e.name !== "NotAllowedError" && e.name !== "AbortError")
        $("packagingError").hidden = false;
    }
  }
  video.addEventListener("timeupdate", update);
  video.addEventListener("playing", () => {
    if (!host.hidden && canPlay()) ui("playing");
  });
  video.addEventListener("ended", () => {
    update();
    ui("ended");
  });
  video.addEventListener("error", () => {
    if (host.hidden) return;
    ui("unavailable");
    $("packagingError").hidden = false;
  });
  video.addEventListener("pause", () => {
    if (state === "playing" && !video.ended) ui("paused");
  });
  play.addEventListener("click", () => {
    if (state === "playing") pause();
    else start(true);
  });
  launch.addEventListener("click", () => {
    if (video.getAttribute("src")) video.currentTime = 0;
    start(true);
  });
  watch.addEventListener("click", (event) => {
    event.preventDefault();
    start(true);
  });
  skip.addEventListener("click", stop);
  seek.addEventListener("input", () => {
    if (!video.getAttribute("src")) return;
    pause();
    video.currentTime = Number(seek.value);
    update();
    ui(video.currentTime >= DURATION ? "ended" : "paused");
  });
  const visibility = () => {
    if (document.hidden || !visible) {
      if (state === "playing") {
        wasPlaying = true;
        pause();
      }
    } else if (autoPending && canPlay()) start(false);
    else if (wasPlaying && state === "paused" && canPlay()) {
      wasPlaying = false;
      start(true);
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
  timer = setTimeout(() => start(false), 650);
  ui("idle");
  return {
    start,
    stop,
    pause,
    onStep(step) {
      if (step !== "upload") stop();
      else ui("idle");
    },
    seek(seconds) {
      if (!video.getAttribute("src")) return;
      pause();
      video.currentTime = Math.max(0, Math.min(DURATION, seconds));
      update();
      ui(video.currentTime >= DURATION ? "ended" : "paused");
    },
    get state() {
      return state;
    },
    get time() {
      return video.currentTime || 0;
    },
    get stats() {
      const q = video.getVideoPlaybackQuality?.();
      return {
        framesRendered: q?.totalVideoFrames || 0,
        droppedFrames: q?.droppedVideoFrames || 0,
        width: video.videoWidth,
        height: video.videoHeight,
      };
    },
  };
}
