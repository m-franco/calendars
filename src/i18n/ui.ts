// Núcleo de i18n de la web. Textos estáticos + helpers para construir
// nombres, slugs, rutas y frases localizadas (ES / EN / PT).
import { selecciones, gentilicios, confederaciones, type Lang } from "./countries";
import { getCalendarFilePath } from "../utils/teamImages";

export const calendarBasePath = "myfixtu.re/";

export type { Lang };

export const LANGS: Lang[] = ["es", "en", "pt"];
export const DEFAULT_LANG: Lang = "es";
export const LANG_NAMES: Record<Lang, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};
export const LANG_FLAGS: Record<Lang, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
  pt: "🇧🇷",
};

// Prefijo de ruta para los <a href> internos (sin el basePath).
// Cada idioma vive bajo su segmento: /es, /en, /pt.
export function langSegment(lang: Lang): string {
  return `${lang}/`;
}

// URL interna (con basePath + segmento de idioma) a partir de segmentos.
export function urlFor(lang: Lang, segments: (string | undefined)[] = []): string {
  const base = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/`;
  return base + langSegment(lang) + segments.filter(Boolean).join("/");
}

// { es, en, pt } -> URL equivalente en cada idioma (para el selector).
export function alternatesFor(
  builder: (lang: Lang) => string
): Record<Lang, string> {
  return LANGS.reduce((acc, l) => {
    acc[l] = builder(l);
    return acc;
  }, {} as Record<Lang, string>);
}

// ---------------------------------------------------------------------------
// Textos estáticos
// ---------------------------------------------------------------------------
type Dict = {
  homeTitle: string;
  homeMetaDescription: string;
  homeHeadingA: string; // primera palabra
  homeHeadingB: string; // palabra con gradiente
  homeInstructions: string;
  tournamentInstructions: string;
  yearArchivePrefix: (year: string) => string;
  subscribeLine: (subject: string) => string;
  secondLine: string;
  calendarOf: (subject: string) => string;
  previousEditions: string;
  edition: string;
  sectionByConfederation: string;
  sectionByCountry: string;
};

export const strings: Record<Lang, Dict> = {
  es: {
    homeTitle: "myFixtu.re",
    homeMetaDescription:
      "Suscribite al calendario de tu equipo y tendrás todos los partidos incluidos en el calendario de tu teléfono o tu computadora.",
    homeHeadingA: "Calendarios",
    homeHeadingB: "deportivos",
    homeInstructions:
      "Suscribite al calendario de tu equipo y tendrás todos los partidos incluidos en el calendario de tu teléfono o tu computadora.",
    tournamentInstructions:
      "Suscribite al calendario de tu equipo, de todo el grupo o de toda la copa y tendrás todos los partidos incluidos en el calendario de tu teléfono o tu computadora.",
    yearArchivePrefix: (year) => `Archivo ${year}: `,
    subscribeLine: (subject) => `Suscribite al calendario de ${subject}.`,
    secondLine:
      "Tendrás todos los partidos incluidos en el calendario de tu teléfono o tu computadora.",
    calendarOf: (subject) => `Calendario de ${subject}`,
    previousEditions: "Ediciones anteriores",
    edition: "Edición",
    sectionByConfederation: "Calendarios por confederación",
    sectionByCountry: "Calendarios de todos los equipos de un país",
  },
  en: {
    homeTitle: "myFixtu.re",
    homeMetaDescription:
      "Subscribe to your team's calendar and you'll have all the matches included in your phone or computer calendar.",
    homeHeadingA: "Sports",
    homeHeadingB: "calendars",
    homeInstructions:
      "Subscribe to your team's calendar and you'll have all the matches included in your phone or computer calendar.",
    tournamentInstructions:
      "Subscribe to your team's, your whole group's or the entire cup's calendar and you'll have all the matches included in your phone or computer calendar.",
    yearArchivePrefix: (year) => `${year} archive: `,
    subscribeLine: (subject) => `Subscribe to the calendar of ${subject}.`,
    secondLine:
      "You'll have all the matches included in your phone or computer calendar.",
    calendarOf: (subject) => `Calendar of ${subject}`,
    previousEditions: "Previous editions",
    edition: "Edition",
    sectionByConfederation: "Calendars by confederation",
    sectionByCountry: "Calendars of all the teams from a country",
  },
  pt: {
    homeTitle: "myFixtu.re",
    homeMetaDescription:
      "Inscreva-se no calendário do seu time e você terá todas as partidas incluídas no calendário do seu telefone ou computador.",
    homeHeadingA: "Calendários",
    homeHeadingB: "esportivos",
    homeInstructions:
      "Inscreva-se no calendário do seu time e você terá todas as partidas incluídas no calendário do seu telefone ou computador.",
    tournamentInstructions:
      "Inscreva-se no calendário do seu time, de todo o grupo ou de toda a copa e você terá todas as partidas incluídas no calendário do seu telefone ou computador.",
    yearArchivePrefix: (year) => `Arquivo ${year}: `,
    subscribeLine: (subject) => `Inscreva-se no calendário de ${subject}.`,
    secondLine:
      "Você terá todas as partidas incluídas no calendário do seu telefone ou computador.",
    calendarOf: (subject) => `Calendário de ${subject}`,
    previousEditions: "Edições anteriores",
    edition: "Edição",
    sectionByConfederation: "Calendários por confederação",
    sectionByCountry: "Calendários de todos os times de um país",
  },
};

export function t(lang: Lang): Dict {
  return strings[lang];
}

// ---------------------------------------------------------------------------
// Apoyo económico
// ---------------------------------------------------------------------------
export const PAYPAL_URL = "https://paypal.me/mftams";

export const supportSlug: Record<Lang, string> = {
  es: "apoyar",
  en: "support",
  pt: "apoiar",
};

export const supportCopy: Record<
  Lang,
  { nav: string; title: string; intro: string; button: string }
> = {
  es: {
    nav: "Apoyar",
    title: "Apoyar el proyecto",
    intro:
      "Si querés ayudar a que este proyecto siga creciendo, podés hacer un aporte. ¡Gracias!",
    button: "Apoyar a través de PayPal",
  },
  en: {
    nav: "Support",
    title: "Support the project",
    intro:
      "If you'd like to help this project keep growing, you can make a contribution. Thank you!",
    button: "Support through PayPal",
  },
  pt: {
    nav: "Apoiar",
    title: "Apoie o projeto",
    intro:
      "Se você quer ajudar este projeto a continuar crescendo, pode fazer uma contribuição. Obrigado!",
    button: "Apoiar através do PayPal",
  },
};

export function supportUrl(lang: Lang): string {
  return urlFor(lang, [supportSlug[lang]]);
}

// ---------------------------------------------------------------------------
// Nombres / slugs localizados
// ---------------------------------------------------------------------------
export function tournamentTitle(href: string, lang: Lang): string {
  if (href === "libertadores")
    return lang === "en" ? "Libertadores Cup" : "Copa Libertadores";
  if (href === "sudamericana")
    return { es: "Copa Sudamericana", en: "Sudamericana Cup", pt: "Copa Sul-Americana" }[lang];
  // mundial
  return { es: "Copa del Mundo", en: "World Cup", pt: "Copa do Mundo" }[lang];
}

// Texto de suscripción de una copa (orden: primero la copa entera, luego las
// variantes), pensado para que lo más importante quede antes del recorte en
// los metatags. Mundial agrupa por confederación; clubes por país.
export function subscribeCupText(tournament: string, lang: Lang): string {
  const isWC = tournament === "mundial";
  const wholeMap: Record<Lang, Record<string, string>> = {
    es: { mundial: "del Mundial", libertadores: "de la Copa Libertadores", sudamericana: "de la Copa Sudamericana" },
    en: { mundial: "World Cup", libertadores: "Libertadores Cup", sudamericana: "Sudamericana Cup" },
    pt: { mundial: "da Copa do Mundo", libertadores: "da Copa Libertadores", sudamericana: "da Copa Sul-Americana" },
  };
  const whole = wholeMap[lang][tournament] ?? tournamentTitle(tournament, lang);

  if (lang === "es") {
    const grouping = isWC ? "todos los equipos de una confederación" : "todos los equipos de tu país";
    return `Suscribite al calendario ${whole} y tendrás todos los partidos incluidos en el calendario de tu teléfono o tu computadora. También podés suscribirte sólo al calendario de tu equipo, de todo el grupo o de ${grouping}.`;
  }
  if (lang === "pt") {
    const grouping = isWC ? "todos os times de uma confederação" : "todos os times do seu país";
    return `Inscreva-se no calendário ${whole} e você terá todas as partidas incluídas no calendário do seu telefone ou computador. Você também pode se inscrever apenas no calendário do seu time, de todo o grupo ou de ${grouping}.`;
  }
  const grouping = isWC ? "a confederation" : "your country";
  return `Subscribe to the ${whole} calendar and you'll have all the matches included in your phone or computer calendar. You can also subscribe to just your team's calendar, your whole group's, or all the teams from ${grouping}.`;
}

