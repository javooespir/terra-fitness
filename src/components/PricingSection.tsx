"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InstagramIcon } from "@/components/InstagramIcon";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SparkleBackground } from "@/components/SparkleBackground";
import { onIdle } from "@/lib/idle";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const WA_NUMBER = "5491131462214";
const IG_URL = "https://www.instagram.com/terrafitness.arg/";

interface Plan {
  name: string;
  tag: string;
  features: string[];
  popular: boolean;
}

type Tab = "general" | "clases";

const DATA: Record<Tab, Plan[]> = {
  general: [
    { name: "Pase Libre", tag: "Acceso a sala completa", features: ["Acceso ilimitado", "Todas las clases"], popular: false },
    { name: "3 x Semana", tag: "Ideal para arrancar", features: ["3 ingresos semanales", "Clases grupales"], popular: true },
    { name: "Personalizado", tag: "A tu medida", features: ["Coach 1 a 1", "Plan a medida"], popular: false },
  ],
  clases: [
    { name: "Box", tag: "Técnica e impacto", features: ["Golpes y guardia", "Trabajo en bolsa", "Grupos reducidos"], popular: false },
    { name: "Calistenia", tag: "Control del propio cuerpo", features: ["Barras y anillas", "Progresiones de fuerza", "Todos los niveles"], popular: true },
    { name: "Crossfit", tag: "Alta intensidad", features: ["WOD todos los días", "Trabajo en grupo", "Coach dedicado"], popular: false },
  ],
};

