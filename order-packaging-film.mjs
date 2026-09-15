import { filmFrame } from "./order-packaging-timeline.mjs?v=rounded-pops-1";

// A silent, once-per-visit introduction. Ordering always takes priority.
export function initPackagingFilm({ canPlay }) {
  const host = document.getElementById("packagingFilm"),
    video = document.getElementById("packagingVideo");
  let state = "idle",
    started = false,
    stopped = false,
    visible = true,
    pending = false,
    resumeWhenVisible = false,
    revision = 0;
  const phoneLayout = matchMedia('(max-width: 760px)');
  function mobileInteraction() {
    if (phoneLayout.matches) {
      host.setAttribute('role', 'button');
      host.setAttribute('tabindex', '0');
      host.setAttribute('aria-label', 'Explore cookie designs below');
    } else {
      host.removeAttribute('role');
      host.removeAttribute('tabindex');
      host.setAttribute('aria-label', 'A cookie being wrapped and packed into a twelve-cookie gift box');
    }
  }
  function exploreDesigns() {
    if (!phoneLayout.matches || !canPlay()) return;
    document.querySelector('.start-paths').scrollIntoView({behavior:'smooth', block:'start'});
  }
  host.addEventListener('click', exploreDesigns);
  host.addEventListener('keydown', event => {
    if (phoneLayout.matches && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); exploreDesigns();
    }
  });
  phoneLayout.addEventListener('change', mobileInteraction);
  mobileInteraction();
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.controls = false;
  video.loop = true;
  const ui = (next) => {
    state = next;
    host.dataset.state = next;
  };
  const removeRetry = () => {
    document.removeEventListener("pointerdown", retry);
    document.removeEventListener("keydown", retry);
  };
  function update() {
    host.dataset.phase = filmFrame(video.currentTime || 0).phase;
    host.dataset.time = String(video.currentTime || 0);
  }
  function stop() {
    stopped = true;
    revision++;
    pending = false;
    resumeWhenVisible = false;
    removeRetry();
    video.pause();
    host.hidden = true;
    video.removeAttribute("src");
    video.load();
    ui("idle");
  }
  function fallback() {
    if (stopped) return;
    revision++;
    pending = false;
    resumeWhenVisible = false;
    removeRetry();
    video.pause();
    host.hidden = true;
    ui("unavailable");
  }
  async function start(resume = false) {
    if (
      stopped ||
      !canPlay() ||
      state === "loading" ||
      state === "ended" ||
      (started && !resume)
    )
      return;
    if (document.hidden || !visible) {
      pending = true;
      return;
    }
    pending = false;
    resumeWhenVisible = false;
    started = true;
    host.hidden = false;
    const attempt = ++revision;
    if (!video.getAttribute("src")) video.src = "media/cookie-packaging.mp4?v=rounded-pops-1";
    ui("loading");
    try {
      await video.play();
      if (attempt !== revision || stopped || !canPlay()) {
        video.pause();
        return;
      }
      removeRetry();
      if (document.hidden || !visible) {
        resumeWhenVisible = true;
        video.pause();
        ui("paused");
      } else ui("playing");
    } catch (error) {
      if (attempt !== revision || stopped) return;
      if (error.name === "NotAllowedError") {
        ui("blocked");
        document.addEventListener("pointerdown", retry, { passive: true });
        document.addEventListener("keydown", retry);
      } else if (error.name === "AbortError") ui("paused");
      else fallback();
    }
  }
  function retry() {
    if (state === "blocked" && canPlay() && !stopped) start(true);
  }
  function visibility() {
    if (document.hidden || !visible) {
      if (state === "playing") {
        resumeWhenVisible = true;
        video.pause();
        ui("paused");
      }
    } else if (pending && !started) start();
    else if (resumeWhenVisible && state === "paused") start(true);
  }
  video.addEventListener("timeupdate", update);
  video.addEventListener("playing", () => {
    if (!stopped && !host.hidden && canPlay() && !video.paused) ui("playing");
  });
  video.addEventListener("ended", () => {
    update();
    resumeWhenVisible = false;
    removeRetry();
    ui("ended");
  });
  video.addEventListener("error", () => {
    if (!host.hidden) fallback();
  });
  document.addEventListener("visibilitychange", visibility);
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      visibility();
    },
    { threshold: 0.05 },
  );
  observer.observe(document.getElementById("previewStage"));
  queueMicrotask(() => start());
  return {
    stop,
    onStep(step) {
      if (step !== "upload") stop();
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
