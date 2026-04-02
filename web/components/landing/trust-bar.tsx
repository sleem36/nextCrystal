export function TrustBar() {
  const points = [
    "г. Барнаул, Павловский тракт, 249",
    "+7 (3852) 55-45-45",
    "Среднее время ответа: до 15 минут",
  ];

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 md:grid-cols-3">
      {points.map((point) => (
        <p key={point} className="font-medium">
          {point}
        </p>
      ))}
    </section>
  );
}
