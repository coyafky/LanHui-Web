#!/usr/bin/env node

/**
 * check-static-output.mjs
 *
 * Verifies the static export output (out/) is complete and clean.
 * Checks existence of key pages, absence of API/server references,
 * and sitemap URL coverage.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const OUT_DIR = join(PROJECT_ROOT, "out");

const REQUIRED_PAGES = [
  { path: "index.html", label: "home" },
  { path: "404.html", label: "404" },
  { path: "product/index.html", label: "product" },
  { path: "agent/index.html", label: "agent" },
  { path: "brand/index.html", label: "brand" },
  { path: "contact/index.html", label: "contact" },
];

const FORBIDDEN_STRINGS = [
  "/api/",
  "localhost:3000",
  "_next/image?",
];

const EXPECTED_PROVINCE_PAGES = 31;
const EXPECTED_CITY_PAGES = 333;

function collectHtmlFiles(dir) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...collectHtmlFiles(full));
    } else if (e.name.endsWith(".html") || e.name.endsWith(".htm")) {
      out.push(full);
    }
  }
  return out;
}

function resolveSitemapUrlToPath(url, siteUrl) {
  let path = url;
  if (path.startsWith(siteUrl)) {
    path = path.slice(siteUrl.length);
  }
  if (!path.startsWith("/")) path = "/" + path;
  if (path === "/") return "index.html";
  if (!path.endsWith("/")) path = path + "/";
  return path.replace(/^\//, "") + "index.html";
}

function resolveInternalHrefToPath(href) {
  const path = href.split(/[?#]/, 1)[0];
  if (!path || path === "/") return "index.html";
  const relativePath = decodeURIComponent(path.replace(/^\//, ""));
  if (/\.[a-z0-9]+$/i.test(relativePath)) return relativePath;
  return `${relativePath.replace(/\/$/, "")}/index.html`;
}

function main() {
  const errors = [];
  const warnings = [];

  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    siteUrl = siteUrl.replace(/\/$/, "");
  } else {
    siteUrl = "https://www.lanhui.com";
    warnings.push("NEXT_PUBLIC_SITE_URL not set — using default https://www.lanhui.com for sitemap checks");
  }

  // 1. Check out/ exists
  if (!existsSync(OUT_DIR)) {
    console.error("❌ out/ directory does not exist. Run the static build first.");
    process.exit(1);
  }

  // 2. Check required pages exist
  for (const { path, label } of REQUIRED_PAGES) {
    const filePath = join(OUT_DIR, path);
    if (!existsSync(filePath)) {
      errors.push(`missing-page: out/${path} (${label})`);
    }
  }

  // 3. Collect all HTML files and scan for forbidden strings
  const htmlFiles = collectHtmlFiles(OUT_DIR);
  for (const absPath of htmlFiles) {
    const relPath = absPath.slice(OUT_DIR.length + 1);
    let content;
    try {
      content = readFileSync(absPath, "utf8");
    } catch {
      errors.push(`unreadable: out/${relPath}`);
      continue;
    }
    for (const str of FORBIDDEN_STRINGS) {
      if (content.includes(str)) {
        errors.push(`forbidden-string: out/${relPath} contains "${str}"`);
      }
    }

    const internalHrefs = content.matchAll(/href=["'](\/[^"']*)["']/g);
    for (const match of internalHrefs) {
      const href = match[1];
      if (href.startsWith("//")) continue;
      const target = resolveInternalHrefToPath(href);
      if (!existsSync(join(OUT_DIR, target))) {
        errors.push(`broken-internal-link: out/${relPath} → ${href}`);
      }
    }
  }

  // 4. Ensure the complete static administrative-region directory was emitted.
  const agentDir = join(OUT_DIR, "agent");
  const provinceDirs = readdirSync(agentDir, { withFileTypes: true }).filter(
    (entry) => entry.isDirectory() && entry.name !== "store",
  );
  const provincePageCount = provinceDirs.filter((entry) =>
    existsSync(join(agentDir, entry.name, "index.html")),
  ).length;
  const cityPageCount = provinceDirs.reduce((count, provinceEntry) => {
    const provinceDir = join(agentDir, provinceEntry.name);
    return (
      count +
      readdirSync(provinceDir, { withFileTypes: true }).filter(
        (entry) =>
          entry.isDirectory() &&
          existsSync(join(provinceDir, entry.name, "index.html")),
      ).length
    );
  }, 0);

  if (provincePageCount !== EXPECTED_PROVINCE_PAGES) {
    errors.push(
      `province-page-count: expected ${EXPECTED_PROVINCE_PAGES}, found ${provincePageCount}`,
    );
  }
  if (cityPageCount !== EXPECTED_CITY_PAGES) {
    errors.push(
      `city-page-count: expected ${EXPECTED_CITY_PAGES}, found ${cityPageCount}`,
    );
  }

  // 5. Check sitemap.xml URL coverage
  const sitemapPath = join(OUT_DIR, "sitemap.xml");
  if (existsSync(sitemapPath)) {
    const sitemapContent = readFileSync(sitemapPath, "utf8");
    const urlMatches = sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g);
    const sitemapUrls = [...urlMatches].map((m) => m[1]);

    for (const url of sitemapUrls) {
      const fileRelPath = resolveSitemapUrlToPath(url, siteUrl);
      const fileAbsPath = join(OUT_DIR, fileRelPath);
      if (!existsSync(fileAbsPath)) {
        errors.push(`sitemap-url-missing: ${url} → out/${fileRelPath} does not exist`);
      }
    }
  } else {
    errors.push("missing-sitemap: out/sitemap.xml does not exist");
  }

  // Report
  if (warnings.length > 0) {
    console.warn("⚠️  Warnings:");
    for (const w of warnings) console.warn(`  - ${w}`);
    console.warn();
  }

  if (errors.length > 0) {
    console.error("❌ Static output verification failed!\n");
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  console.log(`✅ Static output verified — ${htmlFiles.length} HTML file(s) checked, all sitemap URLs resolved`);
  process.exit(0);
}

main();
