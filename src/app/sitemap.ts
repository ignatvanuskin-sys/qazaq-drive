import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const pages = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/programs", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/process", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/fleet", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/instructors", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/reviews", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contacts", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/booking", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return pages.flatMap((page) =>
    (["ru", "kz"] as const).map((locale) => ({
      url: `${siteUrl}/${locale}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          ru: `${siteUrl}/ru${page.path}`,
          kk: `${siteUrl}/kz${page.path}`,
        },
      },
    })),
  );
}
