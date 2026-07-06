// @ts-nocheck - utilitario de build (usa APIs de Node; sin @types/node instalado)
import fs from "node:fs";
import path from "node:path";

export interface Match {
  iso: string; // instante UTC real (ISO), para convertir a la hora local del visitante
  summary: string; // ya localizado ("Spain vs. Cape Verde")
  stage: string; // etiqueta de fase/fecha ya localizada
  venue: string;
}

// Lee un .ics (ruta relativa a public/, con prefijo de idioma, ej.
// "en/seleccion/Spain.ics") y devuelve sus partidos ordenados por fecha.
// El archivo ya viene traducido, así que no hace falta localizar nada acá.
export function readFixtures(langCalendarFile: string): Match[] {
  const file = path.join(process.cwd(), "public", langCalendarFile);
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }

  const matches: Match[] = [];
  for (const block of text.split("BEGIN:VEVENT").slice(1)) {
    const grab = (re: RegExp) => (block.match(re)?.[1] ?? "").trim();
    const dt = grab(/DTSTART[^:]*:([0-9T]+)/);
    const summary = grab(/\r?\nSUMMARY:(.*)/);
    if (!dt || !summary) continue;

    let desc = grab(/\r?\nDESCRIPTION:(.*)/);
    desc = desc.split("\\n\\n")[0]; // quita el mensaje de apoyo
    const parts = desc.split(" - ");
    parts.pop(); // quita el nombre de la competición (último segmento)
    const stage = parts.join(" · ");

    const venue = grab(/\r?\nLOCATION:(.*)/);

    const y = +dt.slice(0, 4);
    const mo = +dt.slice(4, 6) - 1;
    const d = +dt.slice(6, 8);
    const h = +dt.slice(9, 11);
    const mi = +dt.slice(11, 13);
    // Los .ics están en hora de Montevideo (UTC−3, sin horario de verano).
    // Sumamos 3h para obtener el instante UTC real.
    const iso = new Date(Date.UTC(y, mo, d, h + 3, mi)).toISOString();

    matches.push({ iso, summary, stage, venue });
  }

  matches.sort((a, b) => a.iso.localeCompare(b.iso));
  return matches;
}
