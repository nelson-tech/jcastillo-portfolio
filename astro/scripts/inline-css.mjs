// Postbuild: inline small stylesheets into HTML to remove render-blocking CSS requests.
import fs from "fs"; import path from "path";
const dist = path.resolve("dist"); const MAX = 64 * 1024;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(dist).filter((f) => f.endsWith(".html"))) {
  let html = fs.readFileSync(f, "utf8");
  html = html.replace(/<link rel="stylesheet" href="(\/_astro\/[^"]+.css)"\s*\/?>/g, (m, href) => {
    const p = path.join(dist, href); if (!fs.existsSync(p)) return m;
    const css = fs.readFileSync(p, "utf8"); return css.length > MAX ? m : `<style>${css}</style>`;
  });
  fs.writeFileSync(f, html);
}
