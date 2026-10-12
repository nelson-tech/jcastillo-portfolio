// Brand marks from simple-icons (CC0 SVG paths; trademarks belong to their owners).
// Tableau, OpenAI, AWS, dbt and Playwright come from simple-icons@11 (later removed from the set).
// Grok mark from @lobehub/icons-static-svg (MIT). Muse Spark uses the Meta mark (no standalone Muse Spark logo published).
const raw = import.meta.glob("../data/stack-icons/*.svg", { as: "raw", eager: true }) as Record<string, string>
const path = (slug: string) => {
	const svg = raw[`../data/stack-icons/${slug}.svg`] ?? ""
	return [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(" ")
}
// Lucide (ISC) outline icons for generic items
const lucide = {
	database:
		'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
	box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
}
export type StackIcon = { kind: "brand"; d: string; color: string; title: string; evenodd?: boolean } | { kind: "line"; svg: string; color: string; title: string }
const b = (slug: string, color: string, title: string): StackIcon => ({ kind: "brand", d: path(slug), color, title })
// Shown for any tool without an entry, so every pill has an icon.
export const fallbackIcon: StackIcon = { kind: "line", svg: lucide.box, color: "#2E6584", title: "Tool" }

export const stackMeta: Record<string, { href: string; icons: StackIcon[] }> = {
	"Google Cloud / BigQuery": { href: "https://cloud.google.com/bigquery", icons: [b("googlecloud", "#4285F4", "Google Cloud"), b("googlebigquery", "#669DF6", "BigQuery")] },
	AWS: { href: "https://aws.amazon.com", icons: [b("amazonaws", "#FF9900", "AWS")] },
	Snowflake: { href: "https://www.snowflake.com", icons: [b("snowflake", "#29B5E8", "Snowflake")] },
	dbt: { href: "https://www.getdbt.com", icons: [b("dbt", "#FF694B", "dbt")] },
	Airflow: { href: "https://airflow.apache.org", icons: [b("apacheairflow", "#017CEE", "Apache Airflow")] },
	Kafka: { href: "https://kafka.apache.org", icons: [b("apachekafka", "#231F20", "Apache Kafka")] },
	Looker: { href: "https://cloud.google.com/looker", icons: [b("looker", "#4285F4", "Looker")] },
	SQL: { href: "https://en.wikipedia.org/wiki/SQL", icons: [{ kind: "line", svg: lucide.database, color: "#2E6584", title: "SQL" }] },
	Python: { href: "https://www.python.org", icons: [b("python", "#3776AB", "Python")] },
	Tableau: { href: "https://www.tableau.com", icons: [b("tableau", "#E97627", "Tableau")] },
	Vercel: { href: "https://vercel.com", icons: [b("vercel", "#000000", "Vercel")] },
	Supabase: { href: "https://supabase.com", icons: [b("supabase", "#3FCF8E", "Supabase")] },
	"Next.js": { href: "https://nextjs.org", icons: [b("nextdotjs", "#000000", "Next.js")] },
	TypeScript: { href: "https://www.typescriptlang.org", icons: [b("typescript", "#3178C6", "TypeScript")] },
	"Claude Code": { href: "https://www.anthropic.com/claude-code", icons: [b("claude", "#D97757", "Claude")] },
	Cursor: { href: "https://cursor.com", icons: [b("cursor", "#000000", "Cursor")] },
	ChatGPT: { href: "https://chatgpt.com", icons: [b("openai", "#10A37F", "OpenAI")] },
	"Grok Bot": { href: "https://grok.com", icons: [{ ...b("grok", "#000000", "Grok"), evenodd: true }] },
	"Muse Spark": { href: "https://ai.meta.com/muse/", icons: [b("meta", "#0467DF", "Meta")] },
	// Case-study card tools (not in the main, resume-only Stack list)
	Clerk: { href: "https://clerk.com", icons: [b("clerk", "#6C47FF", "Clerk")] },
	Gemini: { href: "https://gemini.google.com", icons: [b("googlegemini", "#8E75B2", "Gemini")] },
	Vitest: { href: "https://vitest.dev", icons: [b("vitest", "#6E9F18", "Vitest")] },
	Playwright: { href: "https://playwright.dev", icons: [b("playwright", "#2EAD33", "Playwright")] },
	Resend: { href: "https://resend.com", icons: [b("resend", "#000000", "Resend")] },
	"Tailwind CSS": { href: "https://tailwindcss.com", icons: [b("tailwindcss", "#06B6D4", "Tailwind CSS")] },
	Shopify: { href: "https://www.shopify.com", icons: [b("shopify", "#7AB55C", "Shopify")] },
	Sanity: { href: "https://www.sanity.io", icons: [b("sanity", "#0D0E12", "Sanity")] },
}
