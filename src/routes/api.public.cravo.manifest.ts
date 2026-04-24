import { createFileRoute } from "@tanstack/react-router";

const manifest = {
  name: "Projeto Cravo",
  short_name: "Cravo",
  description: "Experiência imersiva de GPS pelas ruas de Lisboa — Revolução de 25 de Abril.",
  start_url: "/api/public/cravo/teste",
  scope: "/api/public/cravo/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#1B1B1B",
  theme_color: "#C1121F",
  icons: [
    {
      src: "/api/public/cravo/assets/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: "/api/public/cravo/assets/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};

export const Route = createFileRoute("/api/public/cravo/manifest")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(manifest), {
          headers: {
            "content-type": "application/manifest+json; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        }),
    },
  },
});
