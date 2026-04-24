import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

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
    <div className="fixed inset-0 bg-[#0E0E0E] text-[#F2E8CF]">
      <style>{`
        .trace-user-marker { position: relative; }
        .trace-user-dot {
          width: 18px; height: 18px; border-radius: 50%;
          background: #1a73e8; border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,.4);
          position: absolute; top: 2px; left: 2px;
        }
        .trace-user-pulse {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(26, 115, 232, .35);
          animation: tracePulse 2s infinite;
          position: absolute; top: 0; left: 0;
        }
        @keyframes tracePulse {
          0% { transform: scale(1); opacity: .8; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .trace-exp-pin {
          width: 44px; height: 54px;
          background: #C1121F;
          border: 3px solid #1B1B1B;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,.4);
          cursor: pointer;
        }
        .trace-exp-pin span { transform: rotate(45deg); font-size: 18px; }
      `}</style>

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between bg-gradient-to-b from-[#0E0E0E] to-transparent px-4 py-3">
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-md bg-[#1B1B1B]/90 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[#F2E8CF] backdrop-blur"
        >
          ← Voltar
        </button>
        <span className="rounded-md bg-[#1B1B1B]/90 px-3 py-2 font-mono text-xs uppercase tracking-widest text-[#F2E8CF] backdrop-blur">
          TRACE · Mapa
        </span>
      </div>

      {/* Map area */}
      <div ref={mapEl} className="absolute inset-0" />

      {/* Geolocation states */}
      {geo.status !== "granted" && (
        <div className="absolute inset-0 z-[1500] flex flex-col items-center justify-center bg-[#0E0E0E] px-6 text-center">
          <div className="mb-6 text-6xl">📍</div>
          <h2 className="font-serif text-3xl font-black">
            {geo.status === "denied" ? "Localização necessária" : "Ativando GPS..."}
          </h2>
          <p className="mt-3 max-w-sm text-sm text-[#F2E8CF]/70">
            {geo.status === "denied"
              ? geo.message
              : "Para o Trace funcionar, precisamos saber onde você está. Aceite a permissão de localização do navegador."}
          </p>
          {geo.status === "denied" && (
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-md bg-[#C1121F] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[#F2E8CF]"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {/* Experience popup */}
      {selected && (
        <div className="absolute inset-x-0 bottom-0 z-[1200] animate-in slide-in-from-bottom">
          <div className="mx-auto max-w-lg rounded-t-2xl border-t-4 border-[#C1121F] bg-[#1B1B1B] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#C1121F]">
                  {selected.subtitle}
                </span>
                <h3 className="mt-1 font-serif text-2xl font-black text-[#F2E8CF]">
                  {selected.title}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-[#F2E8CF]/60 hover:text-[#F2E8CF]"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#F2E8CF]/80">
              {selected.summary}
            </p>

            <div className="mt-4 flex gap-4 font-mono text-[10px] uppercase tracking-widest text-[#F2E8CF]/60">
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
              className="mt-5 block w-full rounded-md bg-[#C1121F] px-6 py-4 text-center font-mono text-sm font-bold uppercase tracking-widest text-[#F2E8CF] shadow-[4px_4px_0_#000] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              ▶ Start
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
