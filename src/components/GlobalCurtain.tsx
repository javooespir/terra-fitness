"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";

function subscribeReduceMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReduceMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReduceMotionServerSnapshot() {
  return false;
}

// How long the welcome screen holds before splitting open. It waits for the
// page to actually finish loading (so slow mobile connections get real cover
// time instead of revealing a half-loaded page), but never blocks longer
// than MAX_HOLD, and never feels like a flash even on a fast load.
// These are the HOLD only — the split animation itself adds ~0.64s on top,
// so total time-to-reveal is ~0.94s-1.54s. Still read as "trabado" at the
// previous 1.36-2.06s total, so trimmed further.
const MIN_HOLD = 300;
const MAX_HOLD = 900;

// HeroSection starts its own marquee ticker + ribbon-open sequence on its own
// mount timer, unaware the curtain is still covering it — so by the time the
// curtain opened, the ticker had already scrolled well past its starting
// position and the ribbon had sometimes already opened once, revealing a
// "cut" mid-phrase instead of the clean start. Signal Hero (and anything else
// that cares) the moment the reveal actually begins, so animations that need
// to be seen from their start can wait for that instead of guessing.
export function signalCurtainReady() {
  window.dispatchEvent(new Event("curtain-ready"));
  (window as unknown as { __curtainReady?: boolean }).__curtainReady = true;
}

/**
 * Plays once per page load: a light gray panel with the Terra Fitness logo
 * covers the viewport, then splits horizontally (top half up, bottom half
 * down) revealing the page underneath, like a curtain opening.
 */
export function GlobalCurtain() {
  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    getReduceMotionSnapshot,
    getReduceMotionServerSnapshot
  );
  const [mounted, setMounted] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  // Reduced motion skips the curtain entirely (render returns null below) —
  // still has to tell Hero the reveal "happened" so its own intro isn't stuck
  // waiting forever for a signal that would otherwise never come.
  useEffect(() => {
    if (reduceMotion) {
      signalCurtainReady();
      document.documentElement.classList.add("curtain-done");
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const logo = logoRef.current;
    if (!top || !bottom || !logo) return;

    document.body.style.overflow = "hidden";

    let cancelled = false;
    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });

    gsap.set(logo, { opacity: 0, scale: 0.92 });
    gsap.to(logo, { opacity: 1, scale: 1, duration: 0.5, delay: 0.1, ease: "power2.out" });

    const t0 = performance.now();
    let rafId = 0;
    const waitForReady = () => {
      if (cancelled) return;
      const elapsed = performance.now() - t0;
      if ((loaded && elapsed >= MIN_HOLD) || elapsed >= MAX_HOLD) {
        runSplit();
      } else {
        rafId = requestAnimationFrame(waitForReady);
      }
    };

    function runSplit() {
      signalCurtainReady();
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          document.documentElement.classList.add("curtain-done");
          setMounted(false);
        },
      });
      tl.to(logo, { opacity: 0, duration: 0.12, ease: "power2.in" })
        .to(top, { yPercent: -100, duration: 0.5, ease: "power4.inOut" }, "+=0.02")
        .to(bottom, { yPercent: 100, duration: 0.5, ease: "power4.inOut" }, "<");
    }

    rafId = requestAnimationFrame(waitForReady);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = "";
      gsap.killTweensOf([top, bottom, logo]);
    };
  }, [reduceMotion]);

  if (reduceMotion || !mounted) return null;

  return (
    <div className="fixed inset-0 z-[300] pointer-events-none" aria-hidden="true">
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-[#d8d8d6]" />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-[#d8d8d6]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={logoRef}
        src="/logo.png"
        alt=""
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 z-10"
      />
    </div>
  );
}
