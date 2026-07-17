"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Lenis intercepts every scroll input and re-drives it through its own
    // eased rAF loop, kept in sync with ScrollTrigger via lenis.on("scroll").
    // On mobile Safari that virtual scroll position can desync from the real
    // one — most visibly on a fast direction reversal, or when the address
    // bar collapsing/expanding changes the viewport mid-gesture — and a
    // pinned section briefly renders against the stale position before the
    // next sync catches up. That's the "old background flashes, then fixes
    // itself" glitch. iOS's native momentum scroll is already smooth, so
    // there's nothing Lenis needs to add there — only run it on devices with
    // a real mouse wheel.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    if (!isTouchDevice) {
      lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time) => lenis!.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // With several sibling components each creating their own pinned ScrollTrigger on
    // mount, later ones can get measured before earlier ones' pin-spacers finish sizing.
    // One refresh after everything has painted re-syncs every trigger's start/end.
    // (Unrelated to Lenis — needed on every device, touch included.)
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    // If "load" fires late (slow network, heavy video) and the user has
    // already scrolled into a pinned section by then, its start/end were
    // measured against layout that hadn't settled yet (fonts/video not sized)
    // and stay wrong for the rest of the session — the pin engages at the
    // wrong scroll position, which reads as the section stalling or the
    // previous section's background bleeding through. Refreshing can cause a
    // one-time small jump, but that beats a pin whose boundaries are wrong
    // for the whole visit, so always refresh here regardless of scroll depth.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    // Safari's back-forward cache can restore this page from an in-memory
    // snapshot without re-running any of it — every GSAP tween, ScrollTrigger
    // pin, and canvas rAF loop is frozen at whatever state it was in when the
    // user navigated away (mid-fade, mid-pin, sometimes mid-`gsap.set` hide).
    // Nothing re-executes, so the page can render as blank/half-hidden forever.
    // A full reload re-runs everything from a clean state instead of trying to
    // reconcile GSAP's live object model against a stale DOM snapshot.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("pageshow", onPageShow);
      if (lenis) lenis.destroy();
      if (tick) gsap.ticker.remove(tick);
    };
  }, []);

  return <>{children}</>;
}
