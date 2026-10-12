// Brand marks from simple-icons (CC0 SVG paths; trademarks belong to their owners).
// Tableau comes from simple-icons@11 (it was later removed from the set).
const raw = import.meta.glob("../data/stack-icons/*.svg", { as: "raw", eager: true }) as Record<string, string>
const path = (slug: string) => {
	const svg = raw[`../data/stack-icons/${slug}.svg`] ?? ""
	return svg.match(/ d="([^"]+)"/)?.[1] ?? ""
}
// Lucide (ISC) outline icons for generic items
const lucide = {
	database:
		'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
	sparkles:
		'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
}
export type StackIcon = { kind: "brand"; d: string; color: string; title: string } | { kind: "line"; svg: string; color: string; title: string }
const b = (slug: string, color: string, title: string): StackIcon => ({ kind: "brand", d: path(slug), color, title })
export const stackMeta: Record<string, { href: string; icons: StackIcon[] }> = {
	"Google Cloud / BigQuery": { href: "https://cloud.google.com/bigquery", icons: [b("googlecloud", "#4285F4", "Google Cloud"), b("googlebigquery", "#669DF6", "BigQuery")] },
	SQL: { href: "https://en.wikipedia.org/wiki/SQL", icons: [{ kind: "line", svg: lucide.database, color: "#2E6584", title: "SQL" }] },
	Python: { href: "https://www.python.org", icons: [b("python", "#3776AB", "Python")] },
	"Airflow / Prefect": { href: "https://airflow.apache.org", icons: [b("apacheairflow", "#017CEE", "Apache Airflow"), b("prefect", "#070E10", "Prefect")] },
	"Next.js": { href: "https://nextjs.org", icons: [b("nextdotjs", "#000000", "Next.js")] },
	Supabase: { href: "https://supabase.com", icons: [b("supabase", "#3FCF8E", "Supabase")] },
	Tableau: { href: "https://www.tableau.com", icons: [b("tableau", "#E97627", "Tableau")] },
	Vercel: { href: "https://vercel.com", icons: [b("vercel", "#000000", "Vercel")] },
	"AI agents": { href: "https://en.wikipedia.org/wiki/Intelligent_agent", icons: [{ kind: "line", svg: lucide.sparkles, color: "#5592B5", title: "AI agents" }] },
}
