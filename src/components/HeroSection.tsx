"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface Slide {
  video: string;
  videoDesktop: string;
  photo: string;
  ribbonColor: string;
  ribbonText: string;
  ribbon: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

const slides: Slide[] = [
  {
    video: "/videos/hero-1.mp4",
    videoDesktop: "/videos/hero-1-desktop.mp4",
    photo: "/gimnasio1.jpg",
    ribbonColor: "#d4b500",
    ribbonText: "#0a0a0a",
    ribbon: "ENTRENÁ EN GRUPO",
    title: "ENTRENÁ EN GRUPO",
    subtitle: "Clases grupales de alta intensidad, todos los días de la semana.",
    cta: "Ver clases",
    href: "#servicios",
  },
  {
    video: "/videos/hero-2.mp4",
    videoDesktop: "/videos/hero-2-desktop.mp4",
    photo: "/photos/plate-graffiti.jpg",
    ribbonColor: "#e6c520",
    ribbonText: "#0a0a0a",
    ribbon: "TU MEJOR VERSIÓN",
    title: "TU MEJOR VERSIÓN",
    subtitle: "Profesores reales acompañando cada entrenamiento.",
    cta: "Ver planes",
    href: "#planes",
  },
  {
    video: "/videos/hero-3.mp4",
    videoDesktop: "/videos/hero-3-desktop.mp4",
    photo: "/gimnasio-3.jpg",
    ribbonColor: "#0a0a0a",
    ribbonText: "#d4b500",
    ribbon: "SIN LÍMITES",
    title: "SIN LÍMITES",
    subtitle: "Acceso ilimitado, horarios flexibles, resultados de verdad.",
    cta: "Sumate ahora",
    href: "#planes",
  },
];

