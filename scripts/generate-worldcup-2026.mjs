import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
const worldcupDataPath = path.join(root, "src/worldcup-data.json");

const scoreboardUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=2026&limit=500";
const standingsUrl = "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026";
const [scoreboard, standings] = await Promise.all([
    fetchJson(scoreboardUrl, "/tmp/espn-worldcup-2026.json"),
    fetchJson(standingsUrl, "/tmp/espn-worldcup-standings-2026.json"),
]);

const countryNames = {
    Mexico: "México",
    Czechia: "República Checa",
    "South Korea": "Corea del Sur",
    "South Africa": "Sudáfrica",
    Canada: "Canadá",
    "Bosnia-Herzegovina": "Bosnia y Herzegovina",
    Switzerland: "Suiza",
    Qatar: "Qatar",
    Brazil: "Brasil",
    Scotland: "Escocia",
    Haiti: "Haití",
    Morocco: "Marruecos",
    Paraguay: "Paraguay",
    Türkiye: "Turquía",
    Australia: "Australia",
    "United States": "Estados Unidos",
    Ecuador: "Ecuador",
    Germany: "Alemania",
    "Ivory Coast": "Costa de Marfil",
    "Curaçao": "Curazao",
    Netherlands: "Países Bajos",
    Sweden: "Suecia",
    Japan: "Japón",
    Tunisia: "Túnez",
    Belgium: "Bélgica",
    Iran: "Irán",
    Egypt: "Egipto",
    "New Zealand": "Nueva Zelanda",
    Spain: "España",
    Uruguay: "Uruguay",
    "Saudi Arabia": "Arabia Saudita",
    "Cape Verde": "Cabo Verde",
    Norway: "Noruega",
    France: "Francia",
    Senegal: "Senegal",
    Iraq: "Irak",
    Argentina: "Argentina",
    Austria: "Austria",
    Algeria: "Argelia",
    Jordan: "Jordania",
    Colombia: "Colombia",
    Portugal: "Portugal",
    Uzbekistan: "Uzbekistán",
    "Congo DR": "RD Congo",
    England: "Inglaterra",
    Croatia: "Croacia",
    Panama: "Panamá",
    Ghana: "Ghana",
};
const groupNames = Object.fromEntries(
    "ABCDEFGHIJKL".split("").map((letter) => [`Group ${letter}`, `Grupo ${letter}`])
);
const confederations = [
    {
        key: "conmebol",
        name: "Selecciones sudamericanas",
        path: "Conmebol",
        shortName: "CONMEBOL",
        imageName: "confederations/conmebol.svg",
        color: "#12a150",
    },
    {
        key: "concacaf",
        name: "Selecciones norteamericanas",
        path: "Concacaf",
        shortName: "CONCACAF",
        imageName: "confederations/concacaf.svg",
        color: "#1d4ed8",
    },
    {
        key: "uefa",
        name: "Selecciones europeas",
        path: "Uefa",
        shortName: "UEFA",
        imageName: "confederations/uefa.svg",
        color: "#2563eb",
    },
    {
        key: "caf",
        name: "Selecciones africanas",
        path: "Caf",
        shortName: "CAF",
        imageName: "confederations/caf.svg",
        color: "#16a34a",
    },
    {
        key: "afc",
        name: "Selecciones asiáticas",
        path: "Afc",
        shortName: "AFC",
        imageName: "confederations/afc.svg",
        color: "#dc2626",
    },
    {
        key: "ofc",
        name: "Selecciones de Oceanía",
        path: "Ofc",
        shortName: "OFC",
        imageName: "confederations/ofc.svg",
        color: "#0891b2",
    },
];
const logoSources = {
    worldCup: "https://store.fifa.com/cdn/shop/files/image_6dd47634-790f-4c16-9371-d02028b4a358.jpg?v=1774373612&width=1200",
    confederations: {
        conmebol: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Conmebol_text_logo_2021.svg",
        concacaf: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Concacaf_logo.svg",
        uefa: "https://commons.wikimedia.org/wiki/Special:Redirect/file/UEFA_logo.svg",
        caf: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Caf_llogo.svg",
        afc: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Asian_Football_Confederation_emblem.svg",
        ofc: "https://upload.wikimedia.org/wikipedia/commons/9/93/Oceania_Football_Confederation_logo.svg",
    },
};
const confederationByTeamName = {
    Argentina: "conmebol",
    Brazil: "conmebol",
    Colombia: "conmebol",
    Ecuador: "conmebol",
    Paraguay: "conmebol",
    Uruguay: "conmebol",
    Canada: "concacaf",
    "Curaçao": "concacaf",
    Haiti: "concacaf",
    Mexico: "concacaf",
    Panama: "concacaf",
    "United States": "concacaf",
    Austria: "uefa",
    Belgium: "uefa",
    "Bosnia-Herzegovina": "uefa",
    Croatia: "uefa",
    Czechia: "uefa",
    England: "uefa",
    France: "uefa",
    Germany: "uefa",
    Netherlands: "uefa",
    Norway: "uefa",
    Portugal: "uefa",
    Scotland: "uefa",
    Spain: "uefa",
    Sweden: "uefa",
    Algeria: "caf",
    "Cape Verde": "caf",
    "Congo DR": "caf",
    Egypt: "caf",
    Ghana: "caf",
    "Ivory Coast": "caf",
    Morocco: "caf",
    Senegal: "caf",
    "South Africa": "caf",
    Tunisia: "caf",
    Australia: "afc",
    Iran: "afc",
    Iraq: "afc",
    Japan: "afc",
    Jordan: "afc",
    Qatar: "afc",
    "Saudi Arabia": "afc",
    "South Korea": "afc",
    Türkiye: "afc",
    Uzbekistan: "afc",
    "New Zealand": "ofc",
};

