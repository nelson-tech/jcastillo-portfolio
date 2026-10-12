// Brand marks from simple-icons (CC0 SVG paths; trademarks belong to their owners).
// Tableau, OpenAI, AWS and dbt come from simple-icons@11 (later removed from the set).
// Grok mark from @lobehub/icons-static-svg (MIT). Muse uses the Meta mark (no standalone Muse logo published).
const raw = import.meta.glob("../data/stack-icons/*.svg", { as: "raw", eager: true }) as Record<string, string>
const path = (slug: string) => {
	const svg = raw[`../data/stack-icons/${slug}.svg`] ?? ""
	return [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(" ")
}
// Lucide (ISC) outline icons for generic items
const lucide = {
	database:
		'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
}
export type StackIcon = { kind: "brand"; d: string; color: string; title: string; evenodd?: boolean } | { kind: "line"; svg: string; color: string; title: string }
const b = (slug: string, color: string, title: string): StackIcon => ({ kind: "brand", d: path(slug), color, title })
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
	Claude: { href: "https://claude.ai", icons: [b("claude", "#D97757", "Claude")] },
	ChatGPT: { href: "https://chatgpt.com", icons: [b("openai", "#10A37F", "OpenAI")] },
	"Grok Bot": { href: "https://grok.com", icons: [{ ...b("grok", "#000000", "Grok"), evenodd: true }] },
	Muse: { href: "https://ai.meta.com/muse/", icons: [b("meta", "#0467DF", "Meta")] },
}