const RIBBON_HOLD = 0.8;
// Used to hold the first play longer than normal cycles to give a beat to
// read the ticker text — but stacked on top of the curtain's own reveal time,
// any extra hold here reads as the page being frozen/stuck on load (reported
// repeatedly). First play now uses the same timing as every other cycle.
const FIRST_RIBBON_HOLD = RIBBON_HOLD;
const SPLIT_DUR = 0.7;
const HOLD_VIDEO = 4.2;
const PEEK = 46;

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const bgPhotoRef = useRef<HTMLImageElement>(null);
  const ribbonTopRef = useRef<HTMLDivElement>(null);
  const ribbonBottomRef = useRef<HTMLDivElement>(null);
  const trackTopRef = useRef<HTMLDivElement>(null);
  const trackBottomRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const subtitleRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const ctaRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const fillRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const hero = heroRef.current;
    const bgPhoto = bgPhotoRef.current;
    const ribbonTop = ribbonTopRef.current;
    const ribbonBottom = ribbonBottomRef.current;
    const trackTop = trackTopRef.current;
    const trackBottom = trackBottomRef.current;
    if (!hero || !bgPhoto || !ribbonTop || !ribbonBottom || !trackTop || !trackBottom) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function buildTicker(text: string) {
      return Array.from({ length: 8 })
        .map(() => `<span class="ribbon-word">${text}</span><span class="ribbon-gap"><i class="ribbon-icon" aria-hidden="true"></i></span>`)
        .join("");
    }

    function initRibbonContent(i: number) {
      const s = slides[i];
      ribbonTop!.style.background = s.ribbonColor;
      ribbonBottom!.style.background = s.ribbonColor;
      trackTop!.style.color = s.ribbonText;
      trackBottom!.style.color = s.ribbonText;
      const repeated = buildTicker(s.ribbon);
      trackTop!.innerHTML = repeated;
      trackBottom!.innerHTML = repeated;
    }

    function animateRibbonColor(i: number, duration: number) {
      const s = slides[i];
      gsap.to([ribbonTop, ribbonBottom], { backgroundColor: s.ribbonColor, duration, ease: "power1.inOut" });
    }

    function setRibbonText(i: number) {
      const s = slides[i];
      const repeated = buildTicker(s.ribbon);
      gsap.to([trackTop, trackBottom], {
        opacity: 0,
        duration: 0.18,
        onComplete: () => {
          trackTop!.style.color = s.ribbonText;
          trackBottom!.style.color = s.ribbonText;
          trackTop!.innerHTML = repeated;
          trackBottom!.innerHTML = repeated;
          gsap.to([trackTop, trackBottom], { opacity: 1, duration: 0.22 });
        },
      });
    }

    function setBgPhoto(i: number) {
      bgPhoto!.src = slides[i].photo;
    }

    function startMarquee(track: HTMLDivElement) {
      const half = track.scrollWidth / 2;
      gsap.fromTo(track, { x: 0 }, { x: -half, duration: 16, ease: "none", repeat: -1 });
    }

    let topOpenY = 0;
    let bottomOpenY = 0;
    function computeTravel() {
      const heroRect = hero!.getBoundingClientRect();
      const topRect = ribbonTop!.getBoundingClientRect();
      const bottomRect = ribbonBottom!.getBoundingClientRect();
      topOpenY = -((topRect.top - heroRect.top) + (topRect.height - PEEK));
      bottomOpenY = (heroRect.bottom - bottomRect.bottom) + (bottomRect.height - PEEK);
    }

    function activateSlide(i: number) {
      slideRefs.current.forEach((el, si) => {
        if (!el) return;
        el.style.zIndex = si === i ? "3" : "2";
        gsap.set(el, { opacity: 0 });
      });
      const video = videoRefs.current[i];
      if (video) {
        gsap.set(video, { scale: 1 });
        video.currentTime = 0;
        // Mobile Safari can reject play() when called before enough data is
        // buffered (silently swallowing that error left the video frozen on
        // its first/black frame forever — no retry). Retry once data is
        // actually available instead of giving up after one attempt.
        const tryPlay = () => video.play().catch(() => {});
        tryPlay();
        if (video.readyState < 3) {
          video.addEventListener("canplay", tryPlay, { once: true });
        }
      }
      videoRefs.current.forEach((v, si) => {
        if (si !== i) v?.pause();
      });
    }

    let killed = false;
    let firstPlay = true;

    function runSlide(i: number) {
      if (killed) return;
      const el = slideRefs.current[i];
      const video = videoRefs.current[i];
      const title = titleRefs.current[i];
      const subtitle = subtitleRefs.current[i];
      const cta = ctaRefs.current[i];
      const next = (i + 1) % slides.length;
      if (!el || !video || !title || !subtitle || !cta) return;

      // Re-measure right before building this cycle's timeline: mobile browser
      // chrome (address bar collapse) can shift layout between mount and now.
      computeTravel();
      activateSlide(i);
      gsap.set([title, subtitle, cta], { opacity: 0, y: 30, filter: "blur(8px)" });
      slides.forEach((_, si) => gsap.set(fillRefs.current[si], { scaleX: 0 }));

      if (reduceMotion) {
        gsap.set(bgPhoto, { opacity: 0 });
        gsap.set(el, { opacity: 1 });
        gsap.set(video, { scale: 1 });
        gsap.set([title, subtitle, cta], { opacity: 1, y: 0, filter: "blur(0px)" });
        return;
      }

      const hold = i === 0 && firstPlay ? FIRST_RIBBON_HOLD : RIBBON_HOLD;
      firstPlay = false;

      const tl = gsap.timeline({ onComplete: () => runSlide(next) });
      const cycle = hold + SPLIT_DUR + HOLD_VIDEO + SPLIT_DUR;
      tl.to(fillRefs.current[i], { scaleX: 1, duration: cycle, ease: "none" }, 0);

      // Function-based targets: GSAP reads these at the moment the tween actually
      // starts playing (`hold` later), not when the timeline is built — so a
      // late address-bar-collapse resize that updates topOpenY/bottomOpenY in the
      // meantime is still picked up instead of animating to a stale baked-in number.
      tl.to(ribbonTop, { y: () => topOpenY, duration: SPLIT_DUR, ease: "power4.inOut" }, hold);
      tl.to(ribbonBottom, { y: () => bottomOpenY, duration: SPLIT_DUR, ease: "power4.inOut" }, hold);
      tl.to(bgPhoto, { opacity: 0, duration: SPLIT_DUR, ease: "power2.inOut" }, hold);
      tl.to(el, { opacity: 1, duration: SPLIT_DUR, ease: "power2.inOut" }, hold);

      tl.to(video, { scale: 1.06, duration: SPLIT_DUR + HOLD_VIDEO + SPLIT_DUR, ease: "none" }, hold);

      const openDone = hold + SPLIT_DUR;
      tl.to(title, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, openDone - 0.15);
      tl.to(subtitle, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, openDone + 0.02);
      tl.to(cta, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }, openDone + 0.2);

      const closeStart = openDone + HOLD_VIDEO;
      tl.to([title, subtitle, cta], { opacity: 0, y: -12, filter: "blur(6px)", duration: 0.4, stagger: 0.04 }, closeStart - 0.35);

      tl.call(() => { setRibbonText(next); setBgPhoto(next); }, undefined, closeStart - 0.02);
      tl.call(() => animateRibbonColor(next, SPLIT_DUR * 1.6), undefined, closeStart - 0.25);

      tl.to(ribbonTop, { y: 0, duration: SPLIT_DUR, ease: "power4.inOut" }, closeStart);
      tl.to(ribbonBottom, { y: 0, duration: SPLIT_DUR, ease: "power4.inOut" }, closeStart);
      tl.to(bgPhoto, { opacity: 1, duration: SPLIT_DUR, ease: "power2.inOut" }, closeStart);
      tl.to(el, { opacity: 0, duration: SPLIT_DUR, ease: "power2.inOut" }, closeStart);
    }

    setBgPhoto(0);
    gsap.set(bgPhoto, { opacity: 1 });
    initRibbonContent(0);
    gsap.set([ribbonTop, ribbonBottom], { y: 0 });
    computeTravel();

    const onResize = () => computeTravel();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    // Mobile browsers resize the visual viewport (address bar collapsing, etc.)
    // shortly after first paint — a measurement taken before that settles can
    // leave the ribbon's open-position stuck at a stale (often zero-ish) value,
    // so it visually never splits open. Wait for a couple stable frames before
    // starting the very first slide rather than guessing at a fixed delay.
    let settleId = 0;
    let settleFrames = 0;
    let lastTravel = NaN;
    const settlePoll = () => {
      computeTravel();
      settleFrames++;
      if (topOpenY !== lastTravel && settleFrames < 20) {
        lastTravel = topOpenY;
        settleId = requestAnimationFrame(settlePoll);
      } else {
        runSlide(0);
      }
    };

    // The marquee + ribbon-open sequence used to start the instant this effect
    // ran, with no idea the GlobalCurtain was still covering the screen — by
    // the time the curtain opened, the ticker had already scrolled off its
    // starting phrase (and sometimes the ribbon had already opened once),
    // showing a "cut" mid-animation instead of a clean start. Wait for the
    // curtain's reveal signal so what's first visible is the actual start.
    let started = false;
    function beginAnimating() {
      if (started || killed) return;
      started = true;
      if (!reduceMotion) {
        startMarquee(trackTop!);
        startMarquee(trackBottom!);
      }
      settleId = requestAnimationFrame(settlePoll);
    }
    if ((window as unknown as { __curtainReady?: boolean }).__curtainReady) {
      beginAnimating();
    } else {
      window.addEventListener("curtain-ready", beginAnimating, { once: true });
    }
    // Safety net in case the curtain never signals for any reason.
    const fallbackId = window.setTimeout(beginAnimating, 2600);

    return () => {
      killed = true;
      cancelAnimationFrame(settleId);
      window.clearTimeout(fallbackId);
      window.removeEventListener("curtain-ready", beginAnimating);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      gsap.killTweensOf([ribbonTop, ribbonBottom, trackTop, trackBottom, bgPhoto]);
      slideRefs.current.forEach((el) => el && gsap.killTweensOf(el));
      videoRefs.current.forEach((v) => v && gsap.killTweensOf(v));
      titleRefs.current.forEach((el) => el && gsap.killTweensOf(el));
      subtitleRefs.current.forEach((el) => el && gsap.killTweensOf(el));
      ctaRefs.current.forEach((el) => el && gsap.killTweensOf(el));
      fillRefs.current.forEach((el) => el && gsap.killTweensOf(el));
    };
  }, []);

  return (
    <section ref={heroRef} className="relative h-[100vh] w-full overflow-hidden bg-[#0a0a0a]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={bgPhotoRef} alt="" className="absolute inset-0 z-[1] w-full h-full object-cover" />

      {slides.map((slide, i) => (
        <div
          key={slide.video}
          ref={(el) => { slideRefs.current[i] = el; }}
          className="absolute inset-0 z-[2]"
          style={{ opacity: 0 }}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            poster={slide.photo}
            muted
            loop
            playsInline
            // Only the first slide needs to be ready immediately. Preloading
            // all 3 (~26MB) delayed the window "load" event on mobile long
            // enough that by the time it fired, the user had usually already
            // scrolled into the first pinned section — and the refresh()
            // that "load" triggers (see SmoothScroll) recalculates every
            // pin's spacer height, which visibly jumps the page mid-scroll
            // if it fires while one is active. The poster + canplay-retry
            // logic already covers slides 1/2 from ever showing black.
            preload={i === 0 ? "auto" : "metadata"}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
          >
            {/* Desktop hero renders much wider (object-cover on a portrait
                source has to upscale to cover a wide landscape viewport) —
                the mobile-sized file went visibly soft there. Browser picks
                whichever <source> matches BEFORE downloading anything, so
                each device only ever fetches the one it needs. */}
            <source src={slide.videoDesktop} media="(min-width: 768px)" />
            <source src={slide.video} />
          </video>
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 h-full flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
              <h1
                ref={(el) => { titleRefs.current[i] = el; }}
                className="font-black uppercase text-white leading-[0.95] mb-5 will-change-transform"
                style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(2.6rem, 7vw, 6rem)" }}
              >
                {slide.title}
              </h1>
              <p
                ref={(el) => { subtitleRefs.current[i] = el; }}
                className="text-gray-200 text-base sm:text-lg mb-8 max-w-lg mx-auto will-change-transform"
              >
                {slide.subtitle}
              </p>
              <a
                ref={(el) => { ctaRefs.current[i] = el; }}
                href={slide.href}
                className="inline-flex items-center justify-center gap-2 bg-[#d4b500] text-black font-bold uppercase tracking-wider px-9 py-4 text-sm hover:bg-[#e6c520] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(200,168,0,0.4)] will-change-transform"
              >
                {slide.cta}
                <span className="text-base">→</span>
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Ribbon band — bounded rectangle crossing the fixed photo, not a full curtain.
          Thinner on mobile so more of the static photo shows behind it. */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none h-[18vh] min-h-[130px] sm:h-[22vh] sm:min-h-[160px] lg:h-[30vh] lg:min-h-0"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        <div
          ref={ribbonTopRef}
          className="absolute left-0 w-full h-1/2 top-0 flex items-end overflow-hidden"
        >
          <div ref={trackTopRef} className="flex whitespace-nowrap will-change-transform translate-y-1/2 [&_.ribbon-word]:font-black [&_.ribbon-word]:uppercase [&_.ribbon-word]:leading-none [&_.ribbon-word]:inline-block [&_.ribbon-word]:px-[1.6vw] [&_.ribbon-gap]:inline-flex [&_.ribbon-gap]:items-center" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(2rem, 6.5vw, 6rem)" }} />
        </div>
        <div
          ref={ribbonBottomRef}
          className="absolute left-0 w-full h-1/2 bottom-0 flex items-start overflow-hidden"
        >
          <div ref={trackBottomRef} className="flex whitespace-nowrap will-change-transform -translate-y-1/2 [&_.ribbon-word]:font-black [&_.ribbon-word]:uppercase [&_.ribbon-word]:leading-none [&_.ribbon-word]:inline-block [&_.ribbon-word]:px-[1.6vw] [&_.ribbon-gap]:inline-flex [&_.ribbon-gap]:items-center" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(2rem, 6.5vw, 6rem)" }} />
        </div>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <div key={i} className="relative h-[3px] w-10 bg-white/25 overflow-hidden">
            <div
              ref={(el) => { fillRefs.current[i] = el; }}
              className="absolute inset-0 bg-[#d4b500] origin-left"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
