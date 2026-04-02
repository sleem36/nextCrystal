import { Button } from "@/components/ui/button";

type HeroProps = {
  onPrimaryClick: () => void;
  offer: string;
};

export function Hero({ onPrimaryClick, offer }: HeroProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-[0_16px_45px_rgba(2,6,23,0.08)] sm:px-6 sm:py-9 md:px-10 md:py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">
        Crystal Motors, Барнаул
      </p>
      <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl md:mt-3 md:text-5xl">
        Автомобиль с понятным платежом за 5 минут
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        {offer}. Ответ менеджера в течение 15 минут.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600 sm:text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1">Проверенные автомобили</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Прозрачные условия</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Без навязанных услуг</span>
      </div>
      <div className="mt-6">
        <Button className="w-full sm:w-auto" onClick={onPrimaryClick}>
          Подобрать авто под мой бюджет
        </Button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Финальные условия зависят от выбранного автомобиля и условий банка.
      </p>
      <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600 sm:text-sm">
        г. Барнаул, Павловский тракт, 249 • +7 (3852) 55-45-45
      </div>
      </section>
  );
}
