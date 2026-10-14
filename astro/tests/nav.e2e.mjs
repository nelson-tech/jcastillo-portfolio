// Cross-browser (chromium + webkit) regression for client-side (swup) navigation.
// Bug 2026-10-12: case-study toggles didn't open after swup nav from /work until refresh.
// Usage: BASE_URL=http://localhost:3333 node tests/nav.e2e.mjs [chromium|webkit ...]
import { chromium, webkit } from "playwright"

const BASE = (process.env.BASE_URL || "http://localhost:3333").replace(/\/$/, "")
const SHOTS = process.env.SHOT_DIR
const engines = { chromium, webkit }
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : ["chromium", "webkit"]
const results = []
let failed = false

const check = async (name, fn) => {
	try { await fn(); results.push(["PASS", name]) } catch (e) { failed = true; results.push(["FAIL", `${name}: ${e.message.split("\n")[0]}`]) }
}
const assert = (c, m) => { if (!c) throw new Error(m) }
const mark = (page) => page.evaluate(() => (window.__noReload = 1))
const noReload = async (page) => assert(await page.evaluate(() => window.__noReload === 1), "page did a full reload")
const settle = async (page, path) => {
	await page.waitForURL((u) => new URL(u).pathname.replace(/\/$/, "") === path.replace(/\/$/, ""), { timeout: 15000 })
	await page.waitForTimeout(900) // swup transition + scripts plugin
}
const swupReady = (page) => page.waitForFunction(() => document.documentElement.classList.contains("swup-enabled"), null, { timeout: 15000 })

async function testCases(page, tag, browser) {
	const toggles = page.locator(".case-toggle")
	const n = await toggles.count()
	assert(n === 7, `expected 7 case toggles (5 ventures + 2 studies), got ${n}`)
	for (let i = 0; i < n; i++) {
		const btn = toggles.nth(i)
		const id = await btn.getAttribute("aria-controls")
		await btn.click()
		await page.waitForFunction((id) => document.getElementById(id)?.dataset.open === "true", id, { timeout: 3000 })
			.catch(() => { throw new Error(`${tag}: ${id} did not open`) })
		await page.waitForTimeout(400)
		if (SHOTS) await page.screenshot({ path: `${SHOTS}/live-casestudy-nav-${browser}-${id}.png` })
	}
}

for (const name of wanted) {
	const browser = await engines[name].launch()
	const errors = []
	let page
	const fresh = async () => {
		if (page) await page.context().close().catch(() => {})
		page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
		page.on("pageerror", (e) => /ResizeObserver loop/.test(e.message) || errors.push(e.message))
	}
	await fresh()
	const T = (s) => `[${name}] ${s}`

	await page.goto(`${BASE}/work`); await swupReady(page); await mark(page)
	const tabs = await page.$$eval('#swup a[href^="/work/"]', (as) => [...new Set(as.map((a) => new URL(a.href).pathname))])
	await check(T(`/work lists tabs (${tabs.join(", ")})`), async () => assert(tabs.length >= 2, "no tabs"))

	for (const tab of tabs) {
		await check(T(`/work -> ${tab} via swup, then back`), async () => {
			await page.click(`#swup a[href="${tab}"]`); await settle(page, tab); await noReload(page)
			if (tab.endsWith("data-product-development")) await testCases(page, tab, name)
			await page.goBack(); await settle(page, "/work"); await noReload(page)
		})
	}
	await check(T("revisit Development via swup (back/forward), case studies open"), async () => {
		await fresh()
		await page.goto(`${BASE}/work`); await swupReady(page); await mark(page)
		await page.click('#swup a[href="/work/data-product-development"]'); await settle(page, "/work/data-product-development")
		await page.goBack(); await settle(page, "/work"); await page.goForward(); await settle(page, "/work/data-product-development")
		await noReload(page); await testCases(page, "after back/forward", name)
	})
	await check(T("bfcache/pageshow: full nav away then Back, case studies open"), async () => {
		await fresh()
		await page.goto(`${BASE}/work/data-product-development`); await swupReady(page)
		await page.goto(`${BASE}/`); await swupReady(page)
		await page.goBack(); await page.waitForTimeout(900)
		await testCases(page, "after bfcache restore", name)
	})
	await check(T("Contact via swup: JS validation runs (no native submit)"), async () => {
		await fresh()
		await page.goto(`${BASE}/work`); await swupReady(page); await mark(page)
		await page.click('a[href="/contact"]'); await settle(page, "/contact"); await noReload(page)
		await page.click('#contact-form button[type=submit]'); await page.waitForTimeout(300)
		await noReload(page)
		assert((await page.getAttribute("#cf-name", "aria-invalid")) === "true", "validation did not run")
	})
	await check(T("no page errors"), async () => assert(!errors.length, errors.join(" | ")))
	await browser.close()
}
for (const [s, n] of results) console.log(s, n)
process.exit(failed ? 1 : 0)
