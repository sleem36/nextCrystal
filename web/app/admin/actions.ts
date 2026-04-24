"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createCity, deleteCity, getCityById, getCityBySlug, updateCity } from "@/lib/cities-db";
import { createFaq, deleteFaq, getAllFaqs, getFaqById, reorderFaqs, updateFaq } from "@/lib/faq-db";
import { ADMIN_COOKIE_NAME, getAdminSecret } from "@/lib/admin-auth";

const SLUG_RE = /^[a-z0-9-]+$/;

async function isAdmin() {
  const secret = getAdminSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === secret;
}

async function assertAdmin() {
  const ok = await isAdmin();
  if (!ok) {
    throw new Error("Unauthorized");
  }
}

async function withAdmin<T>(action: () => Promise<T>): Promise<T> {
  await assertAdmin();
  return action();
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getActive(formData: FormData, key: string) {
  return formData.get(key) === "on" ? 1 : 0;
}

function splitGalleryText(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeFileBaseName(name: string): string {
  const ext = path.extname(name || "").toLowerCase();
  const base = path
    .basename(name || "image", ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "image"}${ext || ".jpg"}`;
}

async function saveCityGalleryFiles(formData: FormData, citySlug: string): Promise<string[]> {
  const files = formData
    .getAll("contact_gallery_files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) return [];

  const outDir = path.join(process.cwd(), "public", "uploads", "contacts", citySlug);
  await mkdir(outDir, { recursive: true });

  const savedUrls: string[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (!file.type.startsWith("image/")) {
      throw new Error(`Файл "${file.name}" не является изображением`);
    }
    const safeName = normalizeFileBaseName(file.name);
    const fileName = `${Date.now()}-${index}-${safeName}`;
    const filePath = path.join(outDir, fileName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, bytes);
    savedUrls.push(`/uploads/contacts/${citySlug}/${fileName}`);
  }

  return savedUrls;
}

export async function createFaqAction(formData: FormData) {
  return withAdmin(async () => {
    const allFaqs = await getAllFaqs(false);
    await createFaq({
      question: getText(formData, "question"),
      answer: getText(formData, "answer"),
      order_index: allFaqs.length > 0 ? Math.max(...allFaqs.map((f) => f.order_index)) + 1 : 1,
      is_active: getActive(formData, "is_active"),
    });
    revalidatePath("/cars");
    revalidatePath("/admin/faq");
  });
}

export async function updateFaqAction(id: number, formData: FormData) {
  return withAdmin(async () => {
    const current = await getFaqById(id);
    if (!current) throw new Error("FAQ не найден");
    await updateFaq(id, {
      question: getText(formData, "question"),
      answer: getText(formData, "answer"),
      is_active: getActive(formData, "is_active"),
      order_index: current.order_index,
    });
    revalidatePath("/cars");
    revalidatePath("/admin/faq");
  });
}

export async function deleteFaqAction(id: number) {
  return withAdmin(async () => {
    await deleteFaq(id);
    revalidatePath("/cars");
    revalidatePath("/admin/faq");
  });
}

export async function reorderFaqsAction(ids: number[]) {
  return withAdmin(async () => {
    await reorderFaqs(ids);
    revalidatePath("/cars");
    revalidatePath("/admin/faq");
  });
}

export async function createCityAction(formData: FormData) {
  return withAdmin(async () => {
    const slug = getText(formData, "slug").toLowerCase();
    if (!SLUG_RE.test(slug)) {
      throw new Error("Slug: только латиница, цифры и дефис");
    }
    if (await getCityBySlug(slug)) {
      throw new Error("Город с таким slug уже существует");
    }
    const nameImya = getText(formData, "name_imya");
    if (!nameImya) {
      throw new Error("name_imya обязателен");
    }
    const galleryFromText = splitGalleryText(getText(formData, "contact_gallery"));
    const galleryFromFiles = await saveCityGalleryFiles(formData, slug);
    const combinedGallery = [...galleryFromText, ...galleryFromFiles].join("\n");

    await createCity({
      slug,
      name_imya: nameImya,
      name_roditelny: getText(formData, "name_roditelny"),
      name_datelny: "",
      name_vinitelny: "",
      name_tvoritelny: "",
      name_predlozhny: getText(formData, "name_predlozhny"),
      domain_prefix: "",
      contact_address: getText(formData, "contact_address"),
      contact_hours: getText(formData, "contact_hours"),
      contact_phone: getText(formData, "contact_phone"),
      contact_email: getText(formData, "contact_email"),
      contact_legal_email: getText(formData, "contact_legal_email"),
      contact_yandex_map_url: getText(formData, "contact_yandex_map_url"),
      contact_gallery: combinedGallery,
      is_active: getActive(formData, "is_active"),
    });
    revalidatePath("/");
    revalidatePath("/admin/cities");
  });
}

export async function updateCityAction(id: number, formData: FormData) {
  return withAdmin(async () => {
    const current = await getCityById(id);
    if (!current) throw new Error("Город не найден");

    const slug = getText(formData, "slug").toLowerCase();
    if (!SLUG_RE.test(slug)) {
      throw new Error("Slug: только латиница, цифры и дефис");
    }
    const existing = await getCityBySlug(slug);
    if (existing && existing.id !== id) {
      throw new Error("Город с таким slug уже существует");
    }
    const nameImya = getText(formData, "name_imya");
    if (!nameImya) {
      throw new Error("name_imya обязателен");
    }
    const galleryFromText = splitGalleryText(getText(formData, "contact_gallery"));
    const galleryFromFiles = await saveCityGalleryFiles(formData, slug);
    const combinedGallery =
      galleryFromText.length > 0 || galleryFromFiles.length > 0
        ? [...galleryFromText, ...galleryFromFiles].join("\n")
        : current.contact_gallery ?? "";

    await updateCity(id, {
      slug,
      name_imya: nameImya,
      name_roditelny: getText(formData, "name_roditelny"),
      name_datelny: current.name_datelny ?? "",
      name_vinitelny: current.name_vinitelny ?? "",
      name_tvoritelny: current.name_tvoritelny ?? "",
      name_predlozhny: getText(formData, "name_predlozhny"),
      domain_prefix: current.domain_prefix ?? "",
      contact_address: getText(formData, "contact_address"),
      contact_hours: getText(formData, "contact_hours"),
      contact_phone: getText(formData, "contact_phone"),
      contact_email: getText(formData, "contact_email"),
      contact_legal_email: getText(formData, "contact_legal_email"),
      contact_yandex_map_url: getText(formData, "contact_yandex_map_url"),
      contact_gallery: combinedGallery,
      is_active: getActive(formData, "is_active"),
    });
    revalidatePath("/");
    revalidatePath("/admin/cities");
  });
}

export async function deleteCityAction(id: number) {
  return withAdmin(async () => {
    await deleteCity(id);
    revalidatePath("/");
    revalidatePath("/admin/cities");
  });
}
