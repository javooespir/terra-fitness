"use client";

import { useLayoutEffect, useRef } from "react";
import { onIdle } from "@/lib/idle";

// Grid lines + radial glow + drifting gold particles, behind a section's
// content. Shared by PricingSection and LocationSection so both read as
// the same "elegí tu forma de entrenar" visual family.
interface SparkleBackgroundProps {
  parentRef: React.RefObject<HTMLElement | null>;
  // Pushes the grid+glow's brightest point down from the section's top edge.
  // Pricing wants it right at 0 (it's part of that section's own hero glow),
  // but a section preceded by another flat-bg section needs an offset so the
  // brightest point doesn't land exactly on the section seam and read as a
  // stray cut line.
  glowOffset?: number;
}

export function SparkleBackground({ parentRef, glowOffset = 0 }: SparkleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const parent = parentRef.current;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    let particles: Array<{ x: number; y: number; r: number; s: number; a: number }> = [];
    let rafId = 0;

    function resize() {
      const rect = parent!.getBoundingClientRect();
      w = canvas!.width = rect.width;
      h = canvas!.height = rect.height;
      const count = Math.round((w * h) / 22000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        s: Math.random() * 0.25 + 0.05,
        a: Math.random() * 0.5 + 0.15,
      }));
    }

    function tick() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = "#e6c520";
      particles.forEach((p) => {
        p.y -= p.s;
        if (p.y < -4) p.y = h + 4;
        ctx!.globalAlpha = p.a;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      });
      ctx!.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    }

    // Two of these mount per page (Pricing + Location), both below the fold —
    // starting the particle loop immediately meant both did real work (canvas
    // sizing + particle array setup) in the same synchronous commit as
    // Hero's own mount. Idle-deferring costs nothing visible: the canvas is
    // just blank for one extra tick either way.
    const cancelIdle = onIdle(() => {
      resize();
      tick();
    });
    window.addEventListener("resize", resize);
    return () => {
      cancelIdle();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [parentRef]);

  return (
    <>
      <div
        className="absolute inset-x-0 bottom-0 opacity-50"
        style={{
          top: glowOffset,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "64px 72px",
          WebkitMaskImage: "radial-gradient(60% 55% at 50% 0%, #000 0%, transparent 75%)",
          maskImage: "radial-gradient(60% 55% at 50% 0%, #000 0%, transparent 75%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 blur-[10px]"
        style={{ top: glowOffset - 192, background: "radial-gradient(ellipse at center, rgba(212,181,0,.28) 0%, transparent 70%)" }}
      />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-55" />
    </>
  );
}
