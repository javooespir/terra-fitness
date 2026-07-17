"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onIdle } from "@/lib/idle";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ClassItem {
  id: string;
  name: string;
  pill: string;
  photo: string;
  video: string | null;
  minutes: string;
  intensity: string;
  desc: string;
  icon: string;
}

const CLASSES: ClassItem[] = [
  {
    id: "musculacion",
    name: "Musculación",
    pill: "Fuerza",
    photo: "/photos/class-musculacion.jpg",
    video: "/videos/class-musculacion.mp4",
    minutes: "45'",
    intensity: "3",
    desc: "Trabajo con pesas libres y máquinas guiadas. Rutinas armadas para vos, progresión real semana a semana y profes encima de tu técnica todo el tiempo.",
    icon: "/icons/icon-musculacion.png",
  },
  {
    id: "crossfit",
    name: "Crossfit",
    pill: "Potencia",
    photo: "/photos/class-crossfit.jpg",
    video: "/videos/class-crossfit.mp4",
    minutes: "50'",
    intensity: "5",
    desc: "Entrenamiento funcional de alta intensidad. Wods que cambian todos los días, trabajo en grupo y esa sensación de terminar reventado pero mejor que ayer.",
    icon: "/icons/icon-crossfit.png",
  },
  {
    id: "calistenia",
    name: "Calistenia",
    pill: "Control",
    photo: "/photos/class-calistenia.jpg",
    video: "/videos/class-calistenia.mp4",
    minutes: "40'",
    intensity: "4",
    desc: "Control total del propio cuerpo. Barras, anillas y progresiones de fuerza que te llevan del primer dominadas a movimientos que hoy ni te imaginás.",
    icon: "/icons/icon-calistenia.png",
  },
  {
    id: "boxeo",
    name: "Boxeo",
    pill: "Impacto",
    photo: "/photos/class-boxeo.jpg",
    video: null,
    minutes: "45'",
    intensity: "5",
    desc: "Técnica de golpes, guardia y trabajo en bolsa. Descarga de estrés, reflejos más rápidos y una condición física que se nota fuera del ring.",
    icon: "/icons/icon-boxeo.png",
  },
];

const WORD = "CLASES";
const SLOT_CLASS = [
  "top-[9%] left-[4%] md:left-[4%] rotate-[-4deg]",
  "top-[8%] right-[4%] md:right-[4%] rotate-[3deg]",
  "bottom-[8%] left-[6%] md:left-[6%] rotate-[4deg]",
  "bottom-[9%] right-[6%] md:right-[6%] rotate-[-3deg]",
];
const FINAL_ROTATE = [-4, 3, 4, -3];
const FROM_SIDE: Array<{ x: string; rotate: number }> = [
  { x: "-140%", rotate: -22 },
  { x: "140%", rotate: 22 },
  { x: "-140%", rotate: 26 },
  { x: "140%", rotate: -26 },
];
const CARD_STARTS = [0.1, 0.2, 0.3, 0.4];

