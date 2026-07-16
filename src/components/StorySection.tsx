"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onIdle } from "@/lib/idle";

gsap.registerPlugin(ScrollTrigger);

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+";
const randomChar = () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
const BADGE_TEXT = "Activá tu cuerpo";

const photos = [
  "/photos/plate-graffiti.jpg",
  "/photos/woman-training.jpg",
  "/photos/floor-atmosphere.jpg",
  "/photos/dumbbell-40kg.jpg",
  "/photos/plate-rack-warm.jpg",
  "/photos/crowd-training.jpg",
  "/photos/pullup-action-1.jpg",
  "/photos/coach-back-1.jpg",
  "/photos/cable-machine-floor.jpg",
  "/photos/dumbbell-rack-row.jpg",
  "/photos/terra-tee-dumbbell.jpg",
  "/photos/coach-back-2.jpg",
];

// top/left mark each tile's CENTER (see translate(-50%,-50%) below), not its
// corner — anchoring by corner meant the right-side tiles' far edge ran past
// the viewport on narrow phones and got clipped invisible by overflow-x
// hidden, which read as "everything's pushed to the left."
//
// 4 even rows of 3, all spaced the same ~28% apart — the previous layout
// crammed 5 tiles into the top row and only 2 into the middle rows, so the
// top row was heavily overlapped/compressed while the middle felt far
// bigger and closer. Uniform spacing reads as "parejo" front to back.
const layout = [
  { top: "9%", left: "22%", rotate: -8 },
  { top: "11%", left: "50%", rotate: 6 },
  { top: "9%", left: "78%", rotate: -9 },
  { top: "34%", left: "20%", rotate: 5 },
  { top: "36%", left: "50%", rotate: -6 },
  { top: "34%", left: "80%", rotate: 7 },
  { top: "59%", left: "22%", rotate: -6 },
  { top: "61%", left: "50%", rotate: 8 },
  { top: "59%", left: "78%", rotate: -5 },
  { top: "83%", left: "20%", rotate: 6 },
  { top: "84%", left: "50%", rotate: -7 },
  { top: "83%", left: "80%", rotate: 4 },
];
const stackRotate = [-4, 3, -2, 5, -6, 2, -1, 4, -3, 1, -5, 2];
const GROUP_SIZE = 3;
const GROUP_STEP = 0.22;
const GROUP_SPAN = 0.3;

