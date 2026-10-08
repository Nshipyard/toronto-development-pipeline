"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const MCP_EN = `__MCP_EN__`;
const MCP_FR = `__MCP_FR__`;

const en = {
  banner: {
    line: "An open-source civic project by Nshipyard. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: {
    explorer: "Explorer",
    homes: "Net homes",
    permits: "Permit times",
    developers: "Developers",
    data: "Data",
    back: "All projects",
  },
  hero: {
    kicker: "Nshipyard Canada · Project 08",
    title: "Toronto's housing pipeline, normalized.",
    sub: "City Planning publishes a Development Pipeline: every large project from application to occupancy, with proposed unit counts. This is that file cleaned, joined to wards and neighbourhoods, with a normalized status taxonomy, plus building-permit issuance times from 202,779 active permits.",
    cta1: "Explore applications",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "2,391", label: "development applications in the official pipeline, each with a normalized status" },
    { value: "124,326", label: "homes in projects marked Built: the net homes actually gained" },
    { value: "803,206", label: "homes still in the pipeline: proposed or active, not yet built" },
    { value: "272", label: "median days for a New Building permit to go from application to issuance" },
  ],
  explorer: {
    kicker: "Explorer",
    title: "Find any application.",
    search: "Search by address, application id, or neighbourhood…",
    status: "Status",
    allStatuses: "All statuses",
    proposed: "Proposed",
    active: "Active",
    built: "Built",
    ward: "Ward",
    allWards: "All wards",
    detail: {
      application: "Application",
      address: "Address",
      status: "Status",
      units: "Proposed homes",
      ward: "Ward",
      neighbourhood: "Neighbourhood (158 model)",
      received: "Date received",
      resGfa: "Residential floor area (sq m)",
      nonresGfa: "Non-residential floor area (sq m)",
      aic: "Application Information Centre",
      timeline: "Pipeline position",
    },
    noResult: "No application matches.",
    empty: "Search above, or filter by status or ward, to see an application's units, timeline, and neighbourhood.",
    results: "results",
  },
  homes: {
    kicker: "Showcase",
    title: "Which neighbourhoods actually gained homes, net?",
    body: "The pipeline file lists proposed units for every project. Counting only projects the City marks Built gives the net homes actually gained, by 158-model neighbourhood. Everything else is still pipeline: proposed or active, not yet built.",
    builtUnits: "homes gained (Built)",
    pipelineUnits: "homes in pipeline",
    projects: "projects",
    topTitle: "Most homes gained, by neighbourhood",
    mapNote: "Darker red means more Built homes. 96.2% of pipeline records were matched to a neighbourhood.",
    built: "Built",
    inPipeline: "In pipeline",
  },
  permits: {
    kicker: "Showcase",
    title: "How long does a building permit really take?",
    body: "From 202,779 active building permits, the calendar days between application and issuance, by permit type. A New Building permit takes a median of 272 days. A small residential project takes 19. The gap is the story.",
    medianDays: "median days",
    permits: "permits",
    byType: "Issuance time by permit type",
    byYear: "New Building permits: median days by application year",
    yearNote: "This dataset is a snapshot of permits active as of October 2026. Older years only include permits still open, so early-year medians carry survivorship bias.",
    type: "Permit type",
    year: "Year",
    n: "Permits",
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same normalized data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    openapi: "OpenAPI spec",
  },
  data: {
    kicker: "Data",
    title: "Take the files.",
    body: "Versioned releases, MIT licensed. CSV for spreadsheets.",
    files: [
      { name: "pipeline.csv", desc: "2,391 applications: normalized status, units, ward, 158-model neighbourhood" },
      { name: "permit_times.csv", desc: "Median issuance days by permit type and year, with p25/p75" },
      { name: "summary.json", desc: "Totals, units by status, built units by neighbourhood, methodology notes" },
    ],
    download: "Download",
  },
  methodology: {
    kicker: "Methodology",
    title: "What the numbers mean, and what they do not.",
    points: [
      "Source: the City of Toronto's official Development Pipeline analytical dataset, retrieved October 8, 2026, joined to the Development Applications file on application number (96.8% match) for coordinates, then to the 158-model neighbourhood boundaries (96.2% matched).",
      "Status taxonomy: Under Review becomes proposed (submitted, decision pending); Active becomes active (approved or under construction, not yet recorded complete); Built becomes built (completed). Only built units count as homes gained.",
      "Unit counts are proposed units from planning applications, not final occupancy counts. The pipeline covers larger developments requiring Planning Act approvals; as-of-right development below the Site Plan Control threshold is excluded.",
      "Permit times come from the Building Permits Active Permits file: calendar days from application date to issued date. It is a snapshot of permits active in October 2026, so older years only include permits still open. Negative values and values over 10 years were excluded as data-entry errors.",
      "The City does not publish per-project completion dates or final built unit counts in these files; built status is the closest available proxy for homes gained.",
    ],
  },
  footer: {
    line: "An open-source civic project by Nshipyard. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Sources: City of Toronto Open Data (Development Pipeline, Development Applications, Building Permits - Active Permits). Neighbourhood boundaries: the 158-model file from Nshipyard's geo concordances project.",
  },
  mcp: {
    kicker: "Connect your agent",
    title: "Put this data to work inside your AI tools.",
    body: "Pick your harness, copy the prompt, send it to your agent. Your agent runs the setup itself.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Other" },
    cardTitle: "Copy and send this to {tab}",
    copy: "Copy",
    copied: "Copied",
    chatgptNote: "ChatGPT connects through the documented REST API rather than MCP directly.",
    pChatgpt:
      "I want to use the {displayName} through its API.\n- OpenAPI spec: {origin}/api/openapi.json\n- REST base: {origin}/api/v1\nFirst tell me in two sentences what this API offers, then {exampleLower}, and show me the result.",
    pClaude:
      "In Claude (claude.ai), open Settings, then Connectors, and add a custom connector:\n- Name: {displayName}\n- URL: {origin}/mcp\nThen list the available tools, {exampleLower}, and show me the result.",
    pClaudeCode:
      "Set up the {displayName} MCP server so I can query it from here.\n1. Run: claude mcp add --transport http {slug} {origin}/mcp\n2. Run `claude mcp list` to confirm it connected.\n3. {example}, and show me the result.",
    pCli:
      "# MCP endpoint (streamable HTTP)\n{origin}/mcp\n\n# List the available tools\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Everything else",
    otherBody: "Any harness that speaks MCP over streamable HTTP, or plain REST.",
    mcpEndpoint: "MCP endpoint",
    openapiSpec: "OpenAPI spec",
    restBase: "REST base",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert par Nshipyard. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: {
    explorer: "Explorateur",
    homes: "Logements nets",
    permits: "Délais des permis",
    developers: "Développeurs",
    data: "Données",
    back: "Tous les projets",
  },
  hero: {
    kicker: "Nshipyard Canada · Projet 08",
    title: "Le pipeline de logements de Toronto, normalisé.",
    sub: "L'urbanisme publie un pipeline de développement : chaque grand projet, de la demande à l'occupation, avec les nombres de logements proposés. Voici ce fichier nettoyé, relié aux arrondissements et aux quartiers, avec une taxonomie de statuts normalisée, plus les délais de délivrance des permis de construire tirés de 202 779 permis actifs.",
    cta1: "Explorer les demandes",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "2 391", label: "demandes de développement dans le pipeline officiel, chacune avec un statut normalisé" },
    { value: "124 326", label: "logements dans des projets marqués Construit : les logements nets réellement gagnés" },
    { value: "803 206", label: "logements encore dans le pipeline : proposés ou actifs, pas encore construits" },
    { value: "272", label: "jours médians entre la demande et la délivrance pour un permis de nouveau bâtiment" },
  ],
  explorer: {
    kicker: "Explorateur",
    title: "Trouvez n'importe quelle demande.",
    search: "Rechercher par adresse, numéro de demande ou quartier…",
    status: "Statut",
    allStatuses: "Tous les statuts",
    proposed: "Proposé",
    active: "Actif",
    built: "Construit",
    ward: "Arrondissement",
    allWards: "Tous les arrondissements",
    detail: {
      application: "Demande",
      address: "Adresse",
      status: "Statut",
      units: "Logements proposés",
      ward: "Arrondissement",
      neighbourhood: "Quartier (modèle 158)",
      received: "Date de réception",
      resGfa: "Surface résidentielle (m²)",
      nonresGfa: "Surface non résidentielle (m²)",
      aic: "Centre d'information sur les demandes",
      timeline: "Position dans le pipeline",
    },
    noResult: "Aucune demande ne correspond.",
    empty: "Recherchez ci-dessus, ou filtrez par statut ou arrondissement, pour voir les logements, la chronologie et le quartier d'une demande.",
    results: "résultats",
  },
  homes: {
    kicker: "Vitrine",
    title: "Quels quartiers ont réellement gagné des logements, net ?",
    body: "Le fichier du pipeline liste les logements proposés pour chaque projet. En ne comptant que les projets que la Ville marque Construit, on obtient les logements nets réellement gagnés, par quartier du modèle 158. Tout le reste est encore du pipeline : proposé ou actif, pas encore construit.",
    builtUnits: "logements gagnés (Construit)",
    pipelineUnits: "logements dans le pipeline",
    projects: "projets",
    topTitle: "Le plus de logements gagnés, par quartier",
    mapNote: "Le rouge foncé indique plus de logements construits. 96,2 % des dossiers du pipeline ont été reliés à un quartier.",
    built: "Construit",
    inPipeline: "Dans le pipeline",
  },
  permits: {
    kicker: "Vitrine",
    title: "Combien de temps prend vraiment un permis de construire ?",
    body: "À partir de 202 779 permis de construire actifs, les jours civils entre la demande et la délivrance, par type de permis. Un permis de nouveau bâtiment prend 272 jours en médiane. Un petit projet résidentiel en prend 19. L'écart est l'histoire.",
    medianDays: "jours médians",
    permits: "permis",
    byType: "Délai de délivrance par type de permis",
    byYear: "Permis de nouveau bâtiment : jours médians par année de demande",
    yearNote: "Ce jeu de données est un instantané des permis actifs en octobre 2026. Les années anciennes ne comprennent que les permis encore ouverts, donc les médianes des premières années comportent un biais de survie.",
    type: "Type de permis",
    year: "Année",
    n: "Permis",
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-le depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données normalisées. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    openapi: "Spécification OpenAPI",
  },
  data: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "Versions numérotées, licence MIT. CSV pour les tableurs.",
    files: [
      { name: "pipeline.csv", desc: "2 391 demandes : statut normalisé, logements, arrondissement, quartier du modèle 158" },
      { name: "permit_times.csv", desc: "Jours médians de délivrance par type de permis et année, avec p25/p75" },
      { name: "summary.json", desc: "Totaux, logements par statut, logements construits par quartier, notes de méthodologie" },
    ],
    download: "Télécharger",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Ce que les chiffres signifient, et ce qu'ils ne signifient pas.",
    points: [
      "Source : le jeu de données analytique officiel du pipeline de développement de la Ville de Toronto, récupéré le 8 octobre 2026, relié au fichier des demandes de développement par numéro de demande (96,8 % appariés) pour les coordonnées, puis aux limites de quartiers du modèle 158 (96,2 % appariés).",
      "Taxonomie des statuts : Under Review devient proposé (demande soumise, décision en attente) ; Active devient actif (approuvé ou en construction, pas encore enregistré comme terminé) ; Built devient construit (terminé). Seuls les logements construits comptent comme logements gagnés.",
      "Les nombres de logements sont les logements proposés dans les demandes d'urbanisme, pas des comptes d'occupation finaux. Le pipeline couvre les grands développements nécessitant des approbations en vertu de la Loi sur l'aménagement du territoire ; le développement de plein droit sous le seuil de contrôle des plans d'implantation est exclu.",
      "Les délais des permis viennent du fichier des permis de construire actifs : jours civils entre la date de demande et la date de délivrance. C'est un instantané des permis actifs en octobre 2026, donc les années anciennes ne comprennent que les permis encore ouverts. Les valeurs négatives et celles au-delà de 10 ans ont été exclues comme erreurs de saisie.",
      "La Ville ne publie pas de dates d'achèvement par projet ni de comptes finaux de logements construits dans ces fichiers ; le statut construit est le meilleur indicateur disponible des logements gagnés.",
    ],
  },
  footer: {
    line: "Un projet civique à code source ouvert par Nshipyard. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Sources : Données ouvertes de la Ville de Toronto (pipeline de développement, demandes de développement, permis de construire actifs). Limites de quartiers : le fichier du modèle 158 du projet de concordances géographiques de Nshipyard.",
  },
  mcp: {
    kicker: "Connectez votre agent",
    title: "Exploitez ces données dans vos outils d'IA.",
    body: "Choisissez votre plateforme, copiez l'invite, envoyez-la à votre agent. Votre agent exécute la configuration lui-même.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Autre" },
    cardTitle: "Copiez et envoyez ceci à {tab}",
    copy: "Copier",
    copied: "Copié",
    chatgptNote: "ChatGPT se connecte via l'API REST documentée plutôt que directement en MCP.",
    pChatgpt:
      "Je veux utiliser {displayName} via son API.\n- Spécification OpenAPI : {origin}/api/openapi.json\n- Base REST : {origin}/api/v1\nD'abord, dis-moi en deux phrases ce que cette API offre, puis {exampleLower}, et montre-moi le résultat.",
    pClaude:
      "Dans Claude (claude.ai), ouvre les paramètres, puis Connecteurs, et ajoute un connecteur personnalisé :\n- Nom : {displayName}\n- URL : {origin}/mcp\nEnsuite, liste les outils disponibles, {exampleLower}, et montre-moi le résultat.",
    pClaudeCode:
      "Configure le serveur MCP {displayName} pour que je puisse l'interroger d'ici.\n1. Exécute : claude mcp add --transport http {slug} {origin}/mcp\n2. Exécute `claude mcp list` pour confirmer la connexion.\n3. {example}, et montre-moi le résultat.",
    pCli:
      "# Point de terminaison MCP (HTTP continu)\n{origin}/mcp\n\n# Lister les outils disponibles\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Tout le reste",
    otherBody: "Toute plateforme qui parle MCP en HTTP continu, ou REST tout court.",
    mcpEndpoint: "Point de terminaison MCP",
    openapiSpec: "Spécification OpenAPI",
    restBase: "Base REST",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
