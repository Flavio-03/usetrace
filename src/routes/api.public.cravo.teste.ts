import { createFileRoute } from "@tanstack/react-router";
import html from "../static/cravo-teste.html?raw";

export const Route = createFileRoute("/api/public/cravo/teste")({
  server: {
    handlers: {
      GET: () =>
        new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  },
});