// Slug del torneo (camelCase del nombre localizado). Se usa igual en las rutas
// web y en las carpetas/archivos .ics, para que todo quede uniforme.
const tournamentSlugs: Record<string, Record<Lang, string>> = {
  libertadores: { es: "copaLibertadores", en: "libertadoresCup", pt: "copaLibertadores" },
  sudamericana: { es: "copaSudamericana", en: "sudamericanaCup", pt: "copaSulAmericana" },
  mundial: { es: "copaDelMundo", en: "worldCup", pt: "copaDoMundo" },
};

export function localizedTournamentSlug(href: string, lang: Lang): string {
  return tournamentSlugs[href]?.[lang] ?? href;
}

// slug (en cualquier idioma) -> href canónico
const slugToTournament: Record<string, string> = Object.fromEntries(
  Object.entries(tournamentSlugs).flatMap(([href, byLang]) =>
    Object.values(byLang).map((slug) => [slug, href])
  )
);

export function tournamentFromSlug(slug: string): string {
  return slugToTournament[slug] ?? slug;
}

// Traduce el primer segmento (torneo) de un path tipo "libertadores/2026".
export function localizeUrlPath(path: string, lang: Lang): string {
  if (!path) return path;
  const parts = path.split("/");
  parts[0] = localizedTournamentSlug(parts[0], lang);
  return parts.join("/");
}

