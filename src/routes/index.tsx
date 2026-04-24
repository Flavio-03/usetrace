import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { registerPWA } from "@/lib/pwa-register";
import traceLogo from "@/assets/trace-logo.png";
import { LangSwitcher, useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const [installEvent, setInstallEvent] = useState<DeferredInstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [browser, setBrowser] = useState<
    "chrome" | "edge" | "firefox" | "safari" | "opera" | "samsung" | "other"
  >("other");
  const [showHelp, setShowHelp] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
    ? t("install.download")
    : platform === "ios"
      ? t("install.iphone")
      : t("install.howto");

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setContactStatus("sending");
    try {
      const res = await fetch("https://formsubmit.co/ajax/contato@looptales.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Nome: formData.get("Nome"),
          Email: formData.get("Email"),
          Mensagem: formData.get("Mensagem"),
          _subject: "Novo contato — Trace",
        }),
      });
      if (!res.ok) throw new Error("Falha");
      setContactStatus("sent");
      form.reset();
    } catch {
      setContactStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-midnight-navy text-soft-white font-sans">
      <header className="relative flex items-center justify-between px-6 py-5 md:px-12">
        <a href="#top" className="flex items-center" aria-label="Trace">
          <img src="/favicon.png" alt="Trace" className="h-10 w-10 md:h-12 md:w-12" />
        </a>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-widest text-soft-white/70 md:flex">
          <a href="#sobre" className="transition-colors hover:text-trace-orange">{t("nav.about")}</a>
          <a href="#experiencias" className="transition-colors hover:text-trace-orange">{t("nav.experiences")}</a>
          <button
            onClick={() => setShowContact(true)}
            className="transition-colors hover:text-trace-orange"
          >
            {t("nav.contact")}
          </button>
          <LangSwitcher />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <LangSwitcher />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-soft-white/15 bg-graphite/80 text-soft-white"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div className="absolute left-0 right-0 top-full z-40 mx-6 mt-2 rounded-lg border border-soft-white/15 bg-graphite p-4 shadow-2xl md:hidden">
            <nav className="flex flex-col gap-3 text-sm uppercase tracking-widest text-soft-white/80">
              <a
                href="#sobre"
                onClick={() => setMenuOpen(false)}
                className="rounded px-2 py-2 transition-colors hover:bg-midnight-navy hover:text-trace-orange"
              >
                {t("nav.about")}
              </a>
              <a
                href="#experiencias"
                onClick={() => setMenuOpen(false)}
                className="rounded px-2 py-2 transition-colors hover:bg-midnight-navy hover:text-trace-orange"
              >
                {t("nav.experiences")}
              </a>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowContact(true);
                }}
                className="rounded px-2 py-2 text-left transition-colors hover:bg-midnight-navy hover:text-trace-orange"
              >
                {t("nav.contact")}
              </button>
            </nav>
          </div>
        )}
      </header>

      <main id="top" className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-6 text-center md:pt-12">
        <img
          src={traceLogo}
          alt="Trace"
          className="mb-8 h-48 w-auto drop-shadow-[0_8px_32px_rgba(255,107,0,0.25)] md:h-64"
        />

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          {t("hero.title.1")}
          <br />
          {t("hero.title.2")} <span className="text-trace-orange">{t("hero.title.3")}</span>
        </h1>
        <p className="mt-4 font-display text-lg text-trace-blue md:text-xl">
          {t("hero.tagline")}
        </p>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-fog-gray md:text-lg">
          {t("hero.desc")}
        </p>

        <div className="mt-10 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/map"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-trace-orange px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-[0_8px_24px_-8px_rgba(255,107,0,0.6)] transition hover:bg-trace-orange/90 active:translate-y-[1px] sm:w-auto"
          >
            {t("hero.cta")} <span className="transition-transform group-hover:translate-x-1">→</span>
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
              {t("install.installed")}
            </span>
          )}
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-silver-gray/70">
          {t("hero.note")}
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

        <section id="sobre" className="mt-24 w-full scroll-mt-24 text-left">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-trace-orange">
            Sobre nós
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            O que é o Trace
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-fog-gray md:text-lg">
            <p>
              O <strong className="text-soft-white">Trace</strong> é uma plataforma de narrativas
              interativas ancoradas no território. Cada experiência transforma uma cidade — ou um
              bairro, uma rua, um edifício — no palco de uma história real, ficcional ou histórica
              que se desenrola enquanto você caminha.
            </p>
            <p>
              Combinamos <strong className="text-soft-white">geolocalização (GPS)</strong>,
              áudio imersivo, arquivos visuais e missões para criar uma camada invisível sobre
              o espaço público. O telemóvel deixa de ser uma tela e passa a ser um portal para
              a memória do lugar.
            </p>
            <p>
              É uma plataforma aberta, criada pela{" "}
              <a
                href="https://looptales.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-trace-orange underline-offset-4 hover:underline"
              >
                Looptales Studio
              </a>
              , para abrigar experiências de diferentes autores, instituições e cidades.
            </p>
          </div>
        </section>

        <section id="experiencias" className="mt-24 w-full scroll-mt-24 text-left">
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-trace-orange">
            Experiências
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Disponíveis agora
          </h2>
          <p className="mt-3 text-sm text-fog-gray md:text-base">
            Cada experiência tem sua própria identidade, ritmo e narrativa.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="flex flex-col rounded-xl border border-trace-orange/30 bg-gradient-to-br from-graphite to-midnight-navy p-6">
              <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-trace-orange">
                Lisboa · Portugal
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">
                Projeto Cravo
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-fog-gray">
                Reviva a Revolução de 25 de Abril caminhando pelas ruas de Lisboa.
                Uma jornada por arquivos sonoros, locais históricos e a memória viva
                da liberdade.
              </p>
              <Link
                to="/map"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-md bg-trace-orange px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-trace-orange/90"
              >
                Ir para a experiência →
              </Link>
            </article>

            <article className="flex flex-col rounded-xl border border-soft-white/10 bg-graphite/40 p-6">
              <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-soft-white/50">
                Em breve
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-soft-white/70">
                Novas narrativas
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-fog-gray">
                Estamos a preparar novas experiências em outras cidades.
                Quer trazer uma história para o Trace?{" "}
                <button
                  onClick={() => setShowContact(true)}
                  className="text-trace-orange underline-offset-4 hover:underline"
                >
                  Fale com a gente
                </button>.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-soft-white/10 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <img src={traceWordmark} alt="Trace" className="h-5 w-auto" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-silver-gray/70">
              © {new Date().getFullYear()} Looptales Studio
            </span>
          </div>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.25em] text-silver-gray/70">
            <a href="#sobre" className="transition-colors hover:text-trace-orange">Sobre</a>
            <a href="#experiencias" className="transition-colors hover:text-trace-orange">Experiências</a>
            <button
              onClick={() => setShowContact(true)}
              className="transition-colors hover:text-trace-orange"
            >
              Contato
            </button>
          </div>
        </div>
      </footer>

      {showContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-navy/80 px-4 backdrop-blur-sm"
          onClick={() => setShowContact(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-soft-white/15 bg-graphite p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowContact(false)}
              className="absolute right-4 top-4 text-soft-white/60 transition-colors hover:text-soft-white"
              aria-label="Fechar"
            >
              ✕
            </button>
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-trace-orange">
              Fale com a gente
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-soft-white">
              Contato
            </h3>
            <p className="mt-2 text-sm text-fog-gray">
              Dúvidas, parcerias ou ideias? Envie uma mensagem.
            </p>

            {contactStatus === "sent" ? (
              <div className="mt-6 rounded-lg border border-urban-cyan/40 bg-urban-cyan/5 p-5 text-center">
                <p className="font-display text-sm font-semibold uppercase tracking-[0.15em] text-urban-cyan">
                  ✓ Mensagem enviada
                </p>
                <p className="mt-2 text-sm text-fog-gray">
                  A nossa equipa responderá em breve.
                </p>
                <button
                  onClick={() => {
                    setShowContact(false);
                    setContactStatus("idle");
                  }}
                  className="mt-4 text-xs uppercase tracking-[0.15em] text-soft-white/60 hover:text-soft-white"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="mt-5 space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-soft-white/70">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="Nome"
                    required
                    className="mt-2 w-full rounded-md border border-soft-white/15 bg-midnight-navy px-3 py-2 text-sm text-soft-white outline-none transition focus:border-trace-orange"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-soft-white/70">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="Email"
                    required
                    className="mt-2 w-full rounded-md border border-soft-white/15 bg-midnight-navy px-3 py-2 text-sm text-soft-white outline-none transition focus:border-trace-orange"
                    placeholder="voce@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-soft-white/70">
                    Mensagem
                  </label>
                  <textarea
                    name="Mensagem"
                    required
                    rows={4}
                    className="mt-2 w-full resize-none rounded-md border border-soft-white/15 bg-midnight-navy px-3 py-2 text-sm text-soft-white outline-none transition focus:border-trace-orange"
                    placeholder="Sua mensagem..."
                  />
                </div>
                {contactStatus === "error" && (
                  <p className="text-xs text-trace-orange">
                    Não foi possível enviar. Tente novamente ou escreva para contato@looptales.com.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={contactStatus === "sending"}
                  className="w-full rounded-md bg-trace-orange px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-trace-orange/90 disabled:opacity-60"
                >
                  {contactStatus === "sending" ? "Enviando..." : "Enviar mensagem"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
