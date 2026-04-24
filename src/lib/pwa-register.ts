/**
 * Registers the PWA service worker only in safe environments.
 * Skips: dev mode, iframes (Lovable preview), and Lovable preview hosts.
 */
export function registerPWA() {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) return;
  if (!("serviceWorker" in navigator)) return;

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.dev");

  if (isInIframe || isPreviewHost) {
    // Clean up any previously registered SW so the preview never serves stale content
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    return;
  }

  // @ts-expect-error - virtual module provided by vite-plugin-pwa at build time
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({ immediate: true });
    })
    .catch(() => {
      /* no-op */
    });
}