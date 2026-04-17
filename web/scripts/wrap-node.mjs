/**
 * Запускает переданный скрипт или next CLI через предпочитаемый Node (22.x),
 * чтобы не зависеть от PATH в терминале (например Node 24 в Cursor).
 *
 * Порядок выбора node.exe:
 * - NEXTCRYSTAL_NODE — полный путь к node.exe
 * - NODE22_PATH — каталог с node.exe или путь к node.exe
 * - c:\SCANNER\dll32\resources\app\resources\helpers\node.exe (локальная установка)
 * - process.execPath — текущий node из PATH
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

function resolveNodeExe() {
  const fromEnv = process.env.NEXTCRYSTAL_NODE?.trim();
  if (fromEnv) {
    if (fromEnv.toLowerCase().endsWith(".exe") && existsSync(fromEnv)) return fromEnv;
    const guess = path.join(fromEnv, "node.exe");
    if (existsSync(guess)) return guess;
  }

  const dirOrExe = process.env.NODE22_PATH?.trim();
  if (dirOrExe) {
    if (dirOrExe.toLowerCase().endsWith(".exe") && existsSync(dirOrExe)) return dirOrExe;
    const guess = path.join(dirOrExe, "node.exe");
    if (existsSync(guess)) return guess;
  }

  const helper = "c:\\SCANNER\\dll32\\resources\\app\\resources\\helpers\\node.exe";
  if (existsSync(helper)) return helper;

  return process.execPath;
}

const nodeExe = resolveNodeExe();
const rest = process.argv.slice(2);
if (rest.length === 0) {
  console.error("[wrap-node] Укажите скрипт и аргументы, например: node scripts/wrap-node.mjs scripts/check-node-version.mjs");
  process.exit(1);
}

const spawnArgs = rest.map((a) => {
  if (path.isAbsolute(a)) return a;
  if (a.startsWith(".") || a.includes(path.sep) || a.includes("/")) {
    return path.resolve(process.cwd(), a);
  }
  return a;
});

const r = spawnSync(nodeExe, spawnArgs, { stdio: "inherit", cwd: process.cwd(), shell: false });
process.exit(r.status ?? 1);
