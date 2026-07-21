"use client";

import { useRef } from "react";
import { FloatingGlobes } from "@/components/FloatingGlobes";

export function FloatingGlobesSpan({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className="relative">
      {children}
      <FloatingGlobes wrapperRef={wrapperRef} />
    </div>
  );
}
