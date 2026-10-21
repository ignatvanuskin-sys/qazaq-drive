import type { MetadataRoute } from "next";
import { brand } from "@/content/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — автошкола в Алматы`,
    short_name: brand.nameShort,
    description:
      "Автошкола QAZAQ DRIVE SCHOOL: теория, практика и 13 категорий прав в Алматы.",
    start_url: "/ru",
    display: "standalone",
    background_color: "#08090a",
    theme_color: "#08090a",
    lang: "ru",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
