import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function detectRepo() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const out = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const ssh = out.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);
    const https = out.match(/^https?:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/i);
    const m = ssh || https;
    if (m) return `${m[1]}/${m[2].replace(/\.git$/i, "")}`;
  } catch {
    /* no git remote */
  }
  return "";
}

const repo = detectRepo();
const env = { ...process.env };
if (repo) env.GITHUB_REPOSITORY = repo;

const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");
const result = spawnSync(process.execPath, [viteCli, "build"], {
  cwd: root,
  env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
