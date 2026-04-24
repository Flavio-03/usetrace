import { createFileRoute } from "@tanstack/react-router";
import html from "../static/cravo-experiencia.html?raw";

export const Route = createFileRoute("/api/public/cravo/experiencia")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
