// Reorganiza los .ics de español dentro de public/es y genera las versiones
// traducidas en public/en y public/pt.
//
// - Mueve a public/es: carpetas por país, mundial, seleccion, selecciones y los
//   .ics sueltos de la raíz.
// - Copia (sin mover) las carpetas legacy public/libertadores y public/sudamericana
//   dentro de public/es, dejando las originales en la raíz para no romper las
//   suscripciones existentes.
// - Genera public/en y public/pt como copia traducida del árbol public/es.
//
// Idempotente: si public/es ya existe, no vuelve a reorganizar; siempre
// regenera en/ y pt/ desde cero.
//
// Uso: node scripts/translate-ics.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "..", "public");
const ES = path.join(PUBLIC, "es");

// --- Diccionario (se carga desde el .ts vía un require simple parseando) -----
// Datos desde la única fuente de verdad compartida con la web.
import { selecciones, gentilicios } from "../src/i18n/countries.mjs";

const LANGS = ["en", "pt"];

const MOVE_DIRS = [
  "argentina", "bolivia", "brasil", "chile", "colombia", "ecuador",
  "mundial", "paraguay", "peru", "seleccion", "selecciones",
  "uruguay", "venezuela",
];
const LEGACY_DIRS = ["libertadores", "sudamericana"];

// ---------------------------------------------------------------------------
// Mapas derivados
// ---------------------------------------------------------------------------
// es-slug -> { en: slug, pt: slug }
const seleccionSlug = {};
// es-display-name -> { es, en, pt }
const seleccionName = {};
for (const [esSlug, loc] of Object.entries(selecciones)) {
  seleccionSlug[esSlug] = { es: loc.es.slug, en: loc.en.slug, pt: loc.pt.slug };
  seleccionName[loc.es.name] = { es: loc.es.name, en: loc.en.name, pt: loc.pt.name };
}
// Indexado por el slug en español (el nombre real del archivo en public/es).
const gentilicioSlug = {};
for (const loc of Object.values(gentilicios)) {
  gentilicioSlug[loc.es.slug] = { es: loc.es.slug, en: loc.en.slug, pt: loc.pt.slug };
}

// Mensaje de apoyo que se agrega a la DESCRIPTION de cada evento. Apunta a la
// pantalla de apoyo dentro del sitio (no directo a PayPal).
const SITE = "https://myfixtu.re";
const supportMessage = {
  es: `¿Te gusta este calendario? Puedes apoyar este proyecto en: ${SITE}/es/apoyar`,
  en: `Enjoying this calendar? Support the project: ${SITE}/en/support`,
  pt: `Gostou deste calendário? Apoie o projeto: ${SITE}/pt/apoiar`,
};

// Detecta un bloque de apoyo agregado previamente (cualquier dominio/idioma).
const SUPPORT_RE = /apoyar|support|apoiar|github\.io\/calendars|myfixtu\.re/;

// Quita el bloque de apoyo agregado previamente (idempotencia). El valor de
// DESCRIPTION usa "\n" literales; el apoyo va tras el último "\n\n".
function stripSupport(descValue) {
  const j = descValue.lastIndexOf("\\n\\n");
  if (j === -1) return descValue;
  return SUPPORT_RE.test(descValue.slice(j)) ? descValue.slice(0, j) : descValue;
}

// Carpeta/archivo de torneo por idioma (camelCase del nombre localizado).
// Mantener sincronizado con tournamentSlugs en src/i18n/ui.ts.
const tournamentLangFolder = {
  libertadores: { es: "copaLibertadores", en: "libertadoresCup", pt: "copaLibertadores" },
  sudamericana: { es: "copaSudamericana", en: "sudamericanaCup", pt: "copaSulAmericana" },
  mundial: { es: "copaDelMundo", en: "worldCup", pt: "copaDoMundo" },
};
// nombre de carpeta es -> torneo canónico
const esFolderToTournament = {};
const esRootFileToTournament = {};
for (const [canon, byLang] of Object.entries(tournamentLangFolder)) {
  esFolderToTournament[byLang.es] = canon;
  esRootFileToTournament[`${byLang.es}.ics`] = canon;
}

