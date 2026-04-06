import { toYouTubeEmbedUrl } from "@/lib/video-embed";

export function CarVideoSection({ url }: { url?: string }) {
  if (!url) {
    return (
      <section className="rounded-[var(--radius-card)] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
        <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Видеообзор</h2>
        <p className="mt-2">Видео скоро появится — уточните детали у менеджера при звонке.</p>
      </section>
    );
  }

  const embed = toYouTubeEmbedUrl(url);
  if (!embed) {
    return (
      <section className="rounded-[var(--radius-card)] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)]">Видеообзор</h2>
        <p className="mt-2 text-sm text-slate-600">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[color:var(--color-brand-accent)] underline-offset-4 hover:underline"
          >
            Открыть видео в новой вкладке
          </a>
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[color:var(--color-brand-primary)] md:text-xl">Видеообзор</h2>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-slate-200 bg-black shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="aspect-video w-full">
        <iframe
          src={embed}
          title="Видеообзор автомобиля"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      </div>
    </section>
  );
}
