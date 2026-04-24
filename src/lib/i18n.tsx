import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "pt" | "en" | "es";

type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = {
  pt: {
    "nav.about": "SOBRE NÓS",
    "nav.experiences": "EXPERIÊNCIAS",
    "nav.contact": "​CONTATO",
    "hero.title.1": "Histórias onde",
    "hero.title.2": "elas",
    "hero.title.3": "aconteceram.",
    "hero.tagline": "A cidade como interface.",
    "hero.desc": "Trace é uma plataforma de narrativas interativas geolocalizadas. Caminhe pela cidade, chegue aos lugares certos e deixe que a história se desenrole ao seu redor — através de áudios, imagens e missões reais.",
    "hero.cta": "Começar experiência",
    "hero.note": "Sem login · Funciona no navegador ou como app",
    "install.download": "↓ Baixar App",
    "install.iphone": "↓ Instalar no iPhone",
    "install.howto": "↓ Como instalar",
    "install.installed": "✓ App instalado",
    "feature.1.t": "Escolha",
    "feature.1.d": "Uma experiência. Cada caminhada é um capítulo de uma narrativa real.",
    "feature.2.t": "Vá até o lugar",
    "feature.2.d": "Caminhe até o ponto certo e desbloqueie histórias ancoradas no território.",
    "feature.3.t": "Explore",
    "feature.3.d": "Áudios, textos e imagens revelam camadas invisíveis da cidade.",
    "about.eyebrow": "Sobre nós",
    "about.title": "O que é o Trace",
    "about.p1": "O Trace é uma plataforma de narrativas interativas ancoradas no território. Cada experiência transforma uma cidade — ou um bairro, uma rua, um edifício — no palco de uma história real, ficcional ou histórica que se desenrola enquanto você caminha.",
    "about.p2": "Combinamos geolocalização (GPS), áudio imersivo, arquivos visuais e missões para criar uma camada invisível sobre o espaço público. O telemóvel deixa de ser uma tela e passa a ser um portal para a memória do lugar.",
    "about.p3.before": "É uma plataforma aberta, criada pela ",
    "about.p3.link": "Looptales Studio",
    "about.p3.after": ", para abrigar experiências de diferentes autores, instituições e cidades.",
    "exp.eyebrow": "Experiências",
    "exp.title": "Disponíveis agora",
    "exp.subtitle": "Cada experiência tem sua própria identidade, ritmo e narrativa.",
    "exp.cravo.location": "Lisboa · Portugal",
    "exp.cravo.title": "Projeto Cravo",
    "exp.cravo.desc": "Reviva a Revolução de 25 de Abril caminhando pelas ruas de Lisboa. Uma jornada por arquivos sonoros, locais históricos e a memória viva da liberdade.",
    "exp.cta": "Ir para a experiência →",
    "exp.soon.eyebrow": "Em breve",
    "exp.soon.title": "Novas narrativas",
    "exp.soon.desc.before": "Estamos a preparar novas experiências em outras cidades. Quer trazer uma história para o Trace? ",
    "exp.soon.desc.link": "Fale com a gente",
    "footer.about": "SOBRE NÓS",
    "footer.experiences": "EXPERIÊNCIAS",
    "footer.contact": "​CONTATO",
    "contact.eyebrow": "Fale com a gente",
    "contact.title": "​CONTATO",
    "contact.subtitle": "Dúvidas, parcerias ou ideias? Envie uma mensagem.",
    "contact.name": "Nome",
    "contact.name.ph": "Seu nome",
    "contact.email": "E-mail",
    "contact.email.ph": "voce@exemplo.com",
    "contact.message": "Mensagem",
    "contact.message.ph": "Sua mensagem...",
    "contact.send": "Enviar mensagem",
    "contact.sending": "Enviando...",
    "contact.sent": "✓ Mensagem enviada",
    "contact.sent.note": "A nossa equipa responderá em breve.",
    "contact.close": "Fechar",
    "contact.error": "Não foi possível enviar. Tente novamente ou escreva para contato@looptales.com.",
    "map.back": "← Voltar",
    "map.title": "Mapa",
    "map.locating": "Ativando GPS...",
    "map.denied": "Localização necessária",
    "map.retry": "Tentar novamente",
    "map.start": "▶ Começar experiência",
  },
  en: {
    "nav.about": "ABOUT US",
    "nav.experiences": "EXPERIENCES",
    "nav.contact": "CONTACT",
    "hero.title.1": "Stories where",
    "hero.title.2": "they",
    "hero.title.3": "happened.",
    "hero.tagline": "The city as interface.",
    "hero.desc": "Trace is a platform for interactive geolocated narratives. Walk through the city, reach the right places, and let the story unfold around you — through audio, images and real-world missions.",
    "hero.cta": "Start experience",
    "hero.note": "No login · Works in browser or as an app",
    "install.download": "↓ Download App",
    "install.iphone": "↓ Install on iPhone",
    "install.howto": "↓ How to install",
    "install.installed": "✓ App installed",
    "feature.1.t": "Choose",
    "feature.1.d": "An experience. Each walk is a chapter of a real narrative.",
    "feature.2.t": "Go to the place",
    "feature.2.d": "Walk to the right spot and unlock stories anchored in the territory.",
    "feature.3.t": "Explore",
    "feature.3.d": "Audio, text and images reveal invisible layers of the city.",
    "about.eyebrow": "About",
    "about.title": "What is Trace",
    "about.p1": "Trace is a platform for interactive narratives anchored in the territory. Each experience turns a city — or a neighborhood, a street, a building — into the stage for a real, fictional or historical story that unfolds as you walk.",
    "about.p2": "We combine geolocation (GPS), immersive audio, visual archives and missions to create an invisible layer over public space. Your phone stops being a screen and becomes a portal to the memory of the place.",
    "about.p3.before": "It is an open platform, created by ",
    "about.p3.link": "Looptales Studio",
    "about.p3.after": ", to host experiences from different authors, institutions and cities.",
    "exp.eyebrow": "Experiences",
    "exp.title": "Available now",
    "exp.subtitle": "Each experience has its own identity, pace and narrative.",
    "exp.cravo.location": "Lisbon · Portugal",
    "exp.cravo.title": "Cravo Project",
    "exp.cravo.desc": "Relive the April 25th Revolution by walking through the streets of Lisbon. A journey through sound archives, historic places and the living memory of freedom.",
    "exp.cta": "Go to experience →",
    "exp.soon.eyebrow": "Coming soon",
    "exp.soon.title": "New narratives",
    "exp.soon.desc.before": "We are preparing new experiences in other cities. Want to bring a story to Trace? ",
    "exp.soon.desc.link": "Get in touch",
    "footer.about": "ABOUT US",
    "footer.experiences": "EXPERIENCES",
    "footer.contact": "CONTACT",
    "contact.eyebrow": "Get in touch",
    "contact.title": "CONTACT",
    "contact.subtitle": "Questions, partnerships or ideas? Send us a message.",
    "contact.name": "Name",
    "contact.name.ph": "Your name",
    "contact.email": "Email",
    "contact.email.ph": "you@example.com",
    "contact.message": "Message",
    "contact.message.ph": "Your message...",
    "contact.send": "Send message",
    "contact.sending": "Sending...",
    "contact.sent": "✓ Message sent",
    "contact.sent.note": "Our team will reply soon.",
    "contact.close": "Close",
    "contact.error": "Could not send. Try again or write to contato@looptales.com.",
    "map.back": "← Back",
    "map.title": "Map",
    "map.locating": "Activating GPS...",
    "map.denied": "Location required",
    "map.retry": "Try again",
    "map.start": "▶ Start experience",
  },
  es: {
    "nav.about": "SOBRE NOSOTROS",
    "nav.experiences": "EXPERIENCIAS",
    "nav.contact": "CONTACTO",
    "hero.title.1": "Historias donde",
    "hero.title.2": "ellas",
    "hero.title.3": "ocurrieron.",
    "hero.tagline": "La ciudad como interfaz.",
    "hero.desc": "Trace es una plataforma de narrativas interactivas geolocalizadas. Camina por la ciudad, llega a los lugares correctos y deja que la historia se despliegue a tu alrededor — a través de audios, imágenes y misiones reales.",
    "hero.cta": "Comenzar experiencia",
    "hero.note": "Sin login · Funciona en el navegador o como app",
    "install.download": "↓ Descargar App",
    "install.iphone": "↓ Instalar en iPhone",
    "install.howto": "↓ Cómo instalar",
    "install.installed": "✓ App instalada",
    "feature.1.t": "Elige",
    "feature.1.d": "Una experiencia. Cada caminata es un capítulo de una narrativa real.",
    "feature.2.t": "Ve al lugar",
    "feature.2.d": "Camina hasta el punto exacto y desbloquea historias ancladas en el territorio.",
    "feature.3.t": "Explora",
    "feature.3.d": "Audios, textos e imágenes revelan capas invisibles de la ciudad.",
    "about.eyebrow": "Sobre nosotros",
    "about.title": "Qué es Trace",
    "about.p1": "Trace es una plataforma de narrativas interactivas ancladas en el territorio. Cada experiencia transforma una ciudad — o un barrio, una calle, un edificio — en el escenario de una historia real, ficticia o histórica que se desarrolla mientras caminas.",
    "about.p2": "Combinamos geolocalización (GPS), audio inmersivo, archivos visuales y misiones para crear una capa invisible sobre el espacio público. El móvil deja de ser una pantalla y se convierte en un portal a la memoria del lugar.",
    "about.p3.before": "Es una plataforma abierta, creada por ",
    "about.p3.link": "Looptales Studio",
    "about.p3.after": ", para alojar experiencias de diferentes autores, instituciones y ciudades.",
    "exp.eyebrow": "Experiencias",
    "exp.title": "Disponibles ahora",
    "exp.subtitle": "Cada experiencia tiene su propia identidad, ritmo y narrativa.",
    "exp.cravo.location": "Lisboa · Portugal",
    "exp.cravo.title": "Proyecto Cravo",
    "exp.cravo.desc": "Revive la Revolución del 25 de Abril caminando por las calles de Lisboa. Un viaje por archivos sonoros, lugares históricos y la memoria viva de la libertad.",
    "exp.cta": "Ir a la experiencia →",
    "exp.soon.eyebrow": "Próximamente",
    "exp.soon.title": "Nuevas narrativas",
    "exp.soon.desc.before": "Estamos preparando nuevas experiencias en otras ciudades. ¿Quieres traer una historia a Trace? ",
    "exp.soon.desc.link": "Habla con nosotros",
    "footer.about": "SOBRE NOSOTROS",
    "footer.experiences": "EXPERIENCIAS",
    "footer.contact": "CONTACTO",
    "contact.eyebrow": "Habla con nosotros",
    "contact.title": "CONTACTO",
    "contact.subtitle": "¿Dudas, alianzas o ideas? Envíanos un mensaje.",
    "contact.name": "Nombre",
    "contact.name.ph": "Tu nombre",
    "contact.email": "Email",
    "contact.email.ph": "tu@ejemplo.com",
    "contact.message": "Mensaje",
    "contact.message.ph": "Tu mensaje...",
    "contact.send": "Enviar mensaje",
    "contact.sending": "Enviando...",
    "contact.sent": "✓ Mensaje enviado",
    "contact.sent.note": "Nuestro equipo responderá pronto.",
    "contact.close": "Cerrar",
    "contact.error": "No se pudo enviar. Inténtalo de nuevo o escribe a contato@looptales.com.",
    "map.back": "← Volver",
    "map.title": "Mapa",
    "map.locating": "Activando GPS...",
    "map.denied": "Ubicación requerida",
    "map.retry": "Intentar de nuevo",
    "map.start": "▶ Comenzar experiencia",
  },
};

function detectLang(): Lang {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem("trace-lang") as Lang | null;
  if (stored && ["pt", "en", "es"].includes(stored)) return stored;
  const nav = (navigator.language || "pt").toLowerCase();
  if (nav.startsWith("en")) return "en";
  if (nav.startsWith("es")) return "es";
  return "pt";
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");
  useEffect(() => {
    setLangState(detectLang());
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("trace-lang", l);
    } catch {}
  };
  const t = (k: string) => dictionaries[lang][k] ?? dictionaries.pt[k] ?? k;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function LangSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const langs: { code: Lang; label: string }[] = [
    { code: "pt", label: "PT" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
  ];
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-md border border-soft-white/15 bg-graphite/80 p-0.5 backdrop-blur ${className}`}
    >
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`rounded px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.18em] transition ${
            lang === l.code
              ? "bg-trace-orange text-white"
              : "text-soft-white/60 hover:text-soft-white"
          }`}
          aria-label={`Switch to ${l.label}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}