// ---------------------------------------------------------------------------
// Reorganización a public/es
// ---------------------------------------------------------------------------
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function reorganize() {
  if (fs.existsSync(ES)) {
    console.log("public/es ya existe; salto la reorganización.");
    return;
  }
  fs.mkdirSync(ES, { recursive: true });

  for (const dir of MOVE_DIRS) {
    const src = path.join(PUBLIC, dir);
    if (fs.existsSync(src)) fs.renameSync(src, path.join(ES, dir));
  }
  // .ics sueltos de la raíz
  for (const entry of fs.readdirSync(PUBLIC, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".ics")) {
      fs.renameSync(path.join(PUBLIC, entry.name), path.join(ES, entry.name));
    }
  }
  // legacy: copiar (dejar original en la raíz)
  for (const dir of LEGACY_DIRS) {
    const src = path.join(PUBLIC, dir);
    if (fs.existsSync(src)) copyDir(src, path.join(ES, dir));
  }
  console.log("Reorganización a public/es completada.");
}

// Renombra las carpetas/archivos de torneo dentro de public/es a su slug
// camelCase en español (idempotente).
function renameEsTournaments() {
  for (const [canon, byLang] of Object.entries(tournamentLangFolder)) {
    const oldDir = path.join(ES, canon);
    const newDir = path.join(ES, byLang.es);
    if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) fs.renameSync(oldDir, newDir);

    // Archivo suelto del torneo: Libertadores.ics -> copaLibertadores.ics, etc.
    const cap = canon.charAt(0).toUpperCase() + canon.slice(1);
    const oldFile = path.join(ES, `${cap}.ics`);
    const newFile = path.join(ES, `${byLang.es}.ics`);
    if (fs.existsSync(oldFile) && !fs.existsSync(newFile)) fs.renameSync(oldFile, newFile);
  }
}

// Renombra los .ics de gentilicios en public/es a su slug en minúscula
// (ej. Uruguayos.ics -> uruguayos.ics). Usa un paso intermedio para forzar el
// cambio de mayúsculas/minúsculas en sistemas de archivos case-insensitive (macOS).
function renameEsGentilicios() {
  const entries = fs.readdirSync(ES);
  const byLower = new Map(entries.map((e) => [e.toLowerCase(), e]));
  for (const loc of Object.values(gentilicios)) {
    const target = `${loc.es.slug}.ics`;
    const actual = byLower.get(target.toLowerCase());
    if (actual && actual !== target) {
      const tmp = path.join(ES, `${target}.__tmp__`);
      fs.renameSync(path.join(ES, actual), tmp);
      fs.renameSync(tmp, path.join(ES, target));
    }
  }
}

// ---------------------------------------------------------------------------
// Traducción de contenido
// ---------------------------------------------------------------------------
const descTokenRules = {
  en: [
    [/Copa del Mundo/g, "World Cup"],
    [/Copa Libertadores/g, "Libertadores Cup"],
    [/Copa Sudamericana/g, "Sudamericana Cup"],
    [/Dieciseisavos de final/g, "Round of 32"],
    [/Octavos de final/g, "Round of 16"],
    [/Cuartos de final/g, "Quarter-finals"],
    [/Tercer puesto/g, "Third place"],
    [/Semifinal/g, "Semi-finals"],
    [/Grupo ([A-L])\b/g, "Group $1"],
    [/Fecha (\d+)/g, "Matchday $1"],
    [/\bVuelta\b/g, "Second leg"],
    [/\bIda\b/g, "First leg"],
  ],
  pt: [
    [/Copa del Mundo/g, "Copa do Mundo"],
    [/Copa Sudamericana/g, "Copa Sul-Americana"],
    [/Dieciseisavos de final/g, "16-avos de final"],
    [/Octavos de final/g, "Oitavas de final"],
    [/Cuartos de final/g, "Quartas de final"],
    [/Tercer puesto/g, "Terceiro lugar"],
    [/Fecha (\d+)/g, "Rodada $1"],
    [/\bVuelta\b/g, "Volta"],
    // Grupo, Semifinal, Final, Ida quedan igual en portugués
  ],
};

function translateDescription(value, lang) {
  let out = value;
  for (const [re, rep] of descTokenRules[lang]) out = out.replace(re, rep);
  return out;
}

function translateSummary(value, lang) {
  // "A vs. B" -> nombres de selección traducidos
  return value.split(" vs. ").map((side) => {
    const t = seleccionName[side.trim()];
    return t ? t[lang] : side;
  }).join(" vs. ");
}