export function StorySection() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const grayRef = useRef<HTMLSpanElement>(null);
  const blackRef = useRef<HTMLSpanElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const stackWrapRef = useRef<HTMLDivElement>(null);
  const idWordRef = useRef<HTMLImageElement>(null);
  const idWordFrontRef = useRef<HTMLImageElement>(null);
  const wavePathRef = useRef<SVGPathElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctasRef = useRef<HTMLDivElement>(null);

  // Small TextReveal badge (21st.dev): glitch letters + yellow highlight
  // box wiping open from center, once on scroll-enter.
  useEffect(() => {
    const container = badgeRef.current;
    const gray = grayRef.current;
    const black = blackRef.current;
    const mask = maskRef.current;
    const yellowBg = yellowRef.current;
    if (!container || !gray || !black || !mask || !yellowBg) return;

    // Hide immediately — cheap, no DOM creation involved — so there's no
    // flash of plain unstyled text before the (deferred, below) letter
    // splitting + glitch timeline finishes setting up.
    gsap.set(container, { opacity: 0, y: 20, filter: "blur(10px)" });
    gsap.set(mask, { clipPath: "inset(0 50% 0 50%)" });
    gsap.set(yellowBg, { scaleX: 0, transformOrigin: "50% 50%" });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(container, { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(mask, { clipPath: "inset(0 0% 0 0%)" });
      gsap.set(yellowBg, { scaleX: 1 });
      return;
    }

    let ctx: gsap.Context | null = null;
    const cancelIdle = onIdle(() => {

    const letters = BADGE_TEXT.split("");
    letters.forEach((letter) => {
      const g = document.createElement("span");
      g.textContent = letter === " " ? " " : letter;
      gray.appendChild(g);
      const b = document.createElement("span");
      b.textContent = letter === " " ? " " : letter;
      black.appendChild(b);
    });
    const grayLetters = Array.from(gray.children) as HTMLSpanElement[];
    const blackLetters = Array.from(black.children) as HTMLSpanElement[];
    gsap.set(grayLetters, { color: "#5a5a5a" });

    ctx = gsap.context(() => {
      const d = 1.7;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: container, start: "top 65%", once: true },
        defaults: { ease: "power3.out" },
      });

      tl.to(container, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 * d, ease: "power4.out" }, 0);
      tl.to(grayLetters, { color: "#8f8f8f", duration: 0.5 * d, stagger: 0.015 * d, ease: "power2.out" }, 0.2 * d);
      tl.to(mask, { clipPath: "inset(0 0% 0 0%)", duration: 0.55 * d, ease: "power4.inOut" }, 0.3 * d);
      tl.to(yellowBg, { scaleX: 1, duration: 0.55 * d, ease: "power4.inOut" }, 0.3 * d);

      letters.forEach((letter, i) => {
        if (letter === " ") return;
        const glitchStart = 0.35 * d + Math.random() * 0.1 * d;
        const glitchSpan = 0.15 * d + Math.random() * (0.4 * d);
        const totalFlickers = 5 + Math.floor(Math.random() * 4);
        const letterTl = gsap.timeline();
        for (let f = 0; f < totalFlickers; f++) {
          letterTl.call(
            () => {
              const c = randomChar();
              if (grayLetters[i]) grayLetters[i].textContent = c;
              if (blackLetters[i]) blackLetters[i].textContent = c;
            },
            undefined,
            (f / totalFlickers) * glitchSpan
          );
        }
        letterTl.call(
          () => {
            if (grayLetters[i]) grayLetters[i].textContent = letter;
            if (blackLetters[i]) blackLetters[i].textContent = letter;
          },
          undefined,
          glitchSpan
        );
        tl.add(letterTl, glitchStart);
      });
    }, container);
    });

    return () => {
      cancelIdle();
      ctx?.revert();
    };
  }, []);

  // Pinned photo stack: scattered tiles join in staggered groups, TERRA
  // eases in front of the deck on the final stretch.
  useEffect(() => {
    const stackWrap = stackWrapRef.current;
    const idWord = idWordRef.current;
    const idWordFront = idWordFrontRef.current;
    const wavePath = wavePathRef.current;
    const ctas = ctasRef.current;
    if (!stackWrap || !idWord || !idWordFront || !wavePath || !ctas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hand the tiles' transform over to GSAP up front (xPercent/yPercent for
    // the center-anchor, rotation for the scatter tilt) regardless of motion
    // preference — this is just the static base layout, not the animation.
    // The scroll-scrub tween further down also writes to `transform` via
    // x/y/rotation — GSAP only preserves components it already knows about,
    // so setting the center offset via a plain CSS string (bypassing GSAP)
    // got silently wiped the instant the tween engaged, snapping every tile
    // toward its corner the moment scrolling started. Cheap, so it runs
    // immediately — no flash of raw top-left-anchored tiles.
    tileRefs.current.forEach((tile, i) => {
      if (!tile) return;
      gsap.set(tile, { xPercent: -50, yPercent: -50, rotation: layout[i].rotate });
    });
    gsap.set(ctas, { opacity: 0, y: 20 });

    if (reduceMotion) {
      gsap.set(ctas, { opacity: 1, y: 0 });
      return;
    }

    // This section sits right after Hero — barely any scroll distance before
    // a user can reach it. Idle-deferring the pin creation here (like the
    // sections further down) meant a fast scroll on first load could cross
    // where the pin should engage before it existed yet, so it never pinned
    // at all: the photos just scrolled past in their raw scattered layout
    // with no reveal. Has to stay synchronous.
    const ctx = gsap.context(() => {
      const stackTl = gsap.timeline({
        // scrub:1's up-to-1s catch-up lag can let a fast scroll/swipe cross this
        // short pin's whole range before the reveal ever paints (see the same
        // fix in ClassesShowcaseSection) — tighter scrub tracks scroll closely
        // enough that it can't be outrun, plus a little more distance as buffer.
        scrollTrigger: { trigger: stackWrap, start: "top top", end: "+=130%", scrub: 0.3, pin: true },
      });

      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        const rect = tile.getBoundingClientRect();
        const wrapRect = stackWrap.getBoundingClientRect();
        const centerX = wrapRect.width / 2;
        const centerY = wrapRect.height / 2;
        const tileCenterX = rect.left - wrapRect.left + rect.width / 2;
        const tileCenterY = rect.top - wrapRect.top + rect.height / 2;
        const group = Math.floor(i / GROUP_SIZE);
        stackTl.to(
          tile,
          {
            x: centerX - tileCenterX,
            y: centerY - tileCenterY,
            rotation: stackRotate[i],
            scale: 0.95,
            ease: "none",
            duration: GROUP_SPAN,
          },
          group * GROUP_STEP
        );
      });

      const waveLen = wavePath.getTotalLength();
      gsap.set(wavePath, { strokeDasharray: waveLen, strokeDashoffset: waveLen });
      stackTl.to(wavePath, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);

      stackTl.to(ctas, { opacity: 1, y: 0, ease: "none", duration: 0.15 }, 0.92);

      // TERRA logo eases in front of the fully-formed deck as a cross-dissolve: a second
      // copy sits above the photos the whole time at opacity 0, and fades/scales in
      // over the back copy instead of an instant z-index cut. The back copy fades out
      // in the same stretch so it doesn't linger as a ghost once the front one settles.
      gsap.set(idWordFront, { opacity: 0, scale: 0.97 });
      stackTl.to(idWordFront, { opacity: 1, scale: 1.08, ease: "power2.out", duration: 0.18 }, 0.78);
      stackTl.to(idWordFront, { scale: 1, ease: "power2.inOut", duration: 0.16 }, 0.96);
      stackTl.to(idWord, { opacity: 0, ease: "power2.out", duration: 0.18 }, 0.78);
    }, stackWrap);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative bg-[#1c1a10]">
      {/* Big attention-grabbing badge, timed to land right as the photo stack arrives.
          Links straight to Planes — it's the CTA of the section, not just decoration. */}
      <a href="#planes" className="flex justify-center px-6 pt-24 pb-16 sm:pt-32 sm:pb-20 cursor-pointer">
        <div
          ref={badgeRef}
          role="text"
          aria-label={BADGE_TEXT}
          className="relative inline-block max-w-full whitespace-nowrap will-change-transform"
          style={{
            fontFamily: "var(--font-barlow-condensed)",
            // Montserrat runs noticeably wider per-character than the old
            // Barlow Condensed this clamp was tuned for — at the old 2.4rem
            // floor, "ACTIVÁ TU CUERPO" ran past the screen edge on narrow
            // phones instead of staying centered.
            fontSize: "clamp(1.5rem, 6vw, 5.5rem)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}
        >
          <span ref={grayRef} aria-hidden="true" className="block px-[0.7em] py-[0.3em]" style={{ color: "#5a5a5a" }} />
          <div ref={maskRef} aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div ref={yellowRef} className="absolute inset-0" style={{ backgroundColor: "#e6c520" }} />
            <span ref={blackRef} className="relative block px-[0.7em] py-[0.3em]" style={{ color: "#0a0a0a" }} />
          </div>
        </div>
      </a>

      {/* Pinned: scattered photos converge into a messy deck, TERRA comes forward at the end */}
      <div ref={stackWrapRef} className="relative h-screen overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={idWordRef}
          src="/terra-mancuerna-white.png"
          alt=""
          className="absolute inset-0 z-[1] m-auto w-[70vw] max-w-[820px] h-auto pointer-events-none select-none will-change-transform"
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path
            ref={wavePathRef}
            d="M -20 200 C 200 150, 260 500, 500 450 S 850 250, 1020 550"
            fill="none"
            stroke="#e6c520"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
        </svg>

        {photos.map((src, i) => (
          <div
            key={src}
            ref={(el) => { tileRefs.current[i] = el; }}
            className="absolute z-[3] w-[112px] sm:w-[160px] md:w-[230px] lg:w-[300px] xl:w-[360px] overflow-hidden border border-white/10 will-change-transform"
            style={{
              aspectRatio: "4/3",
              top: layout[i].top,
              left: layout[i].left,
              boxShadow: "0 20px 40px rgba(0,0,0,.5)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={idWordFrontRef}
          aria-hidden="true"
          src="/terra-mancuerna-white.png"
          alt=""
          className="absolute inset-0 z-[15] m-auto w-[70vw] max-w-[820px] h-auto pointer-events-none select-none will-change-transform"
        />

        <div ref={ctasRef} className="absolute bottom-14 left-0 right-0 z-30 flex gap-4 flex-wrap justify-center px-4">
          <a
            href="#ubicacion"
            className="rounded-full border border-[#e6c520] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#e6c520] transition-colors hover:bg-[#e6c520] hover:text-[#1c1a10]"
          >
            Cómo llegar
          </a>
          <a
            href="#planes"
            className="rounded-full border border-[#e6c520] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#e6c520] transition-colors hover:bg-[#e6c520] hover:text-[#1c1a10]"
          >
            Reservar clase
          </a>
        </div>
      </div>
    </section>
  );
}
