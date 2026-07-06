// Diccionario maestro de traducciones de selecciones, gentilicios,
// confederaciones y tokens de fase/competición.
// Lo usan tanto el script de generación de ICS como las páginas de la web.
//
// Para cada selección guardamos, por idioma:
//   - name: nombre visible (SUMMARY del partido, títulos de la web)
//   - slug: forma ASCII en CamelCase (nombre de archivo .ics, ruta de la web
//           y token dentro de los UID de los eventos)




// Clave = slug en español (el actual). Es la "identidad" de la selección.
export const selecciones = {
  Mexico: { es: { name: "México", slug: "Mexico" }, en: { name: "Mexico", slug: "Mexico" }, pt: { name: "México", slug: "Mexico" } },
  RepublicaCheca: { es: { name: "República Checa", slug: "RepublicaCheca" }, en: { name: "Czech Republic", slug: "CzechRepublic" }, pt: { name: "República Tcheca", slug: "RepublicaTcheca" } },
  CoreaDelSur: { es: { name: "Corea del Sur", slug: "CoreaDelSur" }, en: { name: "South Korea", slug: "SouthKorea" }, pt: { name: "Coreia do Sul", slug: "CoreiaDoSul" } },
  Sudafrica: { es: { name: "Sudáfrica", slug: "Sudafrica" }, en: { name: "South Africa", slug: "SouthAfrica" }, pt: { name: "África do Sul", slug: "AfricaDoSul" } },
  Canada: { es: { name: "Canadá", slug: "Canada" }, en: { name: "Canada", slug: "Canada" }, pt: { name: "Canadá", slug: "Canada" } },
  BosniaYHerzegovina: { es: { name: "Bosnia y Herzegovina", slug: "BosniaYHerzegovina" }, en: { name: "Bosnia and Herzegovina", slug: "BosniaAndHerzegovina" }, pt: { name: "Bósnia e Herzegovina", slug: "BosniaEHerzegovina" } },
  Suiza: { es: { name: "Suiza", slug: "Suiza" }, en: { name: "Switzerland", slug: "Switzerland" }, pt: { name: "Suíça", slug: "Suica" } },
  Qatar: { es: { name: "Qatar", slug: "Qatar" }, en: { name: "Qatar", slug: "Qatar" }, pt: { name: "Catar", slug: "Catar" } },
  Brasil: { es: { name: "Brasil", slug: "Brasil" }, en: { name: "Brazil", slug: "Brazil" }, pt: { name: "Brasil", slug: "Brasil" } },
  Escocia: { es: { name: "Escocia", slug: "Escocia" }, en: { name: "Scotland", slug: "Scotland" }, pt: { name: "Escócia", slug: "Escocia" } },
  Haiti: { es: { name: "Haití", slug: "Haiti" }, en: { name: "Haiti", slug: "Haiti" }, pt: { name: "Haiti", slug: "Haiti" } },
  Marruecos: { es: { name: "Marruecos", slug: "Marruecos" }, en: { name: "Morocco", slug: "Morocco" }, pt: { name: "Marrocos", slug: "Marrocos" } },
  Paraguay: { es: { name: "Paraguay", slug: "Paraguay" }, en: { name: "Paraguay", slug: "Paraguay" }, pt: { name: "Paraguai", slug: "Paraguai" } },
  Turquia: { es: { name: "Turquía", slug: "Turquia" }, en: { name: "Turkey", slug: "Turkey" }, pt: { name: "Turquia", slug: "Turquia" } },
  Australia: { es: { name: "Australia", slug: "Australia" }, en: { name: "Australia", slug: "Australia" }, pt: { name: "Austrália", slug: "Australia" } },
  EstadosUnidos: { es: { name: "Estados Unidos", slug: "EstadosUnidos" }, en: { name: "United States", slug: "UnitedStates" }, pt: { name: "Estados Unidos", slug: "EstadosUnidos" } },
  Ecuador: { es: { name: "Ecuador", slug: "Ecuador" }, en: { name: "Ecuador", slug: "Ecuador" }, pt: { name: "Equador", slug: "Equador" } },
  Alemania: { es: { name: "Alemania", slug: "Alemania" }, en: { name: "Germany", slug: "Germany" }, pt: { name: "Alemanha", slug: "Alemanha" } },
  CostaDeMarfil: { es: { name: "Costa de Marfil", slug: "CostaDeMarfil" }, en: { name: "Ivory Coast", slug: "IvoryCoast" }, pt: { name: "Costa do Marfim", slug: "CostaDoMarfim" } },
  Curazao: { es: { name: "Curazao", slug: "Curazao" }, en: { name: "Curaçao", slug: "Curacao" }, pt: { name: "Curaçao", slug: "Curacao" } },
  PaisesBajos: { es: { name: "Países Bajos", slug: "PaisesBajos" }, en: { name: "Netherlands", slug: "Netherlands" }, pt: { name: "Países Baixos", slug: "PaisesBaixos" } },
  Suecia: { es: { name: "Suecia", slug: "Suecia" }, en: { name: "Sweden", slug: "Sweden" }, pt: { name: "Suécia", slug: "Suecia" } },
  Japon: { es: { name: "Japón", slug: "Japon" }, en: { name: "Japan", slug: "Japan" }, pt: { name: "Japão", slug: "Japao" } },
  Tunez: { es: { name: "Túnez", slug: "Tunez" }, en: { name: "Tunisia", slug: "Tunisia" }, pt: { name: "Tunísia", slug: "Tunisia" } },
  Belgica: { es: { name: "Bélgica", slug: "Belgica" }, en: { name: "Belgium", slug: "Belgium" }, pt: { name: "Bélgica", slug: "Belgica" } },
  Iran: { es: { name: "Irán", slug: "Iran" }, en: { name: "Iran", slug: "Iran" }, pt: { name: "Irã", slug: "Ira" } },
  Egipto: { es: { name: "Egipto", slug: "Egipto" }, en: { name: "Egypt", slug: "Egypt" }, pt: { name: "Egito", slug: "Egito" } },
  NuevaZelanda: { es: { name: "Nueva Zelanda", slug: "NuevaZelanda" }, en: { name: "New Zealand", slug: "NewZealand" }, pt: { name: "Nova Zelândia", slug: "NovaZelandia" } },
  Espana: { es: { name: "España", slug: "Espana" }, en: { name: "Spain", slug: "Spain" }, pt: { name: "Espanha", slug: "Espanha" } },
  Uruguay: { es: { name: "Uruguay", slug: "Uruguay" }, en: { name: "Uruguay", slug: "Uruguay" }, pt: { name: "Uruguai", slug: "Uruguai" } },
  ArabiaSaudita: { es: { name: "Arabia Saudita", slug: "ArabiaSaudita" }, en: { name: "Saudi Arabia", slug: "SaudiArabia" }, pt: { name: "Arábia Saudita", slug: "ArabiaSaudita" } },
  CaboVerde: { es: { name: "Cabo Verde", slug: "CaboVerde" }, en: { name: "Cape Verde", slug: "CapeVerde" }, pt: { name: "Cabo Verde", slug: "CaboVerde" } },
  Noruega: { es: { name: "Noruega", slug: "Noruega" }, en: { name: "Norway", slug: "Norway" }, pt: { name: "Noruega", slug: "Noruega" } },
  Francia: { es: { name: "Francia", slug: "Francia" }, en: { name: "France", slug: "France" }, pt: { name: "França", slug: "Franca" } },
  Senegal: { es: { name: "Senegal", slug: "Senegal" }, en: { name: "Senegal", slug: "Senegal" }, pt: { name: "Senegal", slug: "Senegal" } },
  Irak: { es: { name: "Irak", slug: "Irak" }, en: { name: "Iraq", slug: "Iraq" }, pt: { name: "Iraque", slug: "Iraque" } },
  Argentina: { es: { name: "Argentina", slug: "Argentina" }, en: { name: "Argentina", slug: "Argentina" }, pt: { name: "Argentina", slug: "Argentina" } },
  Austria: { es: { name: "Austria", slug: "Austria" }, en: { name: "Austria", slug: "Austria" }, pt: { name: "Áustria", slug: "Austria" } },
  Argelia: { es: { name: "Argelia", slug: "Argelia" }, en: { name: "Algeria", slug: "Algeria" }, pt: { name: "Argélia", slug: "Argelia" } },
  Jordania: { es: { name: "Jordania", slug: "Jordania" }, en: { name: "Jordan", slug: "Jordan" }, pt: { name: "Jordânia", slug: "Jordania" } },
  Colombia: { es: { name: "Colombia", slug: "Colombia" }, en: { name: "Colombia", slug: "Colombia" }, pt: { name: "Colômbia", slug: "Colombia" } },
  Portugal: { es: { name: "Portugal", slug: "Portugal" }, en: { name: "Portugal", slug: "Portugal" }, pt: { name: "Portugal", slug: "Portugal" } },
  Uzbekistan: { es: { name: "Uzbekistán", slug: "Uzbekistan" }, en: { name: "Uzbekistan", slug: "Uzbekistan" }, pt: { name: "Uzbequistão", slug: "Uzbequistao" } },
  RDCongo: { es: { name: "RD Congo", slug: "RDCongo" }, en: { name: "DR Congo", slug: "DRCongo" }, pt: { name: "Congo RD", slug: "CongoRD" } },
  Inglaterra: { es: { name: "Inglaterra", slug: "Inglaterra" }, en: { name: "England", slug: "England" }, pt: { name: "Inglaterra", slug: "Inglaterra" } },
  Croacia: { es: { name: "Croacia", slug: "Croacia" }, en: { name: "Croatia", slug: "Croatia" }, pt: { name: "Croácia", slug: "Croacia" } },
  Panama: { es: { name: "Panamá", slug: "Panama" }, en: { name: "Panama", slug: "Panama" }, pt: { name: "Panamá", slug: "Panama" } },
  Ghana: { es: { name: "Ghana", slug: "Ghana" }, en: { name: "Ghana", slug: "Ghana" }, pt: { name: "Gana", slug: "Gana" } },
};

