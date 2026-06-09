import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${brand.en.toLowerCase() === "lanhui" ? "https://lanhui.example.com" : "https://example.com"}/sitemap.xml`,
    host: "https://lanhui.example.com",
  };
}