export function localizeGroupName(esName: string, lang: Lang): string {
  if (lang === "en") return esName.replace("Grupo", "Group");
  return esName; // es y pt usan "Grupo"
}

export function sectionName(esName: string, lang: Lang): string {
  const d = t(lang);
  if (esName.includes("confederación")) return d.sectionByConfederation;
  return d.sectionByCountry;
}

// Slug de ruta y de archivo .ics para selecciones / gentilicios; el resto queda igual.
export function localizedSlug(
  type: string,
  path: string,
  tournament: string,
  lang: Lang
): string {
  if (tournament === "mundial" && type === "team" && selecciones[path]) {
    return selecciones[path][lang].slug;
  }
  if (type === "country" && gentilicios[path]) {
    return gentilicios[path][lang].slug;
  }
  // "Completa" -> "completa" (no es nombre propio)
  if (type === "tournament") return path.toLowerCase();
  return path;
}

// Nombre visible de una entidad (equipo, selección, gentilicio, confederación,
// grupo, copa).
export function localizedEntityName(
  type: string,
  path: string,
  esName: string,
  tournament: string,
  lang: Lang
): string {
  if (tournament === "mundial" && type === "team" && selecciones[path]) {
    return selecciones[path][lang].name;
  }
  if (type === "confederation" && confederaciones[path]) {
    return confederaciones[path][lang];
  }
  if (type === "country" && gentilicios[path]) {
    const g = gentilicios[path][lang].name;
    return { es: `Equipos ${g}`, en: `${g} Teams`, pt: `Times ${g}` }[lang];
  }
  if (type === "group") return localizeGroupName(esName, lang);
  if (type === "tournament") return tournamentTitle(tournament, lang);
  return esName; // clubes: nombre propio sin traducir
}

