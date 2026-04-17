"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAuth } from "@/lib/admin-auth";
import { buildFiltersFromFormData } from "@/lib/filter-page-filters";
import {
  createFilterPage,
  deleteFilterPage,
  FILTER_PAGES_CACHE_TAG,
  getFilterPageBySlug,
  updateFilterPage,
} from "@/lib/filter-pages-db";

const SLUG_RE = /^[a-z0-9-]+$/;

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function validateSlug(slug: string) {
  if (!slug) {
    throw new Error("Slug обязателен");
  }
  if (!SLUG_RE.test(slug)) {
    throw new Error("Slug: только латиница, цифры и дефис");
  }
}

function revalidateCatalog() {
  revalidatePath("/cars");
  revalidateTag(FILTER_PAGES_CACHE_TAG, "max");
}

export async function createFilterPageAction(formData: FormData) {
  await requireAdminAuth();
  const slug = getText(formData, "slug");
  validateSlug(slug);
  const exists = await getFilterPageBySlug(slug);
  if (exists) {
    throw new Error("Страница с таким slug уже существует");
  }
  const filters = buildFiltersFromFormData(formData);
  await createFilterPage({
    slug,
    name: getText(formData, "name"),
    filter_json: JSON.stringify(filters),
    title: getText(formData, "title"),
    description: getText(formData, "description"),
    h1: getText(formData, "h1"),
    bottom_title: getText(formData, "bottom_title"),
    bottom_text: getText(formData, "bottom_text"),
  });
  revalidateCatalog();
  redirect("/admin/filter-pages");
}

export async function updateFilterPageAction(formData: FormData) {
  await requireAdminAuth();
  const slug = getText(formData, "slug");
  validateSlug(slug);
  const filters = buildFiltersFromFormData(formData);
  await updateFilterPage(slug, {
    name: getText(formData, "name"),
    filter_json: JSON.stringify(filters),
    title: getText(formData, "title"),
    description: getText(formData, "description"),
    h1: getText(formData, "h1"),
    bottom_title: getText(formData, "bottom_title"),
    bottom_text: getText(formData, "bottom_text"),
  });
  revalidateCatalog();
  redirect("/admin/filter-pages");
}

export async function deleteFilterPageAction(formData: FormData) {
  await requireAdminAuth();
  const slug = getText(formData, "slug");
  if (!slug) {
    throw new Error("Slug обязателен");
  }
  await deleteFilterPage(slug);
  revalidateCatalog();
  redirect("/admin/filter-pages");
}
