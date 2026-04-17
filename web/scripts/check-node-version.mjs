/**
 * Guard script against ABI mismatch for better-sqlite3.
 * Project runtime must use Node 22.x (NODE_MODULE_VERSION 127).
 */

const requiredMajor = 22;
const requiredModulesAbi = "127";
const currentMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
const currentAbi = process.versions.modules;

if (currentMajor !== requiredMajor || currentAbi !== requiredModulesAbi) {
  console.error("[check-node-version] Неверная версия Node.js для этого проекта.");
  console.error(`[check-node-version] Текущая: Node ${process.versions.node}, ABI ${currentAbi}.`);
  console.error(
    `[check-node-version] Требуется: Node ${requiredMajor}.x, ABI ${requiredModulesAbi} (иначе падает better-sqlite3).`,
  );
  console.error("");
  console.error("Выполните один из вариантов:");
  console.error('1) PowerShell: $env:Path = "c:\\SCANNER\\dll32\\resources\\app\\resources\\helpers;$env:Path"');
  console.error("2) nvm: nvm use 22");
  console.error("3) Cursor: в корне репозитория есть .vscode/settings.json (PATH с Node 22) — закройте терминал, откройте новый или Reload Window");
  console.error("node -v");
  console.error("npm rebuild better-sqlite3");
  console.error("npm run dev");
  process.exit(1);
}
