import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://1e492a047379233056524352bb6fcf8b.ctonew.app";

const PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/articles", priority: "0.9", changefreq: "weekly" },
  { path: "/articles/best-muscle-cars-to-flip-2026", priority: "0.8", changefreq: "monthly" },
  { path: "/articles/how-to-value-classic-muscle-car", priority: "0.8", changefreq: "monthly" },
  { path: "/articles/muscle-car-market-trends-2026", priority: "0.8", changefreq: "monthly" },
  { path: "/articles/professional-inspection-checklist", priority: "0.8", changefreq: "monthly" },
  { path: "/articles/bring-a-trailer-vs-musclecars-ai", priority: "0.8", changefreq: "monthly" },
  { path: "/articles/avoid-buying-clone-vin-verification", priority: "0.8", changefreq: "monthly" },
  { path: "/articles/2026-muscle-car-buyers-guide", priority: "0.8", changefreq: "monthly" },
  { path: "/meets", priority: "0.7", changefreq: "daily" },
  { path: "/partners", priority: "0.7", changefreq: "weekly" },
  { path: "/sell", priority: "0.8", changefreq: "daily" },
  { path: "/shop", priority: "0.6", changefreq: "weekly" },
  { path: "/referral", priority: "0.6", changefreq: "weekly" },
  { path: "/premium-library", priority: "0.6", changefreq: "weekly" },
  { path: "/book-inspection", priority: "0.7", changefreq: "weekly" },
  { path: "/photo-suite", priority: "0.6", changefreq: "weekly" },
];

function generateSitemapXml(): string {
  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const Route = createFileRoute("/sitemap/xml")({
  component: SitemapComponent,
});

function SitemapComponent() {
  if (typeof document !== "undefined") {
    return null;
  }
  const xml = generateSitemapXml();
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
