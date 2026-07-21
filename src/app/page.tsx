import { Navbar } from "@/components/Navbar";
import { LocalBusinessSchema } from "@/components/LocalBusinessSchema";
import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { SiteFooterBar } from "@/components/SiteFooterBar";
import { LocationSection } from "@/components/ClientSections";
import { StorySection } from "@/components/StorySection";
import { ClassesShowcaseSection } from "@/components/ClassesShowcaseSection";
import { GlobalCurtain } from "@/components/GlobalCurtain";
import { AmbientBackground } from "@/components/AmbientBackground";

export default function Home() {
  return (
    <main id="inicio" className="relative min-h-screen">
      <LocalBusinessSchema />
      <GlobalCurtain />

      {/* Ambient gradients — fixed background, full page */}
      <AmbientBackground />

      {/* Subtle grain texture for depth */}
      <div className="grain-overlay" aria-hidden="true" />

      <Navbar />
      <HeroSection />
      <StorySection />
      <ClassesShowcaseSection />
      <PricingSection />
      <TestimonialsSection />
      <LocationSection />
      <SiteFooterBar />
    </main>
  );
}
