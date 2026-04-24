import Database from "better-sqlite3";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "app.db");
const db = new Database(dbPath);

const PUBLIC_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "contacts");

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function ensureSafeFileName(input, fallback = "image.png") {
  const base = path
    .basename(input || fallback)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || fallback;
}

function extensionFromContentType(contentType) {
  const value = String(contentType || "").toLowerCase();
  if (value.includes("image/jpeg")) return ".jpg";
  if (value.includes("image/png")) return ".png";
  if (value.includes("image/webp")) return ".webp";
  if (value.includes("image/gif")) return ".gif";
  if (value.includes("image/avif")) return ".avif";
  if (value.includes("image/svg+xml")) return ".svg";
  return "";
}

async function downloadToLocal(url, citySlug, index) {
  const parsed = new URL(url);
  const fromPath = ensureSafeFileName(parsed.pathname.split("/").pop(), `image-${index + 1}.png`);
  const cityDir = path.join(PUBLIC_UPLOAD_ROOT, citySlug);
  await mkdir(cityDir, { recursive: true });

  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const extFromType = extensionFromContentType(response.headers.get("content-type"));
  const hasExt = path.extname(fromPath).length > 0;
  const fileName = hasExt ? fromPath : `${fromPath}${extFromType || ".png"}`;
  const localFsPath = path.join(cityDir, fileName);
  const localWebPath = `/uploads/contacts/${citySlug}/${fileName}`;
  await writeFile(localFsPath, bytes);
  return localWebPath;
}

async function main() {
  const rows = db
    .prepare("SELECT id, slug, contact_gallery FROM cities WHERE contact_gallery IS NOT NULL AND trim(contact_gallery) <> ''")
    .all();

  const updateStmt = db.prepare("UPDATE cities SET contact_gallery = ? WHERE id = ?");

  let updatedCities = 0;
  let downloadedFiles = 0;
  const failures = [];

  for (const row of rows) {
    const urls = splitLines(row.contact_gallery);
    const nextGallery = [];

    for (let i = 0; i < urls.length; i += 1) {
      const item = urls[i];
      if (item.startsWith("/")) {
        nextGallery.push(item);
        continue;
      }
      try {
        const localPath = await downloadToLocal(item, row.slug, i);
        nextGallery.push(localPath);
        downloadedFiles += 1;
      } catch (error) {
        failures.push({ city: row.slug, url: item, error: error instanceof Error ? error.message : String(error) });
      }
    }

    if (nextGallery.length > 0) {
      updateStmt.run(nextGallery.join("\n"), row.id);
      updatedCities += 1;
    }
  }

  console.log(`Updated cities: ${updatedCities}`);
  console.log(`Downloaded files: ${downloadedFiles}`);
  if (failures.length > 0) {
    console.log(`Failures: ${failures.length}`);
    console.log(JSON.stringify(failures, null, 2));
  } else {
    console.log("Failures: 0");
  }
}

await main();