function translateLocation(value, lang) {
  // Sólo traducimos la palabra "Estadio".
  if (lang === "pt") return value.replace(/^Estadio\b/, "Estádio");
  // en: "Estadio X" -> "X Stadium", insertando "Stadium" justo después del
  // nombre (antes de un apodo "(...)" o de un sufijo ", Ciudad").
  const m = value.match(/^Estadio\s+(.+)$/);
  if (!m) return value;
  const parts = m[1].match(/^(.*?)\s*([(,].*)$/);
  if (!parts) return `${m[1]} Stadium`;
  const sep = parts[2].startsWith("(") ? " " : "";
  return `${parts[1]} Stadium${sep}${parts[2]}`;
}

function translateUid(value, lang) {
  return value.split("_").map((tok) => {
    const t = seleccionSlug[tok];
    return t ? t[lang] : tok;
  }).join("_");
}

function isWorldCupFile(rel) {
  const mundialFolder = tournamentLangFolder.mundial.es; // copaDelMundo
  return rel.startsWith(`${mundialFolder}/`) || rel.startsWith("seleccion/") ||
    rel.startsWith("selecciones/") || rel === `${mundialFolder}.ics`;
}

function translateContent(text, rel, lang) {
  const wc = isWorldCupFile(rel);
  return text.split("\n").map((line) => {
    if (line.startsWith("DESCRIPTION:")) {
      let v = stripSupport(line.slice("DESCRIPTION:".length));
      if (lang !== "es") v = translateDescription(v, lang);
      return "DESCRIPTION:" + v + "\\n\\n" + supportMessage[lang];
    }
    // En español sólo agregamos el apoyo; el resto del contenido queda igual.
    if (lang === "es") return line;
    if (line.startsWith("PRODID:")) {
      return line.replace(/\/\/ES\s*$/, `//${lang.toUpperCase()}`);
    }
    if (line.startsWith("LOCATION:")) {
      return "LOCATION:" + translateLocation(line.slice("LOCATION:".length), lang);
    }
    if (wc && line.startsWith("SUMMARY:")) {
      return "SUMMARY:" + translateSummary(line.slice("SUMMARY:".length), lang);
    }
    if (wc && line.startsWith("UID:")) {
      return "UID:" + translateUid(line.slice("UID:".length), lang);
    }
    return line;
  }).join("\n");
}

// rel (relativo a public/es) -> rel traducido (nombre de carpeta/archivo)
function translateRelPath(rel, lang) {
  const parts = rel.split("/");
  // Carpeta de torneo: copaLibertadores/... -> libertadoresCup/... (en)
  if (esFolderToTournament[parts[0]]) {
    parts[0] = tournamentLangFolder[esFolderToTournament[parts[0]]][lang];
    return parts.join("/");
  }
  // seleccion/<slug>.ics
  if (parts.length === 2 && parts[0] === "seleccion" && parts[1].endsWith(".ics")) {
    const slug = parts[1].slice(0, -4);
    const t = seleccionSlug[slug];
    return t ? `seleccion/${t[lang]}.ics` : rel;
  }
  // .ics suelto en la raíz
  if (parts.length === 1 && parts[0].endsWith(".ics")) {
    // Archivo de torneo: copaLibertadores.ics -> libertadoresCup.ics (en)
    if (esRootFileToTournament[parts[0]]) {
      return `${tournamentLangFolder[esRootFileToTournament[parts[0]]][lang]}.ics`;
    }
    // Gentilicios
    const base = parts[0].slice(0, -4);
    const t = gentilicioSlug[base];
    return t ? `${t[lang]}.ics` : rel;
  }
  return rel;
}

// ---------------------------------------------------------------------------
// Generación
// ---------------------------------------------------------------------------
function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.name.endsWith(".ics")) out.push(path.relative(base, full));
  }
  return out;
}

function generate() {
  // Leemos el contenido de public/es en memoria ANTES de escribir, porque
  // también reescribimos es (en el lugar) para agregarle el mensaje de apoyo.
  const sources = walk(ES).map((rel) => {
    const relPosix = rel.split(path.sep).join("/");
    return { relPosix, text: fs.readFileSync(path.join(ES, rel), "utf8") };
  });

  for (const lang of ["es", "en", "pt"]) {
    const langRoot = path.join(PUBLIC, lang);
    if (lang !== "es") fs.rmSync(langRoot, { recursive: true, force: true });
    let count = 0;
    for (const { relPosix, text } of sources) {
      const outText = translateContent(text, relPosix, lang);
      const outRel = translateRelPath(relPosix, lang);
      const dest = path.join(langRoot, outRel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, outText);
      count++;
    }
    console.log(`public/${lang}: ${count} archivos procesados.`);
  }
}

reorganize();
renameEsTournaments();
renameEsGentilicios();
generate();
