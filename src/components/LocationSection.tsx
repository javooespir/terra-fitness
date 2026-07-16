"use client";

import { useRef } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { InstagramIcon } from "@/components/InstagramIcon";
import { SparkleBackground } from "@/components/SparkleBackground";
import { LocationMap } from "@/components/LocationMap";

const MAPS_URL = "https://maps.app.goo.gl/MpkJyAnHPdUfSq2U6";

const info = [
  {
    icon: MapPin,
    label: "Dirección",
    value: "Cnel. Pablo Zufriategui 790",
    sub: "Ituzaingó, Buenos Aires",
    href: MAPS_URL,
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "011 2406-6934",
    sub: "Llamanos o mandá mensaje",
    href: "tel:01124066934",
  },
  {
    icon: Clock,
    label: "Horarios",
    value: "Lun a Vie: 7 a 22:30",
    sub: "Sáb y feriados: 9 a 18 · Dom: cerrado",
    href: null,
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    value: "@terrafitness.arg",
    sub: "Seguinos para novedades",
    href: "https://www.instagram.com/terrafitness.arg/",
  },
];

export function LocationSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="ubicacion" ref={sectionRef} className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden bg-[#1c1a10]">
      <SparkleBackground parentRef={sectionRef} glowOffset={220} />

      <div className="relative z-[5] max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#d4b500] font-semibold block mb-3">
            Dónde encontrarnos
          </span>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-black uppercase text-white leading-none"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Nuestra
            <br />
            <span className="text-[#d4b500]">Ubicación</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-8 sm:gap-10 items-start">
          {/* Map card first on mobile, natural size — no oversized empty frame around it */}
          <div className="order-1 md:order-2 md:col-span-2 flex justify-center md:justify-end md:pt-2">
            <LocationMap
              location="Terra Fitness — Ituzaingó"
              coordinates="Cnel. Pablo Zufriategui 790, entre Gral. Las Heras y Juncal"
              mapsHref={MAPS_URL}
            />
          </div>

          {/* Info column */}
          <div className="order-2 md:order-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {info.map((item, i) => {
              const Icon = item.icon;
              const content = (
                <div className={`flex gap-3 sm:gap-4 p-4 sm:p-5 border border-white/15 bg-[#1a1a1d]/60 backdrop-blur-md h-full ${item.href ? "hover:border-[#d4b500]/40 hover:bg-[#1a1a1d]/75 transition-colors cursor-pointer" : ""}`}>
                  <div className="flex-shrink-0">
                    <div className="size-9 border border-[#d4b500]/30 flex items-center justify-center">
                      <Icon className="size-4 text-[#d4b500]" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.sub}</p>
                  </div>
                </div>
              );

              return item.href ? (
                <a key={i} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                <div key={i}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
