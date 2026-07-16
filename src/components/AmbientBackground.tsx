"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Global ambient layer: large blurred gradient blobs that drift slowly,
 * plus a subtle cursor-parallax offset. Runs the whole time the page is
 * open, underneath every section. Transform/opacity only (GPU), no
 * layout-affecting properties, so it stays cheap at 60fps.
 */
export function AmbientBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      blobsRef.current.forEach((blob, i) => {
        if (reduceMotion) return;
        gsap.to(blob, {
          x: i % 2 === 0 ? 80 : -70,
          y: i % 2 === 0 ? -60 : 70,
          duration: 18 + i * 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    }, root);

    // The cursor-parallax loop below is pointless on touch devices (no mouse)
    // and was running forever regardless — one more perpetual rAF loop
    // competing for the main thread on mobile for zero visual benefit there.
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduceMotion || !hasFinePointer) return () => ctx.revert();

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      gsap.set(root, { "--mx": mouse.x * 16, "--my": mouse.y * 16 } as gsap.TweenVars);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 -z-20 overflow-hidden pointer-events-none"
      style={{ transform: "translate3d(var(--mx, 0px), var(--my, 0px), 0)" }}
      aria-hidden="true"
    >
      <div
        ref={(el) => { if (el) blobsRef.current[0] = el; }}
        className="absolute rounded-full blur-[120px] opacity-[0.16]"
        style={{ width: 700, height: 700, top: "-10%", left: "-8%", background: "#d4b500" }}
      />
      <div
        ref={(el) => { if (el) blobsRef.current[1] = el; }}
        className="absolute rounded-full blur-[130px] opacity-[0.1]"
        style={{ width: 800, height: 800, top: "35%", right: "-12%", background: "#e6c520" }}
      />
      <div
        ref={(el) => { if (el) blobsRef.current[2] = el; }}
        className="absolute rounded-full blur-[110px] opacity-[0.12]"
        style={{ width: 600, height: 600, bottom: "-8%", left: "20%", background: "#a08600" }}
      />
    </div>
  );
}
