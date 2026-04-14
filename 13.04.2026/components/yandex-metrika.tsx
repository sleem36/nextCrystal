import Script from "next/script";

const metrikaScript = (id: number) => `
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

  ym(${id}, "init", {
    clickmap:true,
    trackLinks:true,
    accurateTrackBounce:true
  });
`;

type YandexMetrikaProps = {
  id?: number;
};

export function YandexMetrika({ id }: YandexMetrikaProps) {
  if (!id) {
    return null;
  }

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {metrikaScript(id)}
      </Script>
      <noscript>
        <div>
          {/* Pixel fallback requires a plain img tag. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
