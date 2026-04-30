"use client";

import Link from "next/link";
import {
  FormEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRuPhoneInput, isValidRuPhone } from "@/lib/phone";

const POPUP_DISMISSED_KEY = "callback_popup_dismissed_v1";
const POPUP_SUBMITTED_KEY = "callback_popup_submitted_v1";
const ANY_LEAD_SUBMITTED_KEY = "aurora_any_lead_submitted_v1";
const AUTO_THEME_IMAGES = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=640&q=80",
];

type PopupCallbackProps = {
  delayMs?: number;
  showOnExit?: boolean;
  backgroundImageUrl?: string;
  videoUrl?: string;
  logoUrl?: string;
  enableTilt?: boolean;
  enableParticles?: boolean;
  enableAnimations?: boolean;
};

type Ripple = {
  id: number;
  x: number;
  y: number;
};

export function PopupCallback({
  delayMs = 30000,
  showOnExit = true,
  backgroundImageUrl,
  videoUrl,
  logoUrl = "/icon.svg",
  enableTilt = true,
  enableParticles = true,
  enableAnimations = true,
}: PopupCallbackProps) {
  const [open, setOpen] = useState(false);
  const [teaserOpen, setTeaserOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consentData, setConsentData] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const shownRef = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduceMotion = useReducedMotion();
  const effectsEnabled = enableAnimations && !reduceMotion;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 140, damping: 24, mass: 0.7 });
  const springY = useSpring(pointerY, { stiffness: 140, damping: 24, mass: 0.7 });
  const rotateX = useTransform(springY, [-1, 1], [0, 0]);
  const rotateY = useTransform(springX, [-1, 1], [0, 0]);
  const depthFarX = useTransform(springX, [-1, 1], [-12, 12]);
  const depthFarY = useTransform(springY, [-1, 1], [-9, 9]);

  const phoneError = useMemo(() => {
    if (!phone.trim()) return "Укажите телефон.";
    if (!isValidRuPhone(phone)) return "Введите корректный номер.";
    return "";
  }, [phone]);

  const canSubmit = !submitting && consentData && !phoneError && name.trim().length >= 2;

  const persistHidden = useCallback((submitted = false) => {
    window.localStorage.setItem(POPUP_DISMISSED_KEY, "1");
    if (submitted) {
      window.localStorage.setItem(POPUP_SUBMITTED_KEY, "1");
      window.localStorage.setItem(ANY_LEAD_SUBMITTED_KEY, "1");
    }
  }, []);

  const canShowPopup = useCallback(() => {
    if (shownRef.current) return false;
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return false;
    if (window.localStorage.getItem(POPUP_DISMISSED_KEY) === "1") return false;
    if (window.localStorage.getItem(POPUP_SUBMITTED_KEY) === "1") return false;
    if (window.localStorage.getItem(ANY_LEAD_SUBMITTED_KEY) === "1") return false;
    return true;
  }, []);

  const showPopup = useCallback(() => {
    if (!canShowPopup()) return;
    shownRef.current = true;
    setTeaserOpen(true);
  }, [canShowPopup]);

  const openPopupFromTestButton = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(POPUP_DISMISSED_KEY);
      window.localStorage.removeItem(POPUP_SUBMITTED_KEY);
    }
    shownRef.current = true;
    setStatus("idle");
    setErrorMessage("");
    setOpen(false);
    setTeaserOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setOpen(false);
    persistHidden(false);
  }, [persistHidden]);

  const closeTeaser = useCallback(() => {
    setTeaserOpen(false);
    persistHidden(false);
  }, [persistHidden]);

  const openFromTeaser = useCallback(() => {
    shownRef.current = true;
    setStatus("idle");
    setErrorMessage("");
    setTeaserOpen(false);
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [closePopup, open]);

  useEffect(() => {
    if (open) return;
    if (!videoRef.current) return;
    try {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    } catch {
      // Ignore media state errors.
    }
  }, [open]);

  useEffect(() => {
    if (!open || !enableParticles || !effectsEnabled) return;
    const canvas = canvasRef.current;
    const container = cardRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const particles = Array.from({ length: 18 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0009,
      a: 0.18 + Math.random() * 0.2,
    }));

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * window.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * window.devicePixelRatio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const draw = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        const px = p.x * rect.width;
        const py = p.y * rect.height;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fill();
      }
      rafId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [effectsEnabled, enableParticles, open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!canShowPopup()) return;

    const timerId = window.setTimeout(() => {
      showPopup();
    }, delayMs);

    const onMouseOut = (event: MouseEvent) => {
      if (!showOnExit || shownRef.current) return;
      if (event.relatedTarget) return;
      if (event.clientY > 0) return;
      showPopup();
    };

    if (showOnExit) {
      document.addEventListener("mouseout", onMouseOut);
    }

    return () => {
      window.clearTimeout(timerId);
      if (showOnExit) {
        document.removeEventListener("mouseout", onMouseOut);
      }
    };
  }, [canShowPopup, delayMs, showOnExit, showPopup]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setErrorMessage("");

    if (!canSubmit) {
      setStatus("error");
      if (!consentData) {
        setErrorMessage("Подтвердите согласие на обработку персональных данных.");
      } else if (name.trim().length < 2) {
        setErrorMessage("Укажите имя (не менее 2 символов).");
      }
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          consent_data: consentData,
          consent_marketing: consentMarketing,
          source: "popup_callback",
          page: window.location.href,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Ошибка, попробуйте позже.");
      }

      setStatus("success");
      persistHidden(true);
      window.setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Ошибка, попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const onCardMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !effectsEnabled) return;
    const node = cardRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nx = (event.clientX - centerX) / (rect.width / 2);
    const ny = (event.clientY - centerY) / (rect.height / 2);
    pointerX.set(Math.max(-1, Math.min(1, nx)));
    pointerY.set(Math.max(-1, Math.min(1, ny)));
  };

  const onCardMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const createRipple = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 550);
  };

  const cardStyle =
    enableTilt && effectsEnabled
      ? {
          transformStyle: "preserve-3d" as const,
          perspective: 1200,
        }
      : undefined;

  return (
    <>
      <AnimatePresence>
        {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Закрыть попап"
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            onClick={closePopup}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-callback-title"
            aria-describedby="popup-callback-desc"
            ref={cardRef}
            onMouseMove={onCardMouseMove}
            onMouseLeave={onCardMouseLeave}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            style={enableTilt && effectsEnabled ? { ...cardStyle, rotateX, rotateY } : cardStyle}
            className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-3xl border border-white/25 bg-white shadow-[0_24px_70px_rgba(2,6,23,0.35)]"
          >
            <motion.div
              className="absolute inset-0"
              style={enableTilt && effectsEnabled ? { x: depthFarX, y: depthFarY } : undefined}
            >
              {videoUrl ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-30 blur-[2px]"
                  src={videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : backgroundImageUrl ? (
                <div
                  className="absolute inset-0 scale-[1.04] blur-[2px]"
                  style={{
                    backgroundImage: `url(${backgroundImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(135deg, #0B1220 0%, #111827 50%, #0B1220 100%)",
                    }}
                  />
                  <div className="absolute -left-10 -top-12 h-48 w-48 rotate-[-10deg] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    <img src={AUTO_THEME_IMAGES[0]} alt="" className="h-full w-full object-cover opacity-65" />
                  </div>
                  <div className="absolute right-[-36px] top-10 h-44 w-44 rotate-[9deg] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    <img src={AUTO_THEME_IMAGES[1]} alt="" className="h-full w-full object-cover opacity-65" />
                  </div>
                  <div className="absolute bottom-[-42px] left-1/2 h-44 w-44 -translate-x-1/2 rotate-[-4deg] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    <img src={AUTO_THEME_IMAGES[2]} alt="" className="h-full w-full object-cover opacity-65" />
                  </div>
                </>
              )}
            </motion.div>
            <div className="absolute inset-0 bg-black/58 backdrop-blur-[3px]" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(2,6,23,0.58)]" />
            {enableParticles && effectsEnabled ? (
              <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
            ) : null}

            <div className="relative p-5 text-slate-900 sm:p-6">
              <button
                type="button"
                onClick={closePopup}
                className="absolute right-4 top-4 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white/90 text-slate-500 transition-colors hover:border-[color:var(--color-brand-accent)]/50 hover:text-[color:var(--color-brand-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-accent)]"
              >
                <span className="sr-only">Закрыть</span>
                <X className="h-4 w-4" aria-hidden />
              </button>

              <motion.div
                className="pr-10 relative z-10"
                style={undefined}
              >
                <motion.img
                  src={logoUrl}
                  alt="Aurora Auto"
                  className="mb-3 h-12 w-12 rounded-xl border border-white/40 bg-white/70 p-1 shadow-[0_8px_20px_rgba(0,118,234,0.25)]"
                  animate={
                    effectsEnabled
                      ? { scale: [1, 1.08, 1], rotate: [0, 360] }
                      : undefined
                  }
                  transition={{
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <h2 id="popup-callback-title" className="text-2xl font-bold tracking-[0.02em] text-white">
                  Давайте мы Вам позвоним
                </h2>
                <p id="popup-callback-desc" className="mt-2 text-sm font-light text-slate-100">
                  Наши специалисты оперативно ответят на все интересующие вопросы.
                </p>

                <p className="mt-3 text-xs font-medium text-slate-200">
                  Подберем автомобиль с учетом бюджета, проверим историю и поможем с оформлением.
                </p>
              </motion.div>

              {status === "success" ? (
                <p className="mt-6 text-sm font-medium text-emerald-200">Спасибо, мы перезвоним!</p>
              ) : (
                <motion.form
                  onSubmit={onSubmit}
                  className="mt-6 space-y-3.5 relative z-10"
                  style={undefined}
                >
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-100">Ваше имя</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Например, Алексей"
                      className="h-11 w-full rounded-xl border border-white/35 bg-white/20 px-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-200 focus:border-[color:var(--color-brand-accent)] focus:shadow-[0_0_0_2px_rgba(0,118,234,0.25)]"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-100">Телефон</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(formatRuPhoneInput(event.target.value))}
                      placeholder="+7 (___) ___-__-__"
                      className="h-11 w-full rounded-xl border border-white/35 bg-white/20 px-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-200 focus:border-[color:var(--color-brand-accent)] focus:shadow-[0_0_0_2px_rgba(0,118,234,0.25)]"
                      required
                    />
                  </label>

                  <label className="flex items-start gap-2 text-xs text-slate-100">
                    <input
                      type="checkbox"
                      checked={consentData}
                      onChange={(event) => setConsentData(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-white/35 bg-white/20 text-[color:var(--color-brand-accent)] focus:ring-[color:var(--color-brand-accent)]"
                    />
                    <span>
                      Я согласен(на) на{" "}
                      <Link
                        href="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-[color:var(--color-brand-accent)]"
                      >
                        обработку персональных данных
                      </Link>
                      .
                    </span>
                  </label>

                  <label className="flex items-start gap-2 text-xs text-slate-100">
                    <input
                      type="checkbox"
                      checked={consentMarketing}
                      onChange={(event) => setConsentMarketing(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-white/35 bg-white/20 text-[color:var(--color-brand-accent)] focus:ring-[color:var(--color-brand-accent)]"
                    />
                    <span>Я согласен(на) на получение рекламно-информационных рассылок.</span>
                  </label>

                  <div className="relative overflow-hidden rounded-[var(--radius-button,0.5rem)]">
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      onClick={createRipple}
                      className="relative mt-1 w-full bg-[color:var(--color-brand-accent)] text-white shadow-[0_10px_24px_rgba(0,118,234,0.3)] transition-colors duration-200 hover:bg-[color:var(--color-brand-accent-hover)]"
                    >
                      {ripples.map((ripple) => (
                        <motion.span
                          key={ripple.id}
                          initial={{ opacity: 0.35, scale: 0 }}
                          animate={{ opacity: 0, scale: 9 }}
                          transition={{ duration: 0.55, ease: "easeOut" }}
                          className="pointer-events-none absolute rounded-full bg-white/70"
                          style={{
                            left: ripple.x - 8,
                            top: ripple.y - 8,
                            width: 16,
                            height: 16,
                          }}
                        />
                      ))}
                      <span className="relative z-10">{submitting ? "Отправка..." : "Позвоните мне"}</span>
                    </Button>
                  </div>

                  {status === "error" && (errorMessage || phoneError) ? (
                    <p className="text-sm text-rose-200">{errorMessage || phoneError}</p>
                  ) : null}
                </motion.form>
              )}
            </div>
          </motion.div>
        </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {teaserOpen && !open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-40 max-w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(2,6,23,0.22)]"
          >
            <button
              type="button"
              onClick={closeTeaser}
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Скрыть виджет"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <p className="pr-8 text-sm font-semibold text-[color:var(--color-brand-primary)]">
              Нужна помощь с подбором?
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Подскажем по бюджету, кредиту и подходящим вариантам за пару минут.
            </p>
            <button
              type="button"
              onClick={openFromTeaser}
              className="mt-3 inline-flex h-9 items-center rounded-lg bg-[color:var(--color-brand-accent)] px-3 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-accent-hover)]"
            >
              Открыть форму
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={openPopupFromTestButton}
        className="fixed bottom-36 right-4 z-40 inline-flex h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-[color:var(--color-brand-primary)] shadow-[0_6px_18px_rgba(15,23,42,0.15)] transition hover:border-[color:var(--color-brand-accent)] hover:text-[color:var(--color-brand-accent)]"
      >
        Тест попапа
      </button>
    </>
  );
}
