import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between gap-4 border-b bg-[#1B1B1B] px-4 py-2 text-sm text-[#F2E8CF]">
        <span className="font-mono uppercase tracking-widest">
          Projeto Cravo — Preview
        </span>
        <div className="flex gap-2">
          <a
            href="/api/public/cravo/landing"
            target="cravo-frame"
            className="rounded border border-[#F2E8CF]/40 px-3 py-1 hover:bg-[#C1121F]"
          >
            Landing
          </a>
          <a
            href="/api/public/cravo/experiencia"
            target="cravo-frame"
            className="rounded border border-[#F2E8CF]/40 px-3 py-1 hover:bg-[#C1121F]"
          >
            Experiência
          </a>
        </div>
      </div>
      <iframe
        name="cravo-frame"
        src="/api/public/cravo/landing"
        title="Projeto Cravo"
        className="h-[calc(100vh-40px)] w-full border-0"
      />
    </div>
  );
}
