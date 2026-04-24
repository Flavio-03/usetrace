import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { registerPWA } from "@/lib/pwa-register";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trace — Narrativas interativas geolocalizadas" },
      {
        name: "description",
        content:
          "Trace é uma plataforma de narrativas interativas geolocalizadas. Caminhe pela cidade e descubra histórias que acontecem onde você está.",
      },
      { name: "theme-color", content: "#1B1B1B" },
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
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    registerPWA();

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    // Detect platform
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setPlatform("ios");
    else if (/android/i.test(ua)) setPlatform("android");
    else setPlatform("desktop");

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
      installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallEvent(null);
      return;
    }
    if (platform === "ios") {
      setShowIosHelp(true);
      return;
    }
    if (platform === "android") {
      alert(
        "Abra o menu do Chrome (⋮) e escolha 'Instalar app' ou 'Adicionar à tela inicial'. O app abrirá em tela cheia, como um app nativo.",
      );
      return;
    }
    // Desktop fallback
    alert(
      "Para instalar como app no celular:\n\n1. Abra https://usetrace.lovable.app no Chrome do seu Android (ou Safari do iPhone)\n2. Toque no botão 'Baixar App'\n3. Confirme a instalação",
    );
  };

  // Hide install button if already running as PWA
  const showInstallButton = !installed && !isStandalone;

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F2E8CF]">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold tracking-[0.3em]">TRACE</span>
        </div>
        <a
          href="/cravo"
          className="hidden text-xs uppercase tracking-widest text-[#F2E8CF]/70 hover:text-[#C1121F] md:block"
        >
          Sobre o Cravo →
        </a>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-10 text-center md:pt-20">
        <span className="mb-6 inline-block rounded-full border border-[#F2E8CF]/20 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[#F2E8CF]/70">
          Plataforma · MVP
        </span>

        <h1 className="font-serif text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
          Histórias que acontecem
          <br />
          <span className="text-[#C1121F]">onde você está.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#F2E8CF]/80 md:text-lg">
          Trace é uma plataforma de <strong>narrativas interativas geolocalizadas</strong>.
          Caminhe pela cidade, chegue aos lugares certos e deixe que a história se desenrole
          ao seu redor — através de áudios, imagens e missões reais.
        </p>

        <div className="mt-10 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/map"
            className="w-full rounded-md bg-[#C1121F] px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-[#F2E8CF] shadow-[4px_4px_0_#000] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:w-auto"
          >
            Entrar →
          </Link>
          {showInstallButton && (
            <button
              onClick={handleInstall}
              className="w-full rounded-md border-2 border-[#F2E8CF] bg-transparent px-8 py-4 font-mono text-sm font-bold uppercase tracking-widest text-[#F2E8CF] transition hover:bg-[#F2E8CF] hover:text-[#0E0E0E] sm:w-auto"
            >
              ↓ Baixar App
            </button>
          )}
          {(installed || isStandalone) && (
            <span className="font-mono text-xs uppercase tracking-widest text-[#386641]">
              ✓ App instalado
            </span>
          )}
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#F2E8CF]/40">
          Sem login · Funciona no navegador ou como app
        </p>

        {showIosHelp && (
          <div className="mt-6 max-w-md rounded-lg border border-[#F2E8CF]/20 bg-[#1B1B1B] p-5 text-left">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#C1121F]">
                Instalar no iPhone
              </h3>
              <button
                onClick={() => setShowIosHelp(false)}
                className="text-[#F2E8CF]/60 hover:text-[#F2E8CF]"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <ol className="mt-3 space-y-2 text-sm text-[#F2E8CF]/80">
              <li>1. Toque no ícone de <strong>Compartilhar</strong> (□↑) na barra do Safari</li>
              <li>2. Role e escolha <strong>"Adicionar à Tela de Início"</strong></li>
              <li>3. Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
            </ol>
            <p className="mt-3 font-mono text-[10px] text-[#F2E8CF]/50">
              O Trace abrirá em tela cheia, como um app nativo.
            </p>
          </div>
        )}

        <section className="mt-24 grid w-full gap-6 text-left md:grid-cols-3">
          {[
            {
              t: "📍 Geolocalizado",
              d: "Cada experiência acontece num lugar real. Vá até lá para desbloquear.",
            },
            {
              t: "🎧 Imersivo",
              d: "Áudios narrados, imagens de arquivo e missões que envolvem o ambiente.",
            },
            {
              t: "🗺️ Sem fricção",
              d: "Abra, ative o GPS e comece. Sem cadastro, sem fila, sem ingresso.",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-lg border border-[#F2E8CF]/15 bg-[#1B1B1B] p-6"
            >
              <h3 className="font-mono text-sm uppercase tracking-widest text-[#F2E8CF]">
                {f.t}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#F2E8CF]/70">{f.d}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 w-full rounded-xl border border-[#C1121F]/40 bg-gradient-to-br from-[#1B1B1B] to-[#2a0a0e] p-8 text-left">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#C1121F]">
            Experiência disponível
          </span>
          <h2 className="mt-3 font-serif text-3xl font-black md:text-4xl">
            Projeto Cravo
          </h2>
          <p className="mt-3 text-sm text-[#F2E8CF]/80 md:text-base">
            Reviva a Revolução de 25 de Abril caminhando pelas ruas de Lisboa.
            Uma jornada por arquivos sonoros, locais históricos e a memória viva
            da liberdade.
          </p>
          <Link
            to="/map"
            className="mt-5 inline-block font-mono text-xs uppercase tracking-widest text-[#C1121F] underline-offset-4 hover:underline"
          >
            Ver no mapa →
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#F2E8CF]/10 px-6 py-6 text-center font-mono text-[10px] uppercase tracking-widest text-[#F2E8CF]/40">
        Trace © {new Date().getFullYear()} · MVP
      </footer>
    </div>
  );
}
