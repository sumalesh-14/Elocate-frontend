import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/driver/", "/intermediary/", "/api/"],
    },
    sitemap: "https://elocate-ewaste.vercel.app/sitemap.xml",
  };
}