// ---------------------------------------------------------------------------
// Frases (sujeto de "Calendario de ...")
// ---------------------------------------------------------------------------
function lower(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

interface SubjectCtx {
  type: string;
  path: string;
  esName: string;
  tournament: string;
  year?: string;
  archived?: boolean;
  lang: Lang;
}

export function subject(ctx: SubjectCtx): string {
  const { type, path, tournament, lang, year, archived } = ctx;
  const isWC = tournament === "mundial";
  const T = tournamentTitle(tournament, lang);
  const yr = year ? ` ${year}` : "";

  if (type === "team") {
    const teamName = localizedEntityName(type, path, ctx.esName, tournament, lang);
    if (archived)
      return {
        es: `${teamName} en la ${T}${yr}`,
        en: `${teamName} in the ${T}${yr}`,
        pt: `${teamName} na ${T}${yr}`,
      }[lang];
    return teamName;
  }
  if (type === "confederation") {
    return confederaciones[path] ? confederaciones[path][lang] : ctx.esName;
  }
  if (type === "country") {
    const g = gentilicios[path]?.[lang].name ?? ctx.esName;
    if (archived)
      return {
        es: `los equipos ${lower(g)} en la ${T}${yr}`,
        en: `the ${g} teams in the ${T}${yr}`,
        pt: `os times ${lower(g)} na ${T}${yr}`,
      }[lang];
    return {
      es: `todos los equipos ${lower(g)}`,
      en: `all the ${g} teams`,
      pt: `todos os times ${lower(g)}`,
    }[lang];
  }
  if (type === "tournament") {
    if (isWC)
      return {
        es: `todas las selecciones de la ${T}${yr}`,
        en: `all the ${T} teams${yr}`,
        pt: `todas as seleções da ${T}${yr}`,
      }[lang];
    return { es: `la ${T}${yr}`, en: `the ${T}${yr}`, pt: `a ${T}${yr}` }[lang];
  }
  // group
  const G = localizeGroupName(ctx.esName, lang);
  if (isWC)
    return {
      es: `todas las selecciones del ${G} de la ${T}${yr}`,
      en: `all the teams in ${G} of the ${T}${yr}`,
      pt: `todas as seleções do ${G} da ${T}${yr}`,
    }[lang];
  return {
    es: `todos los equipos del ${G} de la ${T}${yr}`,
    en: `all the teams in ${G} of the ${T}${yr}`,
    pt: `todos os times do ${G} da ${T}${yr}`,
  }[lang];
}

// Caption bajo la imagen del torneo (difiere del sujeto para clubes).
export function tournamentCaptionSubject(
  tournament: string,
  lang: Lang,
  year?: string
): string {
  const isWC = tournament === "mundial";
  const T = tournamentTitle(tournament, lang);
  const yr = year ? ` ${year}` : "";
  if (isWC)
    return {
      es: `todas las selecciones de la ${T}${yr}`,
      en: `all the ${T} teams${yr}`,
      pt: `todas as seleções da ${T}${yr}`,
    }[lang];
  return {
    es: `todos los equipos de la ${T}${yr}`,
    en: `all the ${T} teams${yr}`,
    pt: `todos os times da ${T}${yr}`,
  }[lang];
}

// ---------------------------------------------------------------------------
// Rutas de archivo .ics de suscripción (con prefijo de idioma)
// ---------------------------------------------------------------------------
export function localizedCalendarFilePath(
  type: string,
  path: string,
  tournament: string,
  imageName: string | null | undefined,
  lang: Lang,
  year?: string
): string {
  let p = getCalendarFilePath(type, path, tournament, imageName, year);
  if (tournament === "mundial" && type === "team" && selecciones[path]) {
    p = `seleccion/${selecciones[path][lang].slug}.ics`;
  } else if (type === "country" && gentilicios[path]) {
    p = `${gentilicios[path][lang].slug}.ics`;
  } else {
    // Localiza el primer segmento si es una carpeta de torneo
    // (libertadores/sudamericana/mundial), para que coincida con la ruta.
    const parts = p.split("/");
    if (tournamentSlugs[parts[0]]) {
      parts[0] = tournamentSlugs[parts[0]][lang];
      p = parts.join("/");
    }
  }
  return `${lang}/${p}`;
}

export function localizedTournamentFile(
  tournament: string,
  lang: Lang
): string {
  return `${lang}/${localizedTournamentSlug(tournament, lang)}.ics`;
}

// Texto de las tarjetas "Todos los equipos del {grupo/país}".
export function allTeamsCardTitle(displayName: string, lang: Lang): string {
  return {
    es: `Todos los equipos del ${displayName}`,
    en: `All teams in ${displayName}`,
    pt: `Todos os times do ${displayName}`,
  }[lang];
}

// Subtítulo "de la Copa ..." de las tarjetas.
export function tournamentSubtitle(tournament: string, lang: Lang): string {
  const T = tournamentTitle(tournament, lang);
  return { es: `de la ${T}`, en: `of the ${T}`, pt: `da ${T}` }[lang];
}

// Caption bajo una entidad país/gentilicio.
export function countryCaption(
  path: string,
  esName: string,
  lang: Lang
): string {
  return t(lang).calendarOf(
    subject({ type: "country", path, esName, tournament: "", lang })
  );
}
