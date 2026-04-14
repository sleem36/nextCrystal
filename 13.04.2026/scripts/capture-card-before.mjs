import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 2200 } });

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator("text=Семейный автомобиль").first().click();
await page.locator("text=Показать подходящие варианты").first().click();
await page.locator("#results").scrollIntoViewIfNeeded();
await page.waitForTimeout(700);
await page.locator("#results").screenshot({ path: "artifacts/card-before.png" });

await browser.close();
