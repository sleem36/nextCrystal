"use server";

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

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getActive(formData: FormData, key: string) {
  return formData.get(key) === "on" ? 1 : 0;
}

export async function createFaqAction(formData: FormData) {
  await assertAdmin();
  const allFaqs = await getAllFaqs(false);
  await createFaq({
    question: getText(formData, "question"),
    answer: getText(formData, "answer"),
    order_index: allFaqs.length > 0 ? Math.max(...allFaqs.map((f) => f.order_index)) + 1 : 1,
    is_active: getActive(formData, "is_active"),
  });
  revalidatePath("/cars");
  revalidatePath("/admin/faq");
}

export async function updateFaqAction(id: number, formData: FormData) {
  await assertAdmin();
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
}

export async function deleteFaqAction(id: number) {
  await assertAdmin();
  await deleteFaq(id);
  revalidatePath("/cars");
  revalidatePath("/admin/faq");
}

export async function reorderFaqsAction(ids: number[]) {
  await assertAdmin();
  await reorderFaqs(ids);
  revalidatePath("/cars");
  revalidatePath("/admin/faq");
}

export async function createCityAction(formData: FormData) {
  await assertAdmin();
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
  await createCity({
    slug,
    name_imya: nameImya,
    name_roditelny: getText(formData, "name_roditelny"),
    name_datelny: "",
    name_vinitelny: "",
    name_tvoritelny: "",
    name_predlozhny: getText(formData, "name_predlozhny"),
    domain_prefix: "",
    is_active: getActive(formData, "is_active"),
  });
  revalidatePath("/");
  revalidatePath("/admin/cities");
}

export async function updateCityAction(id: number, formData: FormData) {
  await assertAdmin();
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

  await updateCity(id, {
    slug,
    name_imya: nameImya,
    name_roditelny: getText(formData, "name_roditelny"),
    name_datelny: current.name_datelny ?? "",
    name_vinitelny: current.name_vinitelny ?? "",
    name_tvoritelny: current.name_tvoritelny ?? "",
    name_predlozhny: getText(formData, "name_predlozhny"),
    domain_prefix: current.domain_prefix ?? "",
    is_active: getActive(formData, "is_active"),
  });
  revalidatePath("/");
  revalidatePath("/admin/cities");
}

export async function deleteCityAction(id: number) {
  await assertAdmin();
  await deleteCity(id);
  revalidatePath("/");
  revalidatePath("/admin/cities");
}
