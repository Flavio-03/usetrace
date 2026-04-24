import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs/promises";
import path from "node:path";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".json": "application/json",
};

const ASSETS_ROOT = path.resolve(process.cwd(), "src/static/Assets");

export const Route = createFileRoute("/api/public/cravo/assets/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rel = (params as { _splat?: string })._splat ?? "";
        const safe = rel.replace(/\\/g, "/").replace(/\.\.+/g, "");
        const filePath = path.join(ASSETS_ROOT, safe);
        if (!filePath.startsWith(ASSETS_ROOT)) {
          return new Response("Forbidden", { status: 403 });
        }
        try {
          const data = await fs.readFile(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const type = MIME[ext] ?? "application/octet-stream";
          return new Response(new Uint8Array(data), {
            headers: {
              "content-type": type,
              "cache-control": "public, max-age=3600",
            },
          });
        } catch {
          return new Response("Not Found", { status: 404 });
        }
      },
    },
  },
});
