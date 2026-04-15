/**
 * Ранний fail с понятным сообщением, если package.json битый (частая причина ошибки Tailwind:
 * "Unexpected non-whitespace character after JSON at position …").
 */
import fs from "node:fs";
import path from "node:path";

const pkgPath = path.join(process.cwd(), "package.json");
let raw;
try {
  raw = fs.readFileSync(pkgPath, "utf8");
} catch (e) {
  console.error(`[validate-package-json] Не удалось прочитать ${pkgPath}:`, e);
  process.exit(1);
}
try {
  JSON.parse(raw);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[validate-package-json] ${pkgPath} — невалидный JSON: ${msg}`);
  console.error(
    "Проверьте: нет ли лишней закрывающей «}» или текста после последней «}» в конце файла.",
  );
  process.exit(1);
}