async function fetchJson(url, cachePath) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not fetch ${url}: ${response.status}`);
        return response.json();
    } catch {
        return JSON.parse(await readFile(cachePath, "utf8"));
    }
}

function slug(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

function localDateValue(isoDate) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Montevideo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date(isoDate));
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}${values.month}${values.day}T${values.hour}${values.minute}00`;
}

function addTwoHours(localValue) {
    const year = Number(localValue.slice(0, 4));
    const month = Number(localValue.slice(4, 6)) - 1;
    const day = Number(localValue.slice(6, 8));
    const hour = Number(localValue.slice(9, 11));
    const minute = Number(localValue.slice(11, 13));
    return new Date(Date.UTC(year, month, day, hour + 2, minute))
        .toISOString()
        .replace(/[-:]/g, "")
        .slice(0, 15);
}

function translatePlaceholder(name) {
    const groupPlace = name.match(/^Group ([A-L]) (Winner|2nd Place|3rd Place)$/);
    if (groupPlace) {
        const position = {
            Winner: "1°",
            "2nd Place": "2°",
            "3rd Place": "3°",
        }[groupPlace[2]];
        return `${position} Grupo ${groupPlace[1]}`;
    }

    const roundWinner = name.match(/^Round of 32 (\d+) Winner$/);
    if (roundWinner) return `Ganador 16avos ${roundWinner[1]}`;

    const round16Winner = name.match(/^Round of 16 (\d+) Winner$/);
    if (round16Winner) return `Ganador octavos ${round16Winner[1]}`;

    const quarterWinner = name.match(/^Quarterfinal (\d+) Winner$/);
    if (quarterWinner) return `Ganador cuartos ${quarterWinner[1]}`;

    const semifinal = name.match(/^Semifinal (\d+) (Winner|Loser)$/);
    if (semifinal) {
        return `${semifinal[2] === "Winner" ? "Ganador" : "Perdedor"} semifinal ${semifinal[1]}`;
    }

    return name;
}

function stageName(slugName) {
    return {
        "group-stage": "Fase de grupos",
        "round-of-32": "Dieciseisavos de final",
        "round-of-16": "Octavos de final",
        quarterfinals: "Cuartos de final",
        semifinals: "Semifinal",
        "3rd-place-match": "Tercer puesto",
        final: "Final",
    }[slugName];
}

