import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync, existsSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { componentTagger } from "lovable-tagger";

/** GitHub project Pages URL, e.g. https://owner.github.io/repo (no trailing slash). */
function resolveSiteUrl(): string {
  const custom = process.env.VITE_SITE_URL?.trim().replace(/\/$/, "");
  if (custom) return custom;
  const ghRepo = process.env.GITHUB_REPOSITORY;
  if (ghRepo) {
    const [owner, repo] = ghRepo.split("/");
    if (owner && repo) return `https://${owner.toLowerCase()}.github.io/${repo}`;
  }
  return "";
}

/** Vite base path, always with leading and trailing slash. */
function resolveBase(): string {
  const explicit = process.env.VITE_BASE_PATH?.trim();
  if (explicit) {
    const withLeading = explicit.startsWith("/") ? explicit : `/${explicit}`;
    return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
  }
  const ghRepo = process.env.GITHUB_REPOSITORY;
  if (ghRepo) {
    const repo = ghRepo.split("/")[1];
    if (repo) return `/${repo}/`;
  }
  return "/";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const base = resolveBase();
  const siteUrl = resolveSiteUrl();

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: "github-pages-spa-fallback",
        closeBundle() {
          const outDir = pathResolve(__dirname, "dist");
          const indexHtml = pathResolve(outDir, "index.html");
          if (existsSync(indexHtml)) {
            copyFileSync(indexHtml, pathResolve(outDir, "404.html"));
          }
        },
      },
      {
        name: "github-pages-meta",
        transformIndexHtml() {
          if (!siteUrl) return;
          return {
            tags: [
              {
                tag: "link",
                injectTo: "head",
                attrs: { rel: "canonical", href: `${siteUrl}/` },
              },
              {
                tag: "meta",
                injectTo: "head",
                attrs: { property: "og:url", content: `${siteUrl}/` },
              },
            ],
          };
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
