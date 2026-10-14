import type { APIRoute } from "astro"

export const prerender = true

const SITE_URL = "https://www.josecastillocorcuera.com"

const pages = import.meta.glob("./**/*.astro")

const paths = Object.keys(pages)
  .map((file) => file.replace(/^\.\//, "/").replace(/\.astro$/, "").replace(/\/index$/, "/"))
  .filter((path) => !path.includes("["))
  .map((path) => (path === "/index" ? "/" : path))
  .sort()

export const get: APIRoute = () => {
  const urls = paths.map((path) => `  <url><loc>${new URL(path, SITE_URL).href}</loc></url>`).join("\n")
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  )
}
