import { InstagramIcon } from "@/components/InstagramIcon";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const WA_NUMBER = "5491131462214";
const IG_URL = "https://www.instagram.com/terrafitness.arg/";

export function SiteFooterBar() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0a0a0a] px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex gap-3">
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola! Quiero info sobre Terra Fitness")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1c1a10] transition-transform hover:-translate-y-px"
            style={{ background: "linear-gradient(180deg, #e6c520, #d4b500)" }}
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:border-[#e6c520] hover:text-[#e6c520]"
          >
            <InstagramIcon className="size-4" />
            Instagram
          </a>
        </div>

        <div className="flex flex-col items-center gap-1 text-center sm:items-end sm:text-right">
          <p className="text-xs text-white/35">© {new Date().getFullYear()} Terra Fitness. Todos los derechos reservados.</p>
          <p className="text-xs text-white/35">
            Sitio creado por{" "}
            <a
              href="https://encende.click"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 transition-colors hover:text-[#e6c520]"
            >
              encende.click
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
