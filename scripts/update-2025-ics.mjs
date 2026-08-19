import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
// Estructura reorganizada: el español canónico vive en public/es y los torneos
// usan slug camelCase (ver translate-ics.mjs). Los legacy siguen en la raíz.
const esDir = path.join(publicDir, "es");
const tournamentEsFolder = { libertadores: "copaLibertadores", sudamericana: "copaSudamericana" };
const editionYear = process.argv[2] ?? "2025";
const dataFileName = editionYear === "2025" ? "data-2025.json" : "data.json";
const data = JSON.parse(await readFile(path.join(root, `src/${dataFileName}`), "utf8"));
const teamImagesSource = await readFile(path.join(root, "src/utils/teamImages.ts"), "utf8");
const fixtureUrls = {
    libertadores: `https://site.api.espn.com/apis/site/v2/sports/soccer/conmebol.libertadores/scoreboard?dates=${editionYear}&limit=500`,
    sudamericana: `https://site.api.espn.com/apis/site/v2/sports/soccer/conmebol.sudamericana/scoreboard?dates=${editionYear}&limit=500`,
};
const [libertadoresRaw, sudamericanaRaw] = await Promise.all(
    Object.values(fixtureUrls).map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not download fixture: ${response.status}`);
        return response.json();
    })
);

const tournamentNames = {
    libertadores: "Copa Libertadores",
    sudamericana: "Copa Sudamericana",
};
const countryFlags = {
    argentina: "🇦🇷",
    bolivia: "🇧🇴",
    brasil: "🇧🇷",
    chile: "🇨🇱",
    colombia: "🇨🇴",
    ecuador: "🇪🇨",
    paraguay: "🇵🇾",
    peru: "🇵🇪",
    uruguay: "🇺🇾",
    venezuela: "🇻🇪",
};
const countryCalendarNames = {
    argentina: "Argentinos",
    bolivia: "Bolivianos",
    brasil: "Brasileros",
    chile: "Chilenos",
    colombia: "Colombianos",
    ecuador: "Ecuatorianos",
    paraguay: "Paraguayos",
    peru: "Peruanos",
    uruguay: "Uruguayos",
    venezuela: "Venezolanos",
};
const canonicalFileNames = {
    AlianzaColombia: "Alianza",
    NacionalParaguay: "Nacional",
    RacingUruguay: "Racing",
};
const espnAliases = {
    "Estudiantes de La Plata": "Estudiantes",
    "Racing Club": "Racing",
    "Barcelona SC": "Barcelona",
    "Club Olimpia": "Olimpia",
    "Talleres (Córdoba)": "Talleres",
    "São Paulo": "SanPablo",
    "River Plate": "River",
    "Central Córdoba (Santiago del Estero)": "CentralCordoba",
    "Caracas FC": "Caracas",
    "Unión (Santa Fe)": "Union",
    "Cienciano del Cusco": "Cienciano",
    "Atlético-MG": "AtleticoMineiro",
    "Racing (Montevideo)": "RacingUruguay",
    "Universidad Católica (Quito)": "UniversidadCatolica",
    "Godoy Cruz Antonio Tomba": "GodoyCruz",
    "Atlético Junior": "Junior",
    "Independiente Medellín": "IndependienteDeMedellin",
    "Cusco FC": "Cusco",
    "UCV FC": "UniversidadCentral",
    "Independiente Santa Fe": "SantaFe",
    "Deportivo Recoleta": "Recoleta",
};
const legacyTeamAliases = {
    RacingArgentina: "Racing",
    RacingUruguay: "RacingUruguay",
    AlianzaColombia: "AlianzaColombia",
    NacionalParaguay: "NacionalParaguay",
};

function normalize(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

const imageFolders = new Map(
    [...teamImagesSource.matchAll(/^\s+(CSF_[A-Z]+): "([^"]+)",$/gm)]
        .map(([, imageCode, folder]) => [imageCode, folder])
);
const teamPages = [...new Map(
    data.calendarPages
        .filter(({ type }) => type === "team")
        .map((team) => [team.path, team])
).values()];
const teamsByPath = new Map(teamPages.map((team) => [team.path, {
    ...team,
    country: imageFolders.get(team.imageName.replace(/\.[^.]+$/, "")),
}]));
const teamsByNormalizedName = new Map(
    teamPages.flatMap((team) => [
        [normalize(team.name), teamsByPath.get(team.path)],
        [normalize(team.path), teamsByPath.get(team.path)],
    ])
);

function projectTeam(espnName) {
    const aliasedPath = espnAliases[espnName];
    const team = aliasedPath
        ? teamsByPath.get(aliasedPath)
        : teamsByNormalizedName.get(normalize(espnName));

    if (!team) throw new Error(`No project team mapping for ${espnName}`);
    return team;
}

function localDateParts(isoDate) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Montevideo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date(isoDate));
    return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function dateValue(isoDate) {
    const { year, month, day, hour, minute } = localDateParts(isoDate);
    const normalizedMinute = Number(minute) < 30 ? "00" : "30";
    return `${year}${month}${day}T${hour}${normalizedMinute}00`;
}

function addTwoHours(localValue) {
    const year = Number(localValue.slice(0, 4));
    const month = Number(localValue.slice(4, 6)) - 1;
    const day = Number(localValue.slice(6, 8));
    const hour = Number(localValue.slice(9, 11));
    const minute = Number(localValue.slice(11, 13));
    const date = new Date(Date.UTC(year, month, day, hour + 2, minute));
    return date.toISOString().replace(/[-:]/g, "").slice(0, 15);
}

function groupDefinitions(tournament) {
    return data.tournaments
        .find(({ href }) => href === tournament)
        .groups.map((group) => ({
            ...group,
            teamPaths: new Set(group.teams.map(({ path }) => path)),
        }));
}

const groups = {
    libertadores: groupDefinitions("libertadores"),
    sudamericana: groupDefinitions("sudamericana"),
};

function eventGroup(tournament, home, away) {
    return groups[tournament].find(
        ({ teamPaths }) => teamPaths.has(home.path) && teamPaths.has(away.path)
    );
}

function selectedEvents(raw, tournament) {
    const excludedStages = tournament === "libertadores"
        ? new Set(["first-stage", "second-stage", "third-stage"])
        : new Set(["first-stage"]);

    return raw.events
        .filter(({ season }) => !excludedStages.has(season.slug))
        .map((event) => {
            const competition = event.competitions[0];
            const homeCompetitor = competition.competitors.find(({ homeAway }) => homeAway === "home");
            const awayCompetitor = competition.competitors.find(({ homeAway }) => homeAway === "away");
            const home = projectTeam(homeCompetitor.team.displayName);
            const away = projectTeam(awayCompetitor.team.displayName);

            return {
                tournament,
                stage: event.season.slug,
                date: event.date,
                start: dateValue(event.date),
                home,
                away,
                venue: (competition.venue?.fullName ?? "Estadio a definir")
                    .replace("Mâs Monumental", "Más Monumental"),
                group: event.season.slug === "group-stage"
                    ? eventGroup(tournament, home, away)
                    : null,
            };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
}

const events = [
    ...selectedEvents(libertadoresRaw, "libertadores"),
    ...selectedEvents(sudamericanaRaw, "sudamericana"),
].sort((a, b) => a.date.localeCompare(b.date));

for (const tournament of Object.keys(groups)) {
    for (const group of groups[tournament]) {
        const groupEvents = events.filter(
            (event) => event.tournament === tournament && event.group?.path === group.path
        );
        groupEvents.forEach((event, index) => {
            event.matchday = Math.floor(index / 2) + 1;
        });
    }
}

for (const tournament of Object.keys(tournamentNames)) {
    const knockoutEvents = events.filter(
        (event) => event.tournament === tournament && event.stage !== "group-stage"
    );
    const ties = new Map();
    for (const event of knockoutEvents) {
        const key = [event.home.path, event.away.path].sort().join("|");
        const stageKey = `${event.stage}|${key}`;
        const tie = ties.get(stageKey) ?? [];
        tie.push(event);
        ties.set(stageKey, tie);
    }
    for (const tie of ties.values()) {
        tie.sort((a, b) => a.date.localeCompare(b.date));
        if (tie.length === 2) {
            tie[0].leg = "Ida";
            tie[1].leg = "Vuelta";
        }
    }
}

function description(event) {
    if (event.stage === "group-stage") {
        return `${event.group.name} - Fecha ${event.matchday} - ${tournamentNames[event.tournament]}`;
    }

    const stageNames = {
        "knockout-round-playoffs": "Play-offs",
        "round-of-16": "Octavos de final",
        quarterfinals: "Cuartos de final",
        semifinals: "Semifinal",
        final: "Final",
    };
    return [stageNames[event.stage], event.leg, tournamentNames[event.tournament]]
        .filter(Boolean)
        .join(" - ");
}

function renderEvent(event) {
    const homeFlag = countryFlags[event.home.country];
    const awayFlag = countryFlags[event.away.country];
    return [
        "BEGIN:VEVENT",
        `UID:${event.start}Z_${event.home.path}_${event.away.path}`,
        `DTSTART;TZID=America/Montevideo:${event.start}`,
        `DTEND;TZID=America/Montevideo:${addTwoHours(event.start)}`,
        `SUMMARY:${event.home.name}${homeFlag} vs. ${event.away.name}${awayFlag}`,
        `DESCRIPTION:${description(event)}`,
        "CLASS:PUBLIC",
        `LOCATION:${event.venue}`,
        "END:VEVENT",
    ].join("\n");
}

function parseExistingEvents(contents) {
    return [...contents.matchAll(/BEGIN:VEVENT\n[\s\S]*?\nEND:VEVENT/g)].map(([event]) => event);
}

function eventStart(event) {
    return event.match(/^DTSTART[^:]*:(\d{8}T\d{6})$/m)?.[1] ?? "";
}

function eventUid(event) {
    return event.match(/^UID:(.+)$/m)?.[1] ?? event;
}

function renderCalendar(existingContents, newEvents) {
    const uniqueEvents = new Map();
    for (const event of [
        ...parseExistingEvents(existingContents).filter(
            (event) => !eventStart(event).startsWith(editionYear)
        ),
        ...newEvents.map(renderEvent),
    ]) {
        uniqueEvents.set(eventUid(event), event);
    }
    const sortedEvents = [...uniqueEvents.values()].sort(
        (a, b) => eventStart(a).localeCompare(eventStart(b))
    );
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Calendarios CONMEBOL//ES",
        sortedEvents.join("\n\n"),
        "END:VCALENDAR",
        "",
    ].join("\n");
}

async function writeAccumulated(baseDir, relativePath, newEvents) {
    const filePath = path.join(baseDir, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    let existing = "";
    try {
        existing = await readFile(filePath, "utf8");
    } catch {}
    await writeFile(filePath, renderCalendar(existing, newEvents));
}

async function copyCalendar(baseDir, sourceRelativePath, destinationRelativePath) {
    const source = await readFile(path.join(baseDir, sourceRelativePath), "utf8");
    const destination = path.join(baseDir, destinationRelativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, source);
}

for (const tournament of Object.keys(tournamentNames)) {
    await writeAccumulated(
        esDir,
        `${tournamentEsFolder[tournament]}.ics`,
        events.filter((event) => event.tournament === tournament)
    );
}

for (const team of teamsByPath.values()) {
    const teamEvents = events.filter(
        (event) => event.home.path === team.path || event.away.path === team.path
    );
    const fileName = canonicalFileNames[team.path] ?? team.path;
    await writeAccumulated(esDir, `${team.country}/${fileName}.ics`, teamEvents);
}

for (const [country, calendarName] of Object.entries(countryCalendarNames)) {
    await writeAccumulated(
        esDir,
        `${calendarName.toLowerCase()}.ics`, // gentilicios en minúscula
        events.filter(
            (event) => event.home.country === country || event.away.country === country
        )
    );
}

for (const tournament of Object.keys(groups)) {
    for (const group of groups[tournament]) {
        if (editionYear === "2025") {
            await copyCalendar(
                esDir,
                `${tournamentEsFolder[tournament]}/${group.path}.ics`,
                `${tournamentEsFolder[tournament]}/2024/${group.path}.ics`
            );
        }
        await writeAccumulated(
            esDir,
            `${tournamentEsFolder[tournament]}/${editionYear}/${group.path}.ics`,
            events.filter(
                (event) => group.teamPaths.has(event.home.path) || group.teamPaths.has(event.away.path)
            )
        );
    }
}

async function allIcsFiles(directory) {
    const entries = await readdir(directory);
    const files = [];
    for (const entry of entries) {
        const filePath = path.join(directory, entry);
        const fileStat = await stat(filePath);
        if (fileStat.isDirectory()) files.push(...await allIcsFiles(filePath));
        else if (entry.endsWith(".ics")) files.push(filePath);
    }
    return files;
}

for (const filePath of await allIcsFiles(publicDir)) {
    const relativePath = path.relative(publicDir, filePath);
    const [directory, fileName] = relativePath.split(path.sep);
    if (!["libertadores", "sudamericana"].includes(directory)) continue;
    if (relativePath.split(path.sep).length !== 2) continue;

    const stem = fileName.replace(/\.ics$/, "");
    if (/^Grupo[A-H]$/.test(stem)) continue;

    if (Object.values(countryCalendarNames).includes(stem)) {
        const country = Object.entries(countryCalendarNames).find(([, name]) => name === stem)[0];
        await writeAccumulated(
            publicDir,
            relativePath,
            events.filter(
                (event) => event.home.country === country || event.away.country === country
            )
        );
        continue;
    }

    const teamPath = legacyTeamAliases[stem] ?? stem;
    if (!teamsByPath.has(teamPath)) continue;
    await writeAccumulated(
        publicDir,
        relativePath,
        events.filter(
            (event) => event.home.path === teamPath || event.away.path === teamPath
        )
    );
}

await copyCalendar(esDir, "uruguay/Nacional.ics", "Nacional.ics");

console.log(
    `Processed ${events.length} matches for ${editionYear}: ${
        events.filter((event) => event.tournament === "libertadores").length
    } Libertadores and ${
        events.filter((event) => event.tournament === "sudamericana").length
    } Sudamericana.`
);
