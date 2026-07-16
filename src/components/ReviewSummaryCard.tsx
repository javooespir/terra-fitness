"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { motion, animate, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReviewSummaryCardProps {
  rating: number;
  reviewCount: number;
  maxRating?: number;
  summaryText: string;
  className?: string;
}

export function ReviewSummaryCard({
  rating,
  reviewCount,
  maxRating = 5,
  summaryText,
  className,
}: ReviewSummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLSpanElement>(null);
  const reviewCountRef = useRef<HTMLSpanElement>(null);
  // The card was far down the page but this ran on mount — by the time
  // anyone scrolled to it the count-up had finished ages ago, so it always
  // just looked static. Gate it on the card actually entering view instead.
  const isInView = useInView(cardRef, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!isInView) return;

    const ratingControl = animate(0, rating, {
      duration: 3.5,
      ease: "easeOut",
      onUpdate(value) {
        if (ratingRef.current) ratingRef.current.textContent = value.toFixed(1);
      },
    });

    const reviewCountControl = animate(0, reviewCount, {
      duration: 3.5,
      ease: "easeOut",
      onUpdate(value) {
        if (reviewCountRef.current) {
          reviewCountRef.current.textContent = new Intl.NumberFormat("es-AR").format(Math.round(value));
        }
      },
    });

    return () => {
      ratingControl.stop();
      reviewCountControl.stop();
    };
  }, [isInView, rating, reviewCount]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  const starVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: 0.2 + i * 0.1, duration: 0.4, ease: "easeOut" as const },
    }),
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "w-full max-w-xs rounded-2xl border border-white/15 bg-[#1a1a1d]/60 backdrop-blur-md p-7 text-center shadow-sm",
        "flex flex-col items-center justify-center",
        className
      )}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      aria-label={`Calificación: ${rating} de ${maxRating}, basada en ${reviewCount} reseñas.`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => (
          <motion.div key={i} custom={i} variants={starVariants}>
            <Star
              className={cn("h-6 w-6", rating >= i + 1 ? "text-[#d4b500]" : "text-white/20")}
              fill="currentColor"
            />
          </motion.div>
        ))}
      </div>

      <h3 className="mt-4 text-4xl font-black tracking-tight text-white" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
        <span ref={ratingRef}>0.0</span>
        <span className="text-2xl font-bold text-gray-400">
          {" "}
          (<span ref={reviewCountRef}>0</span> reseñas)
        </span>
      </h3>

      <p className="mt-2 text-sm text-gray-500">{summaryText}</p>
    </motion.div>
  );
}
