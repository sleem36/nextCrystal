# Фон Hero (full-bleed)

- `hero-loop.mp4` — loop-видео (H.264), в разметке `muted` + `playsInline`. Источник: [Mixkit](https://mixkit.co) — «Highway with cars and trucks during a sunny day» (бесплатная лицензия Mixkit).
- `poster.jpg` — растровый poster (до загрузки видео, `prefers-reduced-motion`, подложка под `<video>`). Скачан с [Unsplash](https://unsplash.com/license) (дорога/пейзаж; при замене файла обновите ссылку и при необходимости атрибуцию автора на странице фото).
- `poster.svg` / `fallback.svg` — лёгкие запасные SVG, если нужно вернуть в `hero-compact.tsx` без растров.

При **`prefers-reduced-motion: reduce`** видео не показывается — только poster (как статичное full-bleed фото).

Затемнение и лёгкий grain задаются в CSS (`--hero-overlay-*`, класс `.hero-grain`), не сплошной чёрный фон.
