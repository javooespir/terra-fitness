const siteUrl = "https://terra-fitness.encende.click";

// Static, developer-controlled data — safe to inject via dangerouslySetInnerHTML
// (no user input involved). This is the standard Next.js pattern for JSON-LD.
const schema = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: "Terra Fitness",
  image: `${siteUrl}/opengraph-image`,
  url: siteUrl,
  telephone: "+54-11-2406-6934",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Cnel. Pablo Zufriategui 790",
    addressLocality: "Ituzaingó",
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "22:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: ["https://www.instagram.com/terrafitness.arg/"],
};

export function LocalBusinessSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
