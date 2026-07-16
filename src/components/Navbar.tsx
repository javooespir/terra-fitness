"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/InstagramIcon";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Planes", href: "#planes" },
  { label: "Opiniones", href: "#opiniones" },
  { label: "Ubicación", href: "#ubicacion" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#2e2e33]/65 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#inicio" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Terra Fitness" className="h-10 w-auto" />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-[#d4b500] transition-colors duration-200 uppercase tracking-wider font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://www.instagram.com/terrafitness.arg/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Terra Fitness"
            className="text-gray-400 hover:text-[#d4b500] transition-colors"
          >
            <InstagramIcon className="size-5" />
          </a>
          <a
            href="tel:01124066934"
            aria-label="Llamar a Terra Fitness"
            className="text-gray-400 hover:text-[#d4b500] transition-colors"
          >
            <Phone className="size-5" />
          </a>
          <a
            href="#planes"
            className="bg-[#d4b500] text-black font-bold uppercase tracking-wider px-5 py-2 text-xs hover:bg-[#e6c520] transition-colors"
          >
            Ver Planes
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#2e2e33]/95 backdrop-blur-md border-b border-white/10"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-gray-300 hover:text-[#d4b500] uppercase tracking-widest text-sm font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#planes"
                onClick={() => setOpen(false)}
                className="bg-[#d4b500] text-black font-bold uppercase tracking-wider px-5 py-3 text-sm text-center mt-2"
              >
                Ver Planes
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
