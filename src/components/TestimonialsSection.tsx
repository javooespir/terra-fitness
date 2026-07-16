"use client";

import React from "react";
import { motion } from "framer-motion";
import { ReviewSummaryCard } from "@/components/ReviewSummaryCard";

const testimonials = [
  {
    text: "10 de 10 el gym en todos los aspectos. Voy hace 1 año todos los días. Las máquinas están siempre en condiciones y el ambiente es genial.",
    name: "Ciro Recarey",
    role: "Miembro hace 1 año",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=CR&backgroundColor=c8a800&textColor=000000`,
  },
  {
    text: "Muy futurista, las máquinas están en muy buen estado. Un gimnasio que se nota que le ponen ganas al equipamiento.",
    name: "Marcelo López",
    role: "Socio verificado",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=ML&backgroundColor=c8a800&textColor=000000`,
  },
  {
    text: "Buenas máquinas, está bien para la zona. Espacio amplio y siempre limpio. Lo recomiendo para los que buscan un lugar serio.",
    name: "Lucía Caballero",
    role: "Local Guide",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=LC&backgroundColor=c8a800&textColor=000000`,
  },
  {
    text: "Buen precio, buena atención y las máquinas están nuevas. Muy completo para todo lo que ofrecen.",
    name: "Jorge Martínez",
    role: "Miembro activo",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=JM&backgroundColor=c8a800&textColor=000000`,
  },
  {
    text: "Excelente lugar para entrenar. Las clases grupales son muy buenas, los profes tienen energía.",
    name: "Valentina Torres",
    role: "Clase funcional",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=VT&backgroundColor=c8a800&textColor=000000`,
  },
  {
    text: "Vine de otro gym y la diferencia es enorme. Ambiente moderno, sin esperas en las máquinas y buen ambiente entre los socios.",
    name: "Rodrigo Sánchez",
    role: "Spinning & musculación",
    image: `https://api.dicebear.com/7.x/initials/svg?seed=RS&backgroundColor=c8a800&textColor=000000`,
  },
];

const firstCol = testimonials.slice(0, 3);
const secondCol = testimonials.slice(3, 6);

const TestimonialsColumn = ({
  items,
  duration = 20,
  reverse = false,
}: {
  items: typeof testimonials;
  duration?: number;
  reverse?: boolean;
}) => (
  <div className="flex flex-col gap-3 sm:gap-4 overflow-hidden h-[420px] sm:h-[560px]">
    <motion.div
      animate={{ translateY: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="flex flex-col gap-4"
    >
      {[...items, ...items].map(({ text, image, name, role }, i) => (
        <div
          key={i}
          className="p-5 sm:p-7 border border-white/15 bg-[#1a1a1d]/60 backdrop-blur-md w-full max-w-xs flex-shrink-0"
        >
          <div className="mb-3 sm:mb-4">
            <div className="flex gap-1 mb-2 sm:mb-3">
              {Array.from({ length: 5 }).map((_, s) => (
                <span key={s} className="text-[#d4b500] text-sm">★</span>
              ))}
            </div>
            <p className="text-[13px] sm:text-sm text-gray-300 leading-relaxed">&ldquo;{text}&rdquo;</p>
          </div>
          <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={36}
              height={36}
              src={image}
              alt={name}
              className="h-9 w-9 rounded-full flex-shrink-0"
            />
            <div>
              <div className="text-sm font-semibold text-white leading-tight">{name}</div>
              <div className="text-xs text-gray-500 leading-tight">{role}</div>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  </div>
);

export function TestimonialsSection() {
  return (
    <section id="opiniones" className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden bg-[#1c1a10]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left — text */}
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#d4b500] font-semibold block mb-4">
              Lo dicen nuestros socios
            </span>
            <div className="mb-6">
              <ReviewSummaryCard
                rating={4.5}
                reviewCount={135}
                summaryText="Así nos ven los que entrenan acá todos los días."
                className="items-start text-left mx-0"
              />
            </div>

            <a
              href="https://maps.app.goo.gl/MpkJyAnHPdUfSq2U6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#d4b500]/40 text-[#d4b500] font-semibold uppercase tracking-wider px-6 py-3 text-xs hover:bg-[#d4b500] hover:text-black transition-all duration-200"
            >
              Ver todas en Google
              <span>→</span>
            </a>
          </div>

          {/* Right — scrolling columns. 1 col on mobile, 2 on md+ */}
          <div className="flex gap-4 justify-center">
            <TestimonialsColumn items={firstCol} duration={22} />
            <div className="hidden sm:block">
              <TestimonialsColumn items={secondCol} duration={28} reverse />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
}
