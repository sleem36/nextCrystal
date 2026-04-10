import { expect, test } from "@playwright/test";

const VALID_ID = "toyota-camry-2021-ru234";
const NO_VIDEO_ID = "kia-rio-2022-ru112";
const INVALID_ID = "not-found-id";

test("smoke: главная открывается и есть главный CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Подобрать авто под мой бюджет" })).toBeVisible();
});

test("smoke: /cars принимает фильтры через query (путь квиз -> каталог)", async ({ page }) => {
  await page.goto(
    "/cars?monthlyBudget=35000&maxPriceRub=2500000&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB&transmission=automatic",
  );
  await expect(page.getByRole("heading", { name: "Каталог автомобилей" })).toBeVisible();
  await expect(page).toHaveURL(/\/cars\?.*monthlyBudget=.*maxPriceRub=.*/);
});

test("smoke: /cars -> /cars/[id], есть блок заявки", async ({ page }) => {
  await page.goto("/cars");
  await page.getByRole("link", { name: "Смотреть авто" }).first().click();
  await expect(page).toHaveURL(/\/cars\/[^/?#]+/);
  await expect(page.locator("#lead-form").first()).toBeVisible();
  const phoneButton = page.getByRole("button", { name: "Показать номер" });
  await expect(phoneButton).toBeVisible();
  await phoneButton.click({ force: true });
});

test("smoke: /cars/[id] без видео — CTA видеообзора виден и кликабелен", async ({ page }) => {
  await page.goto(`/cars/${NO_VIDEO_ID}`);
  const videoCta = page.getByRole("link", { name: "Запросить видеообзор" });
  await expect(videoCta).toBeVisible();
  await videoCta.click();
  await expect(page).toHaveURL(/\/cars\/[^/?#]+(#lead-form)?/);
});

test("smoke: /compare?ids=... открывает таблицу", async ({ page }) => {
  await page.goto("/compare?ids=toyota-camry-2021-ru234,kia-rio-2022-ru112");
  await expect(page.getByRole("heading", { name: "Сравнение" })).toBeVisible();
  await expect(page.locator("table")).toBeVisible();
});

test("smoke: /cars/not-found-id -> 404 экран", async ({ page }) => {
  const response = await page.goto(`/cars/${INVALID_ID}`);
  expect(response?.status()).toBe(404);
});

test("smoke: API /api/cars/[id] 200/404", async ({ request }) => {
  const ok = await request.get(`/api/cars/${VALID_ID}`);
  expect(ok.status()).toBe(200);
  const okJson = await ok.json();
  expect(okJson.id).toBe(VALID_ID);

  const notFound = await request.get(`/api/cars/${INVALID_ID}`);
  expect(notFound.status()).toBe(404);
});

test("smoke: credit — monthlyBudget виден, в query и lead context", async ({ page }) => {
  await page.goto(
    "/cars?paymentMethod=credit&monthlyBudget=38000&maxPriceRub=2500000&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
  );
  await expect(page.getByLabel("Платёж в месяц, ₽")).toBeVisible();
  await expect(page.getByLabel("Платёж в месяц, ₽")).toHaveValue("38000");
  await expect(page).toHaveURL(/\/cars\?.*paymentMethod=credit/);
  await expect(page).toHaveURL(/\/cars\?.*monthlyBudget=38000/);

  const leadBlock = page.locator("#catalog-lead");
  await expect(leadBlock.getByText("Перезвоним и уточним варианты в бюджете 38 000 ₽.")).toBeVisible();
});

test("smoke: cash — monthlyBudget скрыт, без query и lead context", async ({ page }) => {
  await page.goto(
    "/cars?paymentMethod=cash&maxPriceRub=2200000&city=%D0%91%D0%B0%D1%80%D0%BD%D0%B0%D1%83%D0%BB",
  );
  await expect(page.getByLabel("Платёж в месяц, ₽")).toHaveCount(0);
  await expect(page.getByLabel("Макс. цена авто, ₽")).toBeVisible();
  await expect(page).toHaveURL(/\/cars\?.*paymentMethod=cash/);
  await expect(page).not.toHaveURL(/\/cars\?.*monthlyBudget=/);

  const leadBlock = page.locator("#catalog-lead");
  await expect(leadBlock.getByText("Перезвоним и уточним варианты в бюджете 2 200 000 ₽.")).toBeVisible();
});
