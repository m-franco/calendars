// Generadores de rutas compartidos entre las páginas raíz (ES) y el subárbol
// [lang] (EN/PT). Cada función recibe el idioma y devuelve entradas
// { params, props } SIN el segmento de idioma (cada página decide si lo agrega).
//
// El parámetro `path`/`country` de la URL ya viene localizado (slug traducido
// para selecciones y gentilicios); `props.esPath` conserva el slug español para
// buscar datos.
import { calendarPages, calendars, tournaments, tournamentPages, countries } from "../data.json";
import { calendarPages as cp2024, calendars as cal2024, tournaments as t2024, tournamentPages as tp2024 } from "../data-2024.json";
import { calendarPages as cp2025, calendars as cal2025, tournaments as t2025, tournamentPages as tp2025 } from "../data-2025.json";
import { calendarPages as wcCalendarPages, tournaments as wcTournaments, tournamentPages as wcTournamentPages } from "../worldcup-data.json";
import { getTeamImageFolder } from "../utils/teamImages";
import { localizedSlug, localizedTournamentSlug, type Lang } from "./ui";

type AnyPage = any;

export function detailPaths(lang: Lang) {
  const all: AnyPage[] = [
    ...wcCalendarPages,
    ...cp2024,
    ...cp2025,
    ...calendarPages,
  ].filter(({ type }) => type === "team" || type === "country");

  const unique = Array.from(new Map(all.map((p) => [p.path, p])).values());

  return unique.map(({ type, name, path, tournament, imageName }) => ({
    params: { path: localizedSlug(type, path, tournament, lang) },
    props: { type, esName: name, esPath: path, tournament, imageName, lang },
  }));
}

export function tournamentDetailPaths(lang: Lang) {
  const all: AnyPage[] = [
    ...wcCalendarPages.filter(({ type }: AnyPage) => type !== "group"),
    ...cp2024,
    ...cp2025,
    ...calendarPages,
  ];
  const unique = Array.from(
    new Map(all.map((p) => [`${p.tournament}/${p.path}`, p])).values()
  );

  return unique.map(({ type, name, path, tournament, imageName }) => {
    const seg =
      tournament === "mundial"
        ? type === "team"
          ? "seleccion"
          : type === "confederation"
            ? "selecciones"
            : tournament
        : tournament;
    return {
      params: {
        path: localizedSlug(type, path, tournament, lang),
        tournament: localizedTournamentSlug(seg, lang),
      },
      props: {
        type,
        esName: name,
        esPath: path,
        imageName,
        sourceTournament: tournament,
        urlTournamentBase: seg,
        lang,
      },
    };
  });
}

export function countryTeamPaths(lang: Lang) {
  const all: AnyPage[] = [...cp2024, ...cp2025, ...calendarPages].filter(
    ({ type, imageName }) => type === "team" && getTeamImageFolder(imageName)
  );
  const unique = Array.from(
    new Map(all.map((p) => [`${getTeamImageFolder(p.imageName)}/${p.path}`, p])).values()
  );

  return unique.map(({ type, name, path, tournament, imageName }) => ({
    // Los clubes no se traducen en la ruta.
    params: { country: getTeamImageFolder(imageName), path },
    props: { type, esName: name, esPath: path, tournament, imageName, lang },
  }));
}

export function tournamentIndexPaths(lang: Lang) {
  const all: AnyPage[] = [...wcTournamentPages, ...tournamentPages];
  return all.map(({ tournament }) => ({
    params: { tournament: localizedTournamentSlug(tournament, lang) },
    props: { href: tournament, lang },
  }));
}

export function yearIndexPaths(lang: Lang) {
  const editions = [
    { year: "2024", pages: tp2024 },
    { year: "2025", pages: tp2025 },
  ];
  return editions.flatMap(({ year, pages }) =>
    (pages as AnyPage[]).map(({ tournament }) => ({
      params: { tournament: localizedTournamentSlug(tournament, lang), year },
      props: { href: tournament, year, lang },
    }))
  );
}

export function yearDetailPaths(lang: Lang) {
  const editions = [
    { year: "2024", pages: cp2024 as AnyPage[] },
    { year: "2025", pages: cp2025 as AnyPage[] },
    {
      year: "2026",
      pages: [
        ...wcCalendarPages.filter(({ type }: AnyPage) => type === "group"),
        ...calendarPages.filter(({ type }: AnyPage) => type === "group"),
      ],
    },
  ];

  return editions.flatMap(({ year, pages }) =>
    pages
      .filter(({ type }) => type !== "country")
      .map(({ type, name, path, tournament, imageName }) => ({
        params: {
          path: localizedSlug(type, path, tournament, lang),
          tournament: localizedTournamentSlug(tournament, lang),
          year,
        },
        props: { type, esName: name, esPath: path, tournament, imageName, year, lang },
      }))
  );
}

// Datos auxiliares para los cuerpos
export const data = {
  calendarPages, calendars, tournaments, tournamentPages, countries,
  cp2024, cal2024, t2024, tp2024,
  cp2025, cal2025, t2025, tp2025,
  wcCalendarPages, wcTournaments, wcTournamentPages,
};
