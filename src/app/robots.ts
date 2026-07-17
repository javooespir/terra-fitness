import type { MetadataRoute } from "next";

const siteUrl = "https://terra-fitness.encende.click";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
