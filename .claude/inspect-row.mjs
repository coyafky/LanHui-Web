import { chromium } from "playwright";
const b = await chromium.launch({ headless: true });
const ctx = await b.newContext();
const p = await ctx.newPage();
await p.goto("http://localhost:3000/admin/login");
await p.fill("input#username", "admin@lanhui.com");
await p.fill("input#password", "admin123");
await Promise.all([
  p.waitForURL((u) => !u.pathname.startsWith("/admin/login")),
  p.locator("form button[type=submit]").click(),
]);
await p.goto("http://localhost:3000/admin/articles", { waitUntil: "networkidle" });
await p.waitForSelector("table tbody tr");
const html = await p.locator("table tbody tr").first().innerHTML();
console.log("--- first row HTML (first 2000 chars) ---");
console.log(html.slice(0, 2000));
await b.close();