// Gentilicios (calendarios "Equipos X" de Libertadores/Sudamericana).
// Clave = slug en español. "name" es sólo el gentilicio (la web le antepone
// "Equipos"/"Teams"/"Times" según el idioma).
export const gentilicios = {
  Argentinos: { es: { name: "Argentinos", slug: "argentinos" }, en: { name: "Argentine", slug: "argentine" }, pt: { name: "Argentinos", slug: "argentinos" } },
  Bolivianos: { es: { name: "Bolivianos", slug: "bolivianos" }, en: { name: "Bolivian", slug: "bolivian" }, pt: { name: "Bolivianos", slug: "bolivianos" } },
  Brasileros: { es: { name: "Brasileros", slug: "brasileros" }, en: { name: "Brazilian", slug: "brazilian" }, pt: { name: "Brasileiros", slug: "brasileiros" } },
  Chilenos: { es: { name: "Chilenos", slug: "chilenos" }, en: { name: "Chilean", slug: "chilean" }, pt: { name: "Chilenos", slug: "chilenos" } },
  Colombianos: { es: { name: "Colombianos", slug: "colombianos" }, en: { name: "Colombian", slug: "colombian" }, pt: { name: "Colombianos", slug: "colombianos" } },
  Ecuatorianos: { es: { name: "Ecuatorianos", slug: "ecuatorianos" }, en: { name: "Ecuadorian", slug: "ecuadorian" }, pt: { name: "Equatorianos", slug: "equatorianos" } },
  Paraguayos: { es: { name: "Paraguayos", slug: "paraguayos" }, en: { name: "Paraguayan", slug: "paraguayan" }, pt: { name: "Paraguaios", slug: "paraguaios" } },
  Peruanos: { es: { name: "Peruanos", slug: "peruanos" }, en: { name: "Peruvian", slug: "peruvian" }, pt: { name: "Peruanos", slug: "peruanos" } },
  Uruguayos: { es: { name: "Uruguayos", slug: "uruguayos" }, en: { name: "Uruguayan", slug: "uruguayan" }, pt: { name: "Uruguaios", slug: "uruguaios" } },
  Venezolanos: { es: { name: "Venezolanos", slug: "venezolanos" }, en: { name: "Venezuelan", slug: "venezuelan" }, pt: { name: "Venezuelanos", slug: "venezuelanos" } },
};

// Confederaciones (path se mantiene: es nombre propio).
export const confederaciones = {
  Conmebol: { es: "Selecciones sudamericanas", en: "South American teams", pt: "Seleções sul-americanas" },
  Concacaf: { es: "Selecciones norteamericanas", en: "North American teams", pt: "Seleções norte-americanas" },
  Uefa: { es: "Selecciones europeas", en: "European teams", pt: "Seleções europeias" },
  Caf: { es: "Selecciones africanas", en: "African teams", pt: "Seleções africanas" },
  Afc: { es: "Selecciones asiáticas", en: "Asian teams", pt: "Seleções asiáticas" },
  Ofc: { es: "Selecciones de Oceanía", en: "Oceanian teams", pt: "Seleções da Oceania" },
};
