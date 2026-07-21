// Deliberately NOT a client component driven by useEffect/GSAP. Every previous
// version of this timed the reveal from JS (rAF polling + gsap tweens), which
// depends on React having hydrated and the main thread being free to run it.
// On a throttled real device those two things can lag several seconds behind
// the server-rendered paint, during which: the logo tween never started (so
// it sat in whatever raw, unstyled state — read as "bugueado"), and the
// scroll-lock (a JS-applied inline style) hadn't been applied yet either, so
// scroll leaked through under a curtain that only looked like it was blocking
// anything. Confirmed by direct measurement earlier this session: curtain
// still fully covering the screen at ~4s under 4x CPU throttle, scroll lock
// never once applied in that window.
//
// Fix: the whole sequence is CSS animation (transform/opacity only — runs on
// the compositor thread, immune to main-thread congestion) with fixed
// durations baked into globals.css, so it starts the instant the browser
// paints the server-rendered HTML and finishes on a predictable clock
// regardless of JS/hydration/network speed. The only JS is a plain inline
// <script> — not a React effect — so it executes as the browser parses the
// HTML, before React/hydration is even in the picture, to release the
// scroll-lock and signal HeroSection at that same fixed time.
const READY_MS = 1300;

const bootScript = `
(function(){
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(){
    window.dispatchEvent(new Event('curtain-ready'));
    window.__curtainReady = true;
    html.classList.add('curtain-done');
  }
  if (reduce) { ready(); return; }
  setTimeout(ready, ${READY_MS});
})();
`;

export function GlobalCurtain() {
  return (
    <>
      <div className="curtain fixed inset-0 z-[300] pointer-events-none" aria-hidden="true">
        <div className="curtain-top absolute inset-x-0 top-0 h-1/2 bg-[#d8d8d6]" />
        <div className="curtain-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#d8d8d6]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt=""
          className="curtain-logo absolute top-1/2 left-1/2 w-28 sm:w-36 z-10"
        />
      </div>
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
    </>
  );
}
