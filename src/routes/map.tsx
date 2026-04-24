import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import traceWordmark from "@/assets/trace-wordmark.png";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Mapa — Trace" },
      {
        name: "description",
        content: "Descubra experiências de narrativa interativa perto de você.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      },
    ],
  }),
  component: MapPage,
  ssr: false,
});

type Experience = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  lat: number;
  lng: number;
  url: string;
  duration: string;
  language: string;
};

const EXPERIENCES: Experience[] = [
  {
    id: "cravo",
    title: "Projeto Cravo",
    subtitle: "Lisboa · 25 de Abril",
    summary:
      "Caminhe pelas ruas de Lisboa e reviva a Revolução dos Cravos através de arquivos sonoros, missões e locais históricos reais.",
    lat: 38.7118,
    lng: -9.1422,
    url: "/api/public/cravo/teste",
    duration: "~60 min",
    language: "PT / EN",
  },
];

type GeoState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "denied"; message: string }
  | { status: "granted"; lat: number; lng: number };

function MapPage() {
  const navigate = useNavigate();
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });
  const [selected, setSelected] = useState<Experience | null>(null);

  // Request location
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeo({
        status: "denied",
        message: "Seu dispositivo não suporta geolocalização.",
      });
      return;
    }
    setGeo({ status: "requesting" });
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGeo({
          status: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setGeo({
          status: "denied",
          message:
            err.code === 1
              ? "Permissão negada. Ative a localização para usar o Trace."
              : "Não foi possível obter sua localização. Verifique o GPS.",
        });
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Init map once granted
  useEffect(() => {
    if (geo.status !== "granted" || !mapEl.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current) return;

      const map = L.map(mapEl.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([geo.lat, geo.lng], 14);
      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          attribution: "© OpenStreetMap, © CARTO",
        },
      ).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      // user marker (blue dot)
      const userIcon = L.divIcon({
        className: "trace-user-marker",
        html: '<div class="trace-user-pulse"></div><div class="trace-user-dot"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      userMarkerRef.current = L.marker([geo.lat, geo.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      // experience markers
      EXPERIENCES.forEach((exp) => {
        const icon = L.divIcon({
          className: "trace-exp-marker",
          html: `<div class="trace-exp-pin"><span>📍</span></div>`,
          iconSize: [44, 54],
          iconAnchor: [22, 54],
        });
        L.marker([exp.lat, exp.lng], { icon })
          .addTo(map)
          .on("click", () => setSelected(exp));
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [geo.status]);

  // Update user marker position
  useEffect(() => {
    if (geo.status !== "granted" || !userMarkerRef.current) return;
    userMarkerRef.current.setLatLng([geo.lat, geo.lng]);
  }, [geo]);

  // Auto-open popup when within 50m of an experience
  useEffect(() => {
    if (geo.status !== "granted") return;
    EXPERIENCES.forEach((exp) => {
      const d = distanceMeters(geo.lat, geo.lng, exp.lat, exp.lng);
      if (d < 50 && !selected) setSelected(exp);
    });
  }, [geo, selected]);

  return (
    <div className="fixed inset-0 bg-midnight-navy text-soft-white font-sans">
      <style>{`
        .trace-user-marker { position: relative; }
        .trace-user-dot {
          width: 18px; height: 18px; border-radius: 50%;
          background: #1E88E5; border: 3px solid #F7F8FA;
          box-shadow: 0 2px 6px rgba(0,0,0,.4);
          position: absolute; top: 2px; left: 2px;
        }
        .trace-user-pulse {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(30, 136, 229, .35);
          animation: tracePulse 2s infinite;
          position: absolute; top: 0; left: 0;
        }
        @keyframes tracePulse {
          0% { transform: scale(1); opacity: .8; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .trace-exp-pin {
          width: 44px; height: 54px;
          background: #FF6B00;
          border: 3px solid #0F122A;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(255, 107, 0, .35);
          cursor: pointer;
        }
        .trace-exp-pin span { transform: rotate(45deg); font-size: 18px; }
      `}</style>

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between bg-gradient-to-b from-midnight-navy/95 to-transparent px-4 py-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-md border border-soft-white/10 bg-graphite/90 px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.18em] text-soft-white backdrop-blur transition hover:border-trace-orange/50"
        >
          ← Voltar
        </button>
        <span className="flex items-center gap-2 rounded-md border border-soft-white/10 bg-graphite/90 px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.18em] text-soft-white backdrop-blur">
          <img src={traceWordmark} alt="Trace" className="h-4 w-auto" />
          · Mapa
        </span>
      </div>

      {/* Map area */}
      <div ref={mapEl} className="absolute inset-0" />

      {/* Geolocation states */}
      {geo.status !== "granted" && (
        <div className="absolute inset-0 z-[1500] flex flex-col items-center justify-center bg-midnight-navy px-6 text-center">
          <div className="mb-6 text-6xl">📍</div>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {geo.status === "denied" ? "Localização necessária" : "Ativando GPS..."}
          </h2>
          <p className="mt-3 max-w-sm text-sm text-fog-gray">
            {geo.status === "denied"
              ? geo.message
              : "Para o Trace funcionar, precisamos saber onde você está. Aceite a permissão de localização do navegador."}
          </p>
          {geo.status === "denied" && (
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-md bg-trace-orange px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(255,107,0,0.6)] transition hover:bg-trace-orange/90"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Experience popup */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-[1200] animate-in slide-in-from-bottom">
          <div className="mx-auto max-w-lg rounded-t-2xl border-t-4 border-trace-orange bg-graphite p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-trace-orange">
                  {selected.subtitle}
                </span>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-soft-white">
                  {selected.title}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-soft-white/60 transition-colors hover:text-soft-white"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-fog-gray">
              {selected.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.2em] text-silver-gray">
              <span>⏱ {selected.duration}</span>
              <span>🌐 {selected.language}</span>
              {geo.status === "granted" && (
                <span>
                  📏{" "}
                  {Math.round(
                    distanceMeters(geo.lat, geo.lng, selected.lat, selected.lng),
                  )}{" "}
                  m
                </span>
              )}
            </div>

            <a
              href={selected.url}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-trace-orange px-6 py-4 text-center font-display text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_-8px_rgba(255,107,0,0.6)] transition hover:bg-trace-orange/90 active:translate-y-[1px]"
            >
              ▶ Começar experiência
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
