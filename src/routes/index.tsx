import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { registerPWA } from "@/lib/pwa-register";
import traceLogo from "@/assets/trace-logo.png";
import traceWordmark from "@/assets/trace-wordmark.png";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trace — Narrativas interativas geolocalizadas" },
      {
        name: "description",
        content:
          "Trace é uma plataforma de narrativas interativas geolocalizadas. Caminhe pela cidade e descubra histórias que acontecem onde você está.",
      },
      { name: "theme-color", content: "#0F122A" },
      { property: "og:title", content: "Trace — Narrativas interativas geolocalizadas" },
      {
        property: "og:description",
        content:
          "Caminhe pela cidade e descubra histórias que acontecem onde você está.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192x192.png" },
    ],
  }),
  component: Index,
});

function Index() {
  const [installEvent, setInstallEvent] = useState<DeferredInstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [browser, setBrowser] = useState<
    "chrome" | "edge" | "firefox" | "safari" | "opera" | "samsung" | "other"
  >("other");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    registerPWA();

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as DeferredInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    // Detect platform
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform("ios");
    else if (/android/i.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    // Detect browser (order matters)
    if (/OPR\/|Opera|OPT\//i.test(ua)) setBrowser("opera");
    else if (/SamsungBrowser/i.test(ua)) setBrowser("samsung");
    else if (/Edg\//i.test(ua)) setBrowser("edge");
    else if (/Firefox|FxiOS/i.test(ua)) setBrowser("firefox");
    else if (/Chrome|CriOS/i.test(ua)) setBrowser("chrome");
    else if (/Safari/i.test(ua)) setBrowser("safari");
    else setBrowser("other");

    // Detect if already running as installed PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    setIsStandalone(standalone);
    if (standalone) setInstalled(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallEvent(null);
      return;
    }
    setShowHelp(true);
  };

  // Hide install button if already running as PWA
  const showInstallButton = !installed && !isStandalone;

  const installLabel = installEvent
    ? "↓ Baixar App"
    : platform === "ios"
      ? "↓ Instalar no iPhone"
      : "↓ Como instalar";

  return (
    <div className="min-h-screen bg-midnight-navy text-soft-white font-sans">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <img src={traceWordmark} alt="Trace" className="h-7 w-auto md:h-8" />
        </div>
        <a
          href="/cravo"
          className="hidden text-xs uppercase tracking-widest text-soft-white/70 transition-colors hover:text-trace-orange md:block"
        >
          Sobre o Cravo →
        </a>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-10 text-center md:pt-20">
        <img src={traceLogo} alt="Trace" className="mb-6 h-32 w-auto md:h-40" />
        <span className="mb-6 inline-block rounded-full border border-soft-white/20 px-4 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-soft-white/70">
          Plataforma · MVP
        </span>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Histórias onde
          <br />
          elas <span className="text-trace-orange">aconteceram.</span>
        </h1>
        <p className="mt-4 font-display text-lg text-trace-blue md:text-xl">
          A cidade como interface.
        </p>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-fog-gray md:text-lg">
          Trace é uma plataforma de <strong className="text-soft-white">narrativas interativas geolocalizadas</strong>.
          Caminhe pela cidade, chegue aos lugares certos e deixe que a história se desenrole
          ao seu redor — através de áudios, imagens e missões reais.
        </p>

        <div className="mt-10 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/map"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-trace-orange px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-[0_8px_24px_-8px_rgba(255,107,0,0.6)] transition hover:bg-trace-orange/90 active:translate-y-[1px] sm:w-auto"
          >
            Começar experiência <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          {showInstallButton && (
            <button
              onClick={handleInstall}
              className="w-full rounded-md border border-soft-white/40 bg-transparent px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-soft-white transition hover:border-soft-white hover:bg-soft-white hover:text-midnight-navy sm:w-auto"
            >
              {installLabel}
            </button>
          )}
          {(installed || isStandalone) && (
            <span className="font-display text-xs uppercase tracking-widest text-urban-cyan">
              ✓ App instalado
            </span>
          )}
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-silver-gray/70">
          Sem login · Funciona no navegador ou como app
        </p>

        {showHelp && (
          <div className="mt-6 max-w-md rounded-lg border border-soft-white/15 bg-graphite p-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-trace-orange">
                {platform === "ios"
                  ? "Instalar no iPhone"
                  : platform === "android"
                    ? "Instalar no Android"
                    : "Instalar no celular"}
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-soft-white/60 transition-colors hover:text-soft-white"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            {platform === "ios" && (
              <ol className="mt-3 space-y-2 text-sm text-fog-gray">
                <li>1. Toque no ícone de <strong>Compartilhar</strong> (□↑) na barra do Safari</li>
                <li>2. Role e escolha <strong>"Adicionar à Tela de Início"</strong></li>
                <li>3. Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
              </ol>
            )}
            {platform === "android" && (
              <div className="mt-3 space-y-3 text-sm text-fog-gray">
                {browser === "opera" && (
                  <ol className="space-y-2">
                    <li>1. Toque no <strong>logo do Opera</strong> (canto inferior direito)</li>
                    <li>2. Vá em <strong>Adicionar a…</strong> → <strong>"Tela inicial"</strong></li>
                    <li>3. Confirme em <strong>"Adicionar"</strong></li>
                    <li className="text-silver-gray">
                      Dica: para uma experiência completa de app, abra o site no <strong>Chrome</strong> e use "Instalar app".
                    </li>
                  </ol>
                )}
                {browser === "samsung" && (
                  <ol className="space-y-2">
                    <li>1. Toque no menu <strong>☰</strong> (canto inferior direito)</li>
                    <li>2. Escolha <strong>"Adicionar página a"</strong> → <strong>"Tela inicial"</strong></li>
                    <li>3. Confirme em <strong>"Adicionar"</strong></li>
                  </ol>
                )}
                {browser === "firefox" && (
                  <ol className="space-y-2">
                    <li>1. Toque no menu <strong>⋮</strong> (canto inferior direito)</li>
                    <li>2. Escolha <strong>"Instalar"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                    <li>3. Confirme em <strong>"Adicionar"</strong></li>
                  </ol>
                )}
                {(browser === "chrome" || browser === "edge") && (
                  <ol className="space-y-2">
                    <li>1. Toque no menu <strong>⋮</strong> (canto superior direito)</li>
                    <li>2. Escolha <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></li>
                    <li>3. Confirme em <strong>"Instalar"</strong></li>
                  </ol>
                )}
                {(browser === "other" || browser === "safari") && (
                  <ol className="space-y-2">
                    <li>1. Abra o menu do seu navegador (ícone <strong>⋮</strong>, <strong>☰</strong> ou logo do app)</li>
                    <li>2. Procure por <strong>"Instalar app"</strong>, <strong>"Adicionar à tela inicial"</strong> ou <strong>"Adicionar a → Tela inicial"</strong></li>
                    <li>3. Confirme em <strong>"Adicionar"</strong> / <strong>"Instalar"</strong></li>
                    <li className="text-silver-gray">
                      Para a melhor experiência, recomendamos abrir no <strong>Chrome</strong> ou <strong>Edge</strong>.
                    </li>
                  </ol>
                )}
              </div>
            )}
            {platform !== "ios" && platform !== "android" && (
              <ol className="mt-3 space-y-2 text-sm text-fog-gray">
                <li>1. Abra <strong>https://usetrace.lovable.app</strong> no celular</li>
                <li>2. No <strong>Chrome (Android)</strong> ou <strong>Safari (iPhone)</strong></li>
                <li>3. Toque novamente em <strong>"Baixar App"</strong> e siga as instruções</li>
              </ol>
            )}
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-silver-gray/70">
              O Trace abrirá em tela cheia, como um app nativo.
            </p>
          </div>
        )}

        <section className="mt-24 grid w-full gap-6 text-left md:grid-cols-3">
          {[
            {
              t: "Escolha",
              d: "Uma experiência. Cada caminhada é um capítulo de uma narrativa real.",
              i: "📍",
            },
            {
              t: "Vá até o lugar",
              d: "Caminhe até o ponto certo e desbloqueie histórias ancoradas no território.",
              i: "🗺️",
            },
            {
              t: "Explore",
              d: "Áudios, textos e imagens revelam camadas invisíveis da cidade.",
              i: "🎧",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="group rounded-xl border border-soft-white/10 bg-graphite/60 p-6 transition hover:border-trace-orange/40 hover:bg-graphite"
            >
              <div className="text-2xl">{f.i}</div>
              <h3 className="mt-3 font-display text-base font-semibold uppercase tracking-[0.15em] text-soft-white">
                {f.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fog-gray">{f.d}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 w-full rounded-xl border border-trace-orange/30 bg-gradient-to-br from-graphite to-midnight-navy p-8 text-left">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-trace-orange">
            Experiência disponível
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Projeto Cravo
          </h2>
          <p className="mt-3 text-sm text-fog-gray md:text-base">
            Reviva a Revolução de 25 de Abril caminhando pelas ruas de Lisboa.
            Uma jornada por arquivos sonoros, locais históricos e a memória viva
            da liberdade.
          </p>
          <Link
            to="/map"
            className="mt-5 inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.2em] text-trace-orange underline-offset-4 hover:underline"
          >
            Ver no mapa →
          </Link>
        </section>
      </main>

      <footer className="border-t border-soft-white/10 px-6 py-6 text-center text-[10px] uppercase tracking-[0.25em] text-silver-gray/70">
        Trace © {new Date().getFullYear()} · MVP
      </footer>
    </div>
  );
}