const TITLE_WORDS: Array<{ text: string; gold?: boolean }> = [
  { text: "Elegí" },
  { text: "tu" },
  { text: "forma" },
  { text: "de" },
  { text: "entrenar", gold: true },
];

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "general", label: "Entrenamiento general" },
  { id: "clases", label: "Clases" },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const switchWrapRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const firstRender = useRef(true);

  function moveHighlight(btn: HTMLButtonElement) {
    const switchEl = switchRef.current;
    const highlight = highlightRef.current;
    if (!switchEl || !highlight) return;
    const switchRect = switchEl.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    gsap.to(highlight, {
      x: btnRect.left - switchRect.left - 4.8,
      width: btnRect.width,
      duration: 0.45,
      ease: "power3.out",
    });
  }

  function handleTabClick(tab: Tab, i: number) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    const btn = tabButtonRefs.current[i];
    if (btn) moveHighlight(btn);
  }

  // Card crossfade whenever the active tab changes (skip on first mount).
  useLayoutEffect(() => {
    const cards = cardsRef.current?.children;
    if (!cards || !cards.length) return;

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    gsap.fromTo(
      cards,
      { opacity: 0, y: 18, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out", stagger: 0.07 }
    );
  }, [activeTab]);

  // Position the switch highlight on mount / resize.
  useLayoutEffect(() => {
    const btn = tabButtonRefs.current[0];
    if (!btn || !switchRef.current || !highlightRef.current) return;
    const place = () => {
      const activeBtn = tabButtonRefs.current[TABS.findIndex((t) => t.id === activeTab)];
      if (activeBtn) {
        gsap.set(highlightRef.current, {
          x: activeBtn.getBoundingClientRect().left - switchRef.current!.getBoundingClientRect().left - 4.8,
          width: activeBtn.getBoundingClientRect().width,
        });
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll-in reveal (once) + vertical-cut title + sparkles background.
  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wordSpans = titleRef.current!.querySelectorAll(".cut-word span");

    gsap.set(wordSpans, { yPercent: 110, opacity: 0 });
    gsap.set(eyebrowRef.current, { y: -14, opacity: 0 });
    gsap.set(subRef.current, { y: 14, opacity: 0 });
    gsap.set(switchWrapRef.current, { y: 14, opacity: 0 });
    gsap.set(cardsRef.current!.children, { opacity: 0, y: 18 });

    if (reduceMotion) {
      gsap.set(wordSpans, { yPercent: 0, opacity: 1 });
      gsap.set([eyebrowRef.current, subRef.current, switchWrapRef.current], { y: 0, opacity: 1 });
      gsap.set(cardsRef.current!.children, { opacity: 1, y: 0 });
      return;
    }

    let ctx: gsap.Context | null = null;
    let rafId = 0;
    let cancelled = false;

    // Earlier sections (Classes) defer their own ScrollTrigger/pin creation across
    // several frames to sidestep a layout-measurement race — see ClassesShowcaseSection.
    // If this section's trigger is created before that settles, "top 75%" resolves
    // against a too-short document and fires immediately instead of on scroll. Poll
    // until this section's own position stops moving before wiring up the reveal.
    let lastMeasure = NaN;
    let stableFrames = 0;

    const poll = () => {
      if (cancelled) return;
      const current = sectionRef.current!.getBoundingClientRect().top + window.scrollY;
      stableFrames = current === lastMeasure ? stableFrames + 1 : 0;
      lastMeasure = current;

      if (stableFrames < 3) {
        rafId = requestAnimationFrame(poll);
        return;
      }

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 75%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0)
              .to(wordSpans, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 0.1)
              .to(subRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.35)
              .to(switchWrapRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.45)
              .to(cardsRef.current!.children, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.55);
          },
        });
      }, sectionRef);
    };

    // Elements are already hidden synchronously above, so deferring just the
    // measure-and-create step (real work: getBoundingClientRect + ScrollTrigger
    // setup) off the idle queue costs nothing visible — it just keeps this
    // below-fold section's setup out of the same blocking commit as Hero's.
    const cancelIdle = onIdle(() => {
      rafId = requestAnimationFrame(poll);
    });

    return () => {
      cancelled = true;
      cancelIdle();
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  const plans = DATA[activeTab];

  return (
    <section id="planes" ref={sectionRef} className="relative bg-[#1c1a10] px-5 pt-28 pb-24 sm:pt-32 sm:pb-28">
      <SparkleBackground parentRef={sectionRef} />

      <div className="relative z-[5] mx-auto max-w-2xl text-center">
        <span
          ref={eyebrowRef}
          className="mb-4 block text-[0.72rem] font-bold uppercase tracking-[0.35em] text-[#e6c520]"
        >
          Planes y precios
        </span>
        <h2
          ref={titleRef}
          className="font-black uppercase leading-[0.96] text-white"
          style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(2.4rem, 6.5vw, 4.6rem)", letterSpacing: "-0.01em" }}
        >
          {TITLE_WORDS.map((w, i) => (
            <span key={i} className="cut-word mx-[0.18em] inline-block overflow-hidden align-top">
              <span className={`inline-block ${w.gold ? "text-[#e6c520]" : ""}`}>{w.text}</span>
            </span>
          ))}
        </h2>
        <p ref={subRef} className="mt-4 text-[0.95rem] leading-relaxed text-white/55">
          Elegí cómo entrenar. Sin ataduras, sin letra chica — consultanos y armamos el plan que mejor te cierre.
        </p>

        <div ref={switchWrapRef} className="mt-7 flex justify-center">
          <div ref={switchRef} className="relative inline-flex rounded-full border border-white/10 bg-[#141210] p-[0.3rem]">
            <div
              ref={highlightRef}
              className="absolute top-[0.3rem] left-[0.3rem] h-[calc(100%-0.6rem)] rounded-full will-change-transform"
              style={{ background: "linear-gradient(180deg, #e6c520, #d4b500)", boxShadow: "0 4px 18px rgba(212,181,0,.35)" }}
            />
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                ref={(el) => {
                  tabButtonRefs.current[i] = el;
                }}
                type="button"
                onClick={() => handleTabClick(tab.id, i)}
                className={`relative z-[2] whitespace-nowrap rounded-full px-6 py-[0.7rem] text-[0.85rem] font-bold uppercase tracking-wide transition-colors ${
                  activeTab === tab.id ? "text-[#1c1a10]" : "text-white/55"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-[5] mx-auto mt-14 max-w-5xl">
        <div ref={cardsRef} className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[22px] border p-7 pt-8 ${
                plan.popular
                  ? "border-[#e6c520]/50 shadow-[0_-10px_80px_rgba(212,181,0,0.18),0_20px_50px_rgba(0,0,0,0.4)]"
                  : "border-white/[0.08]"
              }`}
              style={{ background: "linear-gradient(180deg, #1c1a10, #141209)" }}
            >
              {plan.popular && (
                <span className="absolute -top-[0.9rem] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#e6c520] px-[0.9rem] py-[0.4rem] text-[0.65rem] font-extrabold uppercase tracking-wide text-[#1c1a10]">
                  ★ Más elegido
                </span>
              )}
              <h3
                className="mb-1 text-[1.9rem] font-black uppercase leading-none text-white"
                style={{ fontFamily: "var(--font-barlow-condensed)", letterSpacing: "-0.01em" }}
              >
                {plan.name}
              </h3>
              <div className="mb-6 text-[0.72rem] uppercase tracking-wide text-white/40">{plan.tag}</div>

              <div className="mb-6 flex items-baseline gap-2" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                <span className="text-2xl font-extrabold uppercase text-[#e6c520]">Consultar</span>
                <span className="font-sans text-[0.8rem] font-normal text-white/40" style={{ fontFamily: "var(--font-barlow)" }}>
                  precio y disponibilidad
                </span>
              </div>

              <ul className="mb-6 flex flex-col gap-[0.6rem]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-[0.6rem] text-[0.87rem] text-white/65">
                    <span className="mt-[0.45rem] size-[7px] flex-none rounded-full bg-[#e6c520]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-[0.6rem] border-t border-white/[0.08] pt-[1.3rem]">
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola! Quiero info sobre " + plan.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-[0.55rem] rounded-xl py-[0.8rem] text-[0.8rem] font-bold uppercase tracking-wide text-[#1c1a10] transition-transform hover:-translate-y-px"
                  style={{ background: "linear-gradient(180deg, #e6c520, #d4b500)" }}
                >
                  <WhatsAppIcon className="size-[18px]" />
                  WhatsApp
                </a>
                <a
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-[0.55rem] rounded-xl border border-white/[0.18] py-[0.8rem] text-[0.8rem] font-bold uppercase tracking-wide text-white transition-transform hover:-translate-y-px hover:border-[#e6c520] hover:text-[#e6c520]"
                >
                  <InstagramIcon className="size-[18px]" />
                  Instagram
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-[5] mt-10 text-center text-xs text-white/35">
        * Consultanos por promociones, planes familiares y clases de prueba.
      </p>
    </section>
  );
}