const teamsByEspnName = new Map();
const groups = standings.children.map((group) => {
    const groupName = groupNames[group.name] ?? group.name;
    const teams = group.standings.entries.map(({ team }) => {
        const name = countryNames[team.displayName] ?? team.displayName;
        const teamData = {
            name,
            path: slug(name),
            imageName: `seleccion/${slug(name)}.png`,
            espnName: team.displayName,
            confederation: confederationByTeamName[team.displayName],
            abbreviation: team.abbreviation,
            logo: team.logos?.[0]?.href,
        };
        teamsByEspnName.set(team.displayName, teamData);
        return teamData;
    });
    return {
        name: groupName,
        path: groupName.replace(" ", ""),
        teams: teams.map(({ name, path, imageName }) => ({ name, path, imageName })),
    };
});

await mkdir(path.join(publicDir, "img/icons/mundial"), { recursive: true });
await mkdir(path.join(publicDir, "img/icons/seleccion"), { recursive: true });
await mkdir(path.join(publicDir, "img/icons/confederations"), { recursive: true });
await writeWorldCupEmblem(
    logoSources.worldCup,
    path.join(publicDir, "img/icons/mundial/mundial.png")
);
await writeWorldCupBackground(path.join(publicDir, "img/icons/mundial-bg.jpg"));

for (const confederation of confederations) {
    await writeRemoteAsset(
        logoSources.confederations[confederation.key],
        path.join(publicDir, `img/icons/${confederation.imageName}`),
        confederationLogo(confederation)
    );
}

for (const team of teamsByEspnName.values()) {
    const outputPath = path.join(publicDir, `img/icons/${team.imageName}`);
    if (!team.logo) {
        await writeFile(outputPath, fallbackLogo(team));
        continue;
    }
    let response;
    try {
        response = await fetch(team.logo);
    } catch {
        await writeFile(outputPath, fallbackLogo(team));
        continue;
    }
    if (!response.ok) {
        await writeFile(outputPath, fallbackLogo(team));
        continue;
    }
    await writeFile(
        outputPath,
        Buffer.from(await response.arrayBuffer())
    );
}

function fallbackLogo(team) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#111827"/>
  <circle cx="256" cy="220" r="132" fill="#1d4ed8" opacity="0.9"/>
  <circle cx="256" cy="220" r="104" fill="none" stroke="#f8fafc" stroke-width="18"/>
  <text x="256" y="245" text-anchor="middle" font-size="82" font-family="Arial, sans-serif" font-weight="700" fill="#fff">${team.abbreviation}</text>
  <text x="256" y="390" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" font-weight="700" fill="#fff">${team.name}</text>
</svg>
`;
}

function confederationLogo(confederation) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${confederation.color}"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <circle cx="256" cy="212" r="112" fill="none" stroke="#ffffff" stroke-width="28" opacity="0.95"/>
  <path d="M176 212h160M256 100c42 44 42 180 0 224M256 100c-42 44-42 180 0 224" stroke="#ffffff" stroke-width="18" fill="none" stroke-linecap="round" opacity="0.8"/>
  <text x="256" y="398" text-anchor="middle" font-size="58" font-family="Arial, sans-serif" font-weight="800" fill="#ffffff">${confederation.shortName}</text>
</svg>
`;
}

async function writeRemoteAsset(url, outputPath, fallback) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    } catch {
        try {
            await readFile(outputPath);
        } catch {
            if (fallback === null) throw new Error(`Could not download ${url}`);
            await writeFile(outputPath, fallback);
        }
    }
}

async function writeWorldCupEmblem(url, outputPath) {
    try {
        const existingEmblem = await readFile(outputPath);
        await writeWorldCupEmblemImage(existingEmblem, outputPath);
        return;
    } catch {
        // Fall back to downloading the product image below when there is no local emblem yet.
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const source = Buffer.from(await response.arrayBuffer());
        const image = await sharp(source)
            .extract({ left: 390, top: 630, width: 430, height: 500 })
            .resize(900, 900, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });
        const { data, info } = image;
        for (let index = 0; index < data.length; index += 4) {
            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            if (red > 245 && green > 245 && blue > 245) {
                data[index + 3] = 0;
            }
        }
        const output = await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4,
            },
        })
            .png()
            .toBuffer();
        await writeWorldCupEmblemImage(output, outputPath);
    } catch {
        try {
            await readFile(outputPath);
        } catch {
            throw new Error(`Could not download ${url}`);
        }
    }
}

