import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

// Montserrat's bold/black weights are the closest Google Font match to the
// client's real logo wordmark (flat-apex A, monolinear geometric strokes) —
// replaces Barlow/Barlow Condensed everywhere so body copy and headings both
// read as the same family as the logo. Variable names kept as-is (used via
// var(--font-barlow-condensed) etc. across many components) to avoid a
// mechanical rename touching every file for no functional benefit.
const montserrat = Montserrat({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserratHeading = Montserrat({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

const siteUrl = "https://terra-fitness.encende.click";

export const metadata: Metadata = {
  title: "Terra Fitness | Training Center Ituzaingó",
  description:
    "Gimnasio en Ituzaingó con equipamiento de última generación, clases de musculación, calistenia, funcional, crossfit y spinning. Venite a entrenar.",
  keywords: "gimnasio ituzaingo, terra fitness, musculacion, calistenia, crossfit, spinning, funcional",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Terra Fitness | Training Center Ituzaingó",
    description: "El gimnasio más completo de Ituzaingó. Equipamiento nuevo, clases grupales y entrenadores profesionales.",
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Terra Fitness",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Terra Fitness | Training Center Ituzaingó",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terra Fitness | Training Center Ituzaingó",
    description: "El gimnasio más completo de Ituzaingó.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${montserratHeading.variable} dark`}>
      <body className="min-h-full flex flex-col bg-[#2e2e33] antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