export function ClassesShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mainRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ghostRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [openId, setOpenId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);

  const active = CLASSES.find((c) => c.id === openId) ?? null;

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    let ctx: gsap.Context | null = null;
    let rafId = 0;
    let cancelled = false;

    // Hide immediately (cheap, no measurement) so there's no flash of the
    // fully-visible title/cards before the reveal sets up — the expensive
    // part (measuring + creating the pinned ScrollTrigger) is deferred below.
    const mainsNow = mainRefs.current.filter(Boolean) as HTMLSpanElement[];
    const ghostsNow = ghostRefs.current.filter(Boolean) as HTMLSpanElement[];
    const cardsNow = cardRefs.current.filter(Boolean) as HTMLButtonElement[];
    gsap.set(mainsNow, { y: -80, opacity: 0 });
    gsap.set(ghostsNow, { y: -80, opacity: 0 });
    gsap.set(subRef.current, { y: 16, opacity: 0 });
    cardsNow.forEach((el, i) => {
      gsap.set(el, { x: FROM_SIDE[i].x, rotate: FROM_SIDE[i].rotate, opacity: 0 });
    });

    // Earlier sibling sections (e.g. StorySection) create their own pinned ScrollTriggers
    // in their own mount effects, which synchronously insert a pin-spacer reserving their
    // scroll distance. Production hydration doesn't strictly guarantee those sibling
    // effects finish before this one runs, so measuring immediately can race and
    // undercount our start position (this section's pin engaging too early, overlapping
    // the one before it). A single deferred frame isn't reliably enough margin, so poll
    // every frame until the measurement stops changing before committing to it.
    //
    // This whole measure-and-pin step is also real work (getBoundingClientRect + GSAP
    // pin-spacer creation) — running it immediately meant every below-fold section did
    // this in the same synchronous commit as Hero's own mount, adding up to one large
    // blocking task right at page load. Kicking the first poll off the idle queue
    // instead spreads that cost across frames without changing anything visible.
    let lastMeasure = NaN;
    let stableFrames = 0;

    const poll = () => {
      if (cancelled) return;
      const current = pinRef.current!.getBoundingClientRect().top + window.scrollY;
      stableFrames = current === lastMeasure ? stableFrames + 1 : 0;
      lastMeasure = current;

      if (stableFrames < 3) {
        rafId = requestAnimationFrame(poll);
        return;
      }

      const measuredStart = current;
      ctx = gsap.context(() => {
        const mains = mainRefs.current.filter(Boolean) as HTMLSpanElement[];
        const ghosts = ghostRefs.current.filter(Boolean) as HTMLSpanElement[];
        const cards = cardRefs.current.filter(Boolean) as HTMLButtonElement[];

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: measuredStart,
            // scrub:1 lags the playhead up to 1s behind actual scroll position —
            // fine on a long pin, but on this short one a fast scroll/swipe can
            // cross the whole range before the catch-up finishes, so the pin
            // releases (scrolls away) before the reveal ever paints on screen.
            // A tighter scrub tracks scroll almost 1:1 so it can't be outrun.
            end: measuredStart + window.innerHeight * 1.0,
            scrub: 0.3,
            pin: true,
            anticipatePin: 1,
          },
        });

        mains.forEach((m, i) => {
          const start = i * 0.055;
          tl.to(m, { y: 0, opacity: 1, duration: 0.34, ease: "power2.out" }, start);
          tl.to(ghosts[i], { y: -14, opacity: 0.45, duration: 0.14, ease: "power1.out" }, start);
          tl.to(ghosts[i], { y: 30, opacity: 0, duration: 0.26, ease: "power1.in" }, start + 0.14);
        });

        tl.to(subRef.current, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 0.32);

        cards.forEach((el, i) => {
          tl.to(el, {
            x: "0%",
            rotate: FINAL_ROTATE[i],
            opacity: 1,
            duration: 0.28,
            ease: "power3.out",
          }, CARD_STARTS[i]);
        });
      }, sectionRef);
    };

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

  function openClass(id: string) {
    setOpenId(id);
  }

  function closeClass() {
    if (!overlayRef.current) {
      setOpenId(null);
      return;
    }
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setOpenId(null),
    });
  }

  useLayoutEffect(() => {
    if (!active || !overlayRef.current) return;

    document.body.style.overflow = "hidden";
    gsap.set(overlayRef.current, { opacity: 0 });
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.35, ease: "power2.out" });
    gsap.fromTo(
      mediaRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.45, delay: 0.05, ease: "power3.out" }
    );
    gsap.fromTo(
      ".cl-stat-anim, .cl-desc-anim",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, delay: 0.15, stagger: 0.06, ease: "power2.out" }
    );

    if (videoElRef.current) {
      videoElRef.current.currentTime = 0;
      videoElRef.current.play().catch(() => {});
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  useLayoutEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeClass();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <section id="servicios" ref={sectionRef} className="relative bg-[#1c1a10]">
        <div
          ref={pinRef}
          className="relative h-screen overflow-hidden flex items-center justify-center"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, rgba(212,181,0,.10), transparent 60%)",
            }}
          />

          <div className="relative z-10 text-center pointer-events-none px-4">
            <h2
              className="font-black uppercase leading-[0.92] whitespace-nowrap"
              style={{
                fontFamily: "var(--font-barlow-condensed)",
                fontSize: "clamp(3rem, 13vw, 10rem)",
                color: "#e6c520",
                letterSpacing: "-0.01em",
              }}
            >
              {WORD.split("").map((ch, i) => (
                <span key={i} className="relative inline-block">
                  <span
                    ref={(el) => {
                      ghostRefs.current[i] = el;
                    }}
                    aria-hidden="true"
                    className="absolute left-0 top-0 inline-block"
                    style={{ color: "#e6c520", filter: "blur(3px)" }}
                  >
                    {ch}
                  </span>
                  <span
                    ref={(el) => {
                      mainRefs.current[i] = el;
                    }}
                    className="relative inline-block"
                  >
                    {ch}
                  </span>
                </span>
              ))}
            </h2>
            <div
              ref={subRef}
              className="mt-2 font-semibold uppercase text-white/55"
              style={{ letterSpacing: "0.3em", fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)" }}
            >
              Elegí tu forma de entrenar
            </div>
          </div>

          {CLASSES.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => openClass(item.id)}
              className={`absolute z-[4] overflow-hidden rounded-2xl cursor-pointer border border-white/10 ${SLOT_CLASS[i]}`}
              style={{
                width: "clamp(160px, 15vw, 230px)",
                aspectRatio: "3 / 4",
                boxShadow: "0 24px 50px rgba(0,0,0,.55)",
              }}
            >
              <img
                src={item.photo}
                alt={`${item.name} en Terra Fitness`}
                className="w-full h-full object-cover block transition-transform duration-500 ease-out hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,10,10,.92) 0%, rgba(10,10,10,.15) 55%, transparent 75%)",
                }}
              />
              <span
                className="absolute top-3 right-3 rounded-full px-3 py-1 font-bold uppercase"
                style={{
                  background: "#e6c520",
                  color: "#1c1a10",
                  fontSize: "0.62rem",
                  letterSpacing: "0.08em",
                }}
              >
                {item.pill}
              </span>
              <div className="absolute left-3 right-3 bottom-3 flex items-center gap-2 text-left">
                <img src={item.icon} alt="" className="flex-none w-[26px] h-[26px] object-contain" />
                <span
                  className="font-extrabold uppercase leading-none text-white"
                  style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.05rem" }}
                >
                  {item.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "#e6c520" }}
        >
          <button
            onClick={closeClass}
            aria-label="Cerrar"
            className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className="w-5 h-5">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center gap-6 px-4 md:px-0 pt-24 pb-12 md:pt-0 md:pb-0">
            <div
              className="cl-stat-anim flex md:absolute flex-row md:flex-col items-center gap-3 md:gap-2 text-[#0a0a0a]"
              style={{ left: "clamp(1rem, 8vw, 8rem)", top: "50%", transform: "translateY(-50%)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l3 2M9 2h6M12 2v2" />
              </svg>
              <b className="font-black text-center leading-tight" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.1rem" }}>
                {active.minutes}
                <br />
                Minutos
              </b>
            </div>

            <div
              ref={mediaRef}
              className="relative rounded-[18px] overflow-hidden bg-black"
              style={{ width: "clamp(220px, 26vw, 380px)", aspectRatio: "3 / 4", boxShadow: "0 30px 70px rgba(0,0,0,.35)" }}
            >
              {active.video ? (
                <video
                  ref={videoElRef}
                  src={active.video}
                  className="w-full h-full object-cover block"
                  loop
                  muted
                  playsInline
                />
              ) : (
                <>
                  <img src={active.photo} alt={active.name} className="w-full h-full object-cover block" />
                  <span className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-white text-[0.6rem] uppercase tracking-wide" style={{ background: "rgba(10,10,10,.75)" }}>
                    Próximamente video
                  </span>
                </>
              )}
            </div>

            <div
              className="cl-stat-anim flex md:absolute flex-row md:flex-col items-center gap-3 md:gap-2 text-[#0a0a0a]"
              style={{ right: "clamp(1rem, 8vw, 8rem)", top: "50%", transform: "translateY(-50%)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <path d="M4.9 19a9 9 0 1 1 14.2 0" />
                <path d="M12 13 16 8" />
                <circle cx="12" cy="13" r="1.4" fill="currentColor" stroke="none" />
              </svg>
              <b className="font-black text-center leading-tight" style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "1.1rem" }}>
                {active.intensity}
                <br />
                Intensidad
              </b>
            </div>

            <div className="cl-desc-anim md:absolute md:left-1/2 md:bottom-12 md:-translate-x-1/2 max-w-xl w-[90%] text-center text-[#0a0a0a]">
              <small
                className="block mb-1 font-black uppercase"
                style={{ fontFamily: "var(--font-barlow-condensed)", fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)", letterSpacing: "-0.01em" }}
              >
                {active.name}
              </small>
              <span
                className="block font-bold uppercase leading-relaxed"
                style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.05rem)" }}
              >
                {active.desc}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
