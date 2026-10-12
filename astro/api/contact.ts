// Vercel Function: POST /api/contact
// Same approach as Sensational Concrete's /api/estimate: honeypot + rate limit +
// Resend REST API. Adds a time trap. No secrets in code; see README "Contact form".
export const config = { runtime: "nodejs" }

const TO = process.env.CONTACT_TO_EMAIL ?? "josecastillo@alumni.usc.edu"
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Jose Castillo Portfolio <onboarding@resend.dev>"
const REASONS = ["Work together", "Speaking", "Other"]
const MIN_FILL_MS = 3000
const MAX_AGE_MS = 24 * 60 * 60 * 1000

// Best-effort, per warm instance (same tradeoff as Sensational Concrete).
const HOUR_MS = 60 * 60 * 1000
const rate = new Map<string, number[]>()
function limited(ip: string) {
	const now = Date.now()
	const hits = (rate.get(ip) ?? []).filter((t) => now - t < HOUR_MS)
	if (hits.length >= 5) return true
	hits.push(now)
	rate.set(ip, hits)
	return false
}

const oneLine = (s: string) => s.replace(/[\r\n]/g, " ").trim()
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

export async function POST(req: Request) {
	let form: FormData
	try {
		form = await req.formData()
	} catch {
		return json({ ok: false, error: "Bad request" }, 400)
	}
	const field = (k: string) => String(form.get(k) ?? "").trim()

	// Honeypot and time trap: pretend success so bots learn nothing.
	if (field("website")) return json({ ok: true })
	const started = Number(field("t"))
	const age = Date.now() - started
	if (!started || age < MIN_FILL_MS || age > MAX_AGE_MS) return json({ ok: true })

	const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim()
	if (limited(ip)) return json({ ok: false, error: "Too many messages. Please try again later." }, 429)

	const name = oneLine(field("name")).slice(0, 120)
	const email = oneLine(field("email")).slice(0, 200)
	const reason = field("reason")
	const message = field("message").slice(0, 5000)
	if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !REASONS.includes(reason)) {
		return json({ ok: false, error: "Please check the highlighted fields." }, 422)
	}

	const html = `<h2>New message from your portfolio</h2>
<p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Reason:</b> ${esc(reason)}</p>
<p style="white-space:pre-wrap">${esc(message)}</p>`

	const key = process.env.RESEND_API_KEY
	if (!key) {
		console.log("[contact] (no RESEND_API_KEY, logging instead)", JSON.stringify({ name, email, reason, message }))
		return json({ ok: true })
	}
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
		body: JSON.stringify({ from: FROM, to: [TO], reply_to: email, subject: `[${reason}] ${name} via josecastillocorcuera.com`, html }),
	})
	if (!res.ok) {
		console.error("[contact] resend error", res.status, await res.text())
		return json({ ok: false, error: "Something went wrong sending your message." }, 502)
	}
	return json({ ok: true })
}
