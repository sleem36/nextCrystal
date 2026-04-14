export default function ConsentPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-10 md:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
        Согласие на обработку персональных данных
      </h1>
      <p className="text-sm leading-7 text-slate-700">
        Пользователь дает согласие на обработку персональных данных: имя,
        телефон, а также технических данных обращения (включая UTM-метки) для
        подбора автомобиля и консультации.
      </p>
      <p className="text-sm leading-7 text-slate-700">
        Согласие действует до достижения целей обработки либо до отзыва в
        порядке, предусмотренном законодательством РФ.
      </p>
    </main>
  );
}