async function writeWorldCupEmblemImage(source, outputPath) {
    const { data, info } = await sharp(source)
        .resize(900, 900, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    removeWorldCupTrademark(data, info);
    await sharp(data, { raw: info })
        .png()
        .toFile(outputPath);
}

function removeWorldCupTrademark(data, info) {
    const { width } = info;
    const index = (x, y) => (y * width + x) * 4;
    const isDark = (x, y) => {
        const position = index(x, y);
        return (
            data[position + 3] > 20 &&
            data[position] < 95 &&
            data[position + 1] < 95 &&
            data[position + 2] < 95
        );
    };

    const bounds = { left: 650, top: 700, right: 800, bottom: 890 };
    const boundsWidth = bounds.right - bounds.left;
    const visited = new Uint8Array(boundsWidth * (bounds.bottom - bounds.top));
    const darkPoints = [];

    for (let y = bounds.top; y < bounds.bottom; y += 1) {
        for (let x = bounds.left; x < bounds.right; x += 1) {
            const seenIndex = (y - bounds.top) * boundsWidth + x - bounds.left;
            if (visited[seenIndex] || !isDark(x, y)) continue;
            const queue = [[x, y]];
            const points = [];
            let head = 0;
            let minX = x;
            let maxX = x;
            let minY = y;
            let maxY = y;
            visited[seenIndex] = 1;

            while (head < queue.length) {
                const [currentX, currentY] = queue[head];
                head += 1;
                points.push([currentX, currentY]);
                minX = Math.min(minX, currentX);
                maxX = Math.max(maxX, currentX);
                minY = Math.min(minY, currentY);
                maxY = Math.max(maxY, currentY);

                for (const [deltaX, deltaY] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nextX = currentX + deltaX;
                    const nextY = currentY + deltaY;
                    if (
                        nextX < bounds.left ||
                        nextX >= bounds.right ||
                        nextY < bounds.top ||
                        nextY >= bounds.bottom
                    ) {
                        continue;
                    }
                    const nextSeenIndex = (nextY - bounds.top) * boundsWidth + nextX - bounds.left;
                    if (!visited[nextSeenIndex] && isDark(nextX, nextY)) {
                        visited[nextSeenIndex] = 1;
                        queue.push([nextX, nextY]);
                    }
                }
            }

            if (points.length > 50 && minX >= 680 && maxY >= 800) {
                darkPoints.push(...points);
            }
        }
    }

    const original = new Uint8ClampedArray(data);
    const mask = new Uint8Array(width * info.height);
    for (const [x, y] of darkPoints) {
        for (let deltaY = -10; deltaY <= 10; deltaY += 1) {
            for (let deltaX = -10; deltaX <= 10; deltaX += 1) {
                if (deltaX * deltaX + deltaY * deltaY > 100) continue;
                const nextX = x + deltaX;
                const nextY = y + deltaY;
                if (nextX < 672 || nextX > 750 || nextY < 785 || nextY > 890) continue;
                mask[nextY * width + nextX] = 1;
            }
        }
    }

    const isYellow = (x, y) => {
        const position = index(x, y);
        return (
            original[position + 3] > 200 &&
            original[position] > 210 &&
            original[position + 1] > 120 &&
            original[position + 1] < 220 &&
            original[position + 2] < 80
        );
    };

    for (let y = 785; y <= 890; y += 1) {
        for (let x = 672; x <= 750; x += 1) {
            if (!mask[y * width + x]) continue;
            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            let samples = 0;
            for (let radius = 3; radius <= 26 && samples < 20; radius += 3) {
                for (let deltaY = -radius; deltaY <= radius; deltaY += 3) {
                    for (let deltaX = -radius; deltaX <= radius; deltaX += 3) {
                        const nextX = x + deltaX;
                        const nextY = y + deltaY;
                        if (nextX < 650 || nextX >= 800 || nextY < 700 || nextY >= 895) continue;
                        if (mask[nextY * width + nextX]) continue;
                        if (!isYellow(nextX, nextY)) continue;
                        const samplePosition = index(nextX, nextY);
                        red += original[samplePosition];
                        green += original[samplePosition + 1];
                        blue += original[samplePosition + 2];
                        alpha += original[samplePosition + 3];
                        samples += 1;
                    }
                }
            }

            const position = index(x, y);
            if (data[position + 3] === 0) continue;
            data[position] = samples > 0 ? Math.round(red / samples) : 250;
            data[position + 1] = samples > 0 ? Math.round(green / samples) : 188;
            data[position + 2] = samples > 0 ? Math.round(blue / samples) : 29;
            data[position + 3] = samples > 0 ? Math.round(alpha / samples) : 255;
        }
    }
}

async function writeWorldCupBackground(outputPath) {
    const horizontalArtwork = path.join(publicDir, "official_album_d05-3200x1800.avif");
    const verticalArtwork = path.join(publicDir, "FWC-2026-Official-Album-4x5-FIFA-Sound.avif");
    try {
        const [horizontalSource, verticalSource] = await Promise.all([
            readFile(horizontalArtwork),
            readFile(verticalArtwork),
        ]);
        await sharp(horizontalSource)
            .resize(2400, 1672, { fit: "cover", position: "center" })
            .blur(2)
            .modulate({ brightness: 0.72, saturation: 1.1 })
            .linear(1.08, -24)
            .jpeg({ quality: 92 })
            .toFile(outputPath);
        await sharp(verticalSource)
            .extract({ left: 0, top: 120, width: 767, height: 1000 })
            .resize(2400, 1672, { fit: "cover", position: "center" })
            .blur(4)
            .modulate({ brightness: 0.58, saturation: 0.82 })
            .linear(1.04, -45)
            .jpeg({ quality: 90 })
            .toFile(path.join(publicDir, "img/icons/mundial-bg.jpg"));
        await sharp(verticalSource)
            .extract({ left: 0, top: 350, width: 767, height: 900 })
            .resize(2400, 1672, { fit: "cover", position: "center" })
            .blur(4)
            .modulate({ brightness: 0.54, saturation: 0.8 })
            .linear(1.04, -45)
            .jpeg({ quality: 90 })
            .toFile(path.join(publicDir, "img/icons/mundial-bg.jpg"));
        return;
    } catch {
        // Fall back to the generated abstract background below when the local artwork is missing.
    }
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1672" viewBox="0 0 2400 1672">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#061337"/>
      <stop offset="0.34" stop-color="#0b4f91"/>
      <stop offset="0.64" stop-color="#0a657c"/>
      <stop offset="1" stop-color="#05224f"/>
    </linearGradient>
    <linearGradient id="red" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f43056" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#f43056" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#f43056" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="green" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#00a651" stop-opacity="0"/>
      <stop offset="0.55" stop-color="#00a651" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#00a651" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffd24a" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#ffd24a" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ffd24a" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24"/>
    </filter>
    <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
  <rect width="2400" height="1672" fill="url(#base)"/>
  <g opacity="0.5" filter="url(#blur)">
    <ellipse cx="1190" cy="840" rx="660" ry="430" fill="#1386a8"/>
    <ellipse cx="1220" cy="810" rx="430" ry="270" fill="#2f6fb3"/>
    <ellipse cx="300" cy="1320" rx="760" ry="440" fill="#0a84ff"/>
    <ellipse cx="2060" cy="280" rx="620" ry="360" fill="#14408e"/>
    <ellipse cx="1780" cy="1390" rx="540" ry="340" fill="#00a651"/>
    <ellipse cx="560" cy="120" rx="440" ry="260" fill="#f43056"/>
  </g>
  <g opacity="0.34">
    <polygon points="-120,1160 420,760 850,1210 280,1650" fill="#0a84ff"/>
    <polygon points="270,240 810,-120 1190,420 620,700" fill="#f43056"/>
    <polygon points="760,420 1320,260 1710,760 1160,1050" fill="#1aa6bd"/>
    <polygon points="930,620 1480,490 1740,920 1190,1190" fill="#2e7dc2"/>
    <polygon points="1110,1110 1600,760 2050,1220 1490,1600" fill="#00a651"/>
    <polygon points="1520,120 2160,-80 2460,410 1820,670" fill="#0a84ff"/>
  </g>
  <g opacity="0.42">
    <path d="M-240 420 C 420 210, 820 620, 1420 320 S 2210 130, 2650 260" fill="none" stroke="url(#gold)" stroke-width="34"/>
    <path d="M-180 540 C 480 330, 860 710, 1460 430 S 2220 250, 2600 390" fill="none" stroke="url(#red)" stroke-width="28"/>
    <path d="M-220 780 C 430 580, 880 970, 1450 710 S 2200 520, 2620 690" fill="none" stroke="url(#gold)" stroke-width="24"/>
    <path d="M-210 1250 C 460 960, 930 1390, 1510 1040 S 2200 820, 2600 1030" fill="none" stroke="url(#green)" stroke-width="34"/>
    <path d="M-260 1370 C 410 1090, 950 1510, 1540 1160 S 2190 960, 2640 1120" fill="none" stroke="url(#gold)" stroke-width="18"/>
  </g>
  <g opacity="0.6" filter="url(#soft)">
    <circle cx="240" cy="275" r="5" fill="#ffffff"/>
    <circle cx="430" cy="410" r="3" fill="#ffffff"/>
    <circle cx="640" cy="620" r="4" fill="#ffffff"/>
    <circle cx="910" cy="300" r="3" fill="#ffffff"/>
    <circle cx="1190" cy="840" r="5" fill="#ffffff"/>
    <circle cx="1410" cy="510" r="3" fill="#ffffff"/>
    <circle cx="1640" cy="260" r="4" fill="#ffffff"/>
    <circle cx="1860" cy="760" r="3" fill="#ffffff"/>
    <circle cx="2110" cy="520" r="5" fill="#ffffff"/>
    <circle cx="2260" cy="1040" r="4" fill="#ffffff"/>
    <circle cx="2050" cy="1320" r="3" fill="#ffffff"/>
    <circle cx="1640" cy="1450" r="5" fill="#ffffff"/>
    <circle cx="980" cy="1320" r="3" fill="#ffffff"/>
    <circle cx="520" cy="1455" r="4" fill="#ffffff"/>
  </g>
  <g opacity="0.32">
    <polygon points="130,980 300,930 460,1010 365,1160 180,1140" fill="#ffffff"/>
    <polygon points="760,900 930,840 1110,930 1050,1110 850,1115" fill="#0a84ff"/>
    <polygon points="1030,565 1240,510 1445,635 1360,820 1120,815" fill="#ffffff"/>
    <polygon points="1320,250 1490,185 1670,280 1600,455 1400,455" fill="#ffffff"/>
    <polygon points="1900,1120 2080,1060 2250,1165 2175,1340 1970,1340" fill="#0a84ff"/>
  </g>
  <rect width="2400" height="1672" fill="#061337" opacity="0.06"/>
</svg>`;
    const output = await sharp(Buffer.from(svg))
        .jpeg({ quality: 92 })
        .toBuffer();
    await writeFile(outputPath, output);
}

const teams = [...teamsByEspnName.values()];
const confederationCards = confederations.map(({ name, path, imageName }) => ({ name, path, imageName }));
const countries = [{
    name: "Calendarios por confederación",
    teams: confederationCards,
}];

const tournament = {
    href: "mundial",
    title: "Copa del Mundo",
    imgSrc: "img/icons/mundial/mundial.png",
    backgroundImage: "img/icons/mundial-bg.jpg",
    calendarFile: "Mundial.ics",
    countries,
    groups,
};

const calendarPages = [
    ...teams.map(({ name, path, imageName }) => ({
        type: "team",
        name,
        path,
        imageName,
        tournament: "mundial",
    })),
    ...confederations.map(({ name, path, imageName }) => ({
        type: "confederation",
        name,
        path,
        imageName,
        tournament: "mundial",
    })),
    ...groups.map(({ name, path }) => ({
        type: "group",
        name,
        path,
        imageName: "",
        tournament: "mundial",
    })),
    {
        type: "tournament",
        name: "Copa del Mundo",
        path: "Completa",
        imageName: "mundial.png",
        tournament: "mundial",
    },
];

await writeFile(worldcupDataPath, `${JSON.stringify({
    tournaments: [tournament],
    tournamentPages: [{
        typeName: "Copa del Mundo",
        name: "2026",
        tournament: "mundial",
    }],
    calendarPages,
}, null, 4)}\n`);

const groupByTeamPath = new Map();
for (const group of groups) {
    for (const team of group.teams) groupByTeamPath.set(team.path, group);
}

const events = scoreboard.events
    .map((event) => {
        const competition = event.competitions[0];
        const homeCompetitor = competition.competitors.find(({ homeAway }) => homeAway === "home");
        const awayCompetitor = competition.competitors.find(({ homeAway }) => homeAway === "away");
        const home = teamsByEspnName.get(homeCompetitor.team.displayName);
        const away = teamsByEspnName.get(awayCompetitor.team.displayName);
        const start = localDateValue(event.date);
        return {
            id: event.id,
            stage: event.season.slug,
            date: event.date,
            start,
            home: home ?? {
                name: translatePlaceholder(homeCompetitor.team.displayName),
                path: slug(homeCompetitor.team.displayName),
            },
            away: away ?? {
                name: translatePlaceholder(awayCompetitor.team.displayName),
                path: slug(awayCompetitor.team.displayName),
            },
            group: home && away ? groupByTeamPath.get(home.path) : null,
            venue: competition.venue?.fullName ?? "Estadio a definir",
        };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

for (const group of groups) {
    const groupEvents = events.filter(
        (event) => event.stage === "group-stage" && event.group?.path === group.path
    );
    groupEvents.forEach((event, index) => {
        event.matchday = Math.floor(index / 2) + 1;
    });
}

function description(event) {
    if (event.stage === "group-stage") {
        return `${event.group.name} - Fecha ${event.matchday} - Copa del Mundo`;
    }
    return `${stageName(event.stage)} - Copa del Mundo`;
}

function renderEvent(event) {
    return [
        "BEGIN:VEVENT",
        `UID:${event.start}Z_${event.home.path}_${event.away.path}`,
        `DTSTART;TZID=America/Montevideo:${event.start}`,
        `DTEND;TZID=America/Montevideo:${addTwoHours(event.start)}`,
        `SUMMARY:${event.home.name} vs. ${event.away.name}`,
        `DESCRIPTION:${description(event)}`,
        "CLASS:PUBLIC",
        `LOCATION:${event.venue}`,
        "END:VEVENT",
    ].join("\n");
}

function renderCalendar(calendarEvents) {
    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Calendarios Copa del Mundo//ES",
        calendarEvents.map(renderEvent).join("\n\n"),
        "END:VCALENDAR",
        "",
    ].join("\n");
}

// Estructura canónica reorganizada: el español vive en public/es y el Mundial
// usa el slug camelCase "copaDelMundo" (ver translate-ics.mjs).
const esDir = path.join(publicDir, "es");
await mkdir(path.join(esDir, "copaDelMundo/2026"), { recursive: true });
await mkdir(path.join(esDir, "seleccion"), { recursive: true });
await mkdir(path.join(esDir, "selecciones"), { recursive: true });
await writeFile(path.join(esDir, "copaDelMundo.ics"), renderCalendar(events));

for (const team of teams) {
    await writeFile(
        path.join(esDir, `seleccion/${team.path}.ics`),
        renderCalendar(events.filter(
            (event) => event.home.path === team.path || event.away.path === team.path
        ))
    );
}

for (const confederation of confederations) {
    const teamPaths = new Set(
        teams
            .filter((team) => team.confederation === confederation.key)
            .map((team) => team.path)
    );
    await writeFile(
        path.join(esDir, `selecciones/${confederation.path}.ics`),
        renderCalendar(events.filter(
            (event) => teamPaths.has(event.home.path) || teamPaths.has(event.away.path)
        ))
    );
}

for (const group of groups) {
    await writeFile(
        path.join(esDir, `copaDelMundo/2026/${group.path}.ics`),
        renderCalendar(events.filter((event) => {
            // Fase de grupos: partidos de este grupo.
            if (event.stage === "group-stage") return event.group?.path === group.path;
            // Eliminatorias: partidos de equipos que jugaron este grupo.
            return (
                groupByTeamPath.get(event.home.path)?.path === group.path ||
                groupByTeamPath.get(event.away.path)?.path === group.path
            );
        }))
    );
}

console.log(`Generated World Cup data: ${teams.length} teams, ${groups.length} groups, ${events.length} matches.`);
