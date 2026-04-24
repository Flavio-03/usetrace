import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cravo")({
  head: () => ({
    meta: [
      { title: "Projeto Cravo — Trace" },
      {
        name: "description",
        content:
          "Reviva a Revolução de 25 de Abril caminhando pelas ruas de Lisboa.",
      },
    ],
  }),
  component: CravoLanding,
});

function CravoLanding() {
  return (
    <iframe
      src="/api/public/cravo/landing"
      title="Projeto Cravo"
      className="h-screen w-screen border-0"
    />
  );
}
