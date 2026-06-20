#!/usr/bin/env node
// @ts-check
/**
 * tools/generate-roster.mjs
 * ------------------------------------------------------------------------
 * Regenerates `src/models/roster.json` (the Champions allowlist of PokéAPI
 * slugs) from Bulbapedia's "List of Pokémon in Pokémon Champions" page.
 *
 * Pipeline:
 *   Bulbapedia (MediaWiki API)  →  parse names/forms
 *   →  map to PokéAPI slugs  →  validate every slug against PokéAPI
 *   →  deterministic sort  →  diff vs current roster.json  →  write
 *
 * Design notes:
 *   - SEMI-AUTO: the list is pulled automatically, but any name the mapper
 *     can't resolve to a real PokéAPI slug FAILS the run (exit 1) with a clear
 *     message. The maintainer adds an entry to OVERRIDES and re-runs. The build
 *     never ships a silent gap.
 *   - Zero dependencies. Node 18+ only (global fetch). Run with `node`, no tsx.
 *
 * Usage:
 *   node tools/generate-roster.mjs            # fetch, validate, write
 *   node tools/generate-roster.mjs --check    # dry-run; exit 1 if it WOULD change
 *   node tools/generate-roster.mjs --dump     # also save the raw Bulbapedia HTML
 *
 * Updating for a new regulation: usually nothing — just re-run. If Bulbapedia
 * renames the page, edit PAGE below. If a new special form appears, the run
 * fails and tells you exactly which name to add to OVERRIDES.
 * ------------------------------------------------------------------------
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// ---- Config -------------------------------------------------------------

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/models/roster.json");

const BULBA_API = "https://bulbapedia.bulbagarden.net/w/api.php";
const PAGE = "List of Pokémon in Pokémon Champions";
const POKEAPI = "https://pokeapi.co/api/v2/pokemon";

// Bulbapedia/Cloudflare reject blank user agents — keep this descriptive.
// TODO: drop in a real contact (repo URL or email) before sharing widely.
const USER_AGENT = "PokeTrainer-RosterGen/1.0 (roster.json generator; contact: you@example.com)";

const POKEAPI_CONCURRENCY = 12;

// Escape hatch for entries the rules below can't resolve. Key is "Species|Suffix"
// (the sprite filename suffix, e.g. "Mega_X" / "Alola"; empty for base forms),
// value is the exact PokéAPI slug. The run prints "Species [Suffix]" if unresolved.
/** @type {Record<string,string>} */
const OVERRIDES = {
  // "Tauros|Some_Odd_Breed": "tauros-...",
};

// Irregular species names → base slug (everything else is normalized generically).
/** @type {Record<string,string>} */
const SPECIAL_NAMES = {
  "nidoran♀": "nidoran-f", "nidoran♂": "nidoran-m",
  "farfetch'd": "farfetchd", "sirfetch'd": "sirfetchd",
  "mr. mime": "mr-mime", "mr. rime": "mr-rime", "mime jr.": "mime-jr",
  "type: null": "type-null", "flabébé": "flabebe", "ho-oh": "ho-oh",
  "porygon-z": "porygon-z", "kommo-o": "kommo-o", "hakamo-o": "hakamo-o",
  "jangmo-o": "jangmo-o", "tapu koko": "tapu-koko", "tapu lele": "tapu-lele",
  "tapu bulu": "tapu-bulu", "tapu fini": "tapu-fini",
};

// Species whose Champions entry is always a specific non-default form, or whose
// alt forms need per-entry resolution from the label. Each returns the FULL slug.
/** @type {Record<string,(label:string)=>string|null>} */
const SPECIES_RULES = {
  aegislash: () => "aegislash-blade",
  mimikyu: () => "mimikyu-disguised",
  gourgeist: () => "gourgeist-average",
  pyroar: () => "pyroar-male",
  meowstic: (l) => (/female|♀/i.test(l) ? "meowstic-female" : "meowstic-male"),
  lycanroc: (l) =>
    /midnight/i.test(l) ? "lycanroc-midnight" :
    /dusk/i.test(l)     ? "lycanroc-dusk" :
                          "lycanroc-midday",
  rotom: (l) =>
    /heat/i.test(l)  ? "rotom-heat" :
    /wash/i.test(l)  ? "rotom-wash" :
    /frost/i.test(l) ? "rotom-frost" :
    /fan/i.test(l)   ? "rotom-fan" :
    /mow/i.test(l)   ? "rotom-mow" :
                       "rotom",
  tauros: (l) => {
    if (/aqua/i.test(l))   return "tauros-paldea-aqua-breed";
    if (/blaze/i.test(l))  return "tauros-paldea-blaze-breed";
    if (/combat/i.test(l)) return "tauros-paldea-combat-breed";
    return "tauros"; // Kantonian (empty form label)
  },
};

// Species whose default (and only Champions-legal) form needs an explicit suffix
// on PokéAPI — the bare species name 404s. Applied as a fallback when no mega /
// regional form was detected.
/** @type {Record<string,string>} */
const DEFAULT_FORMS = {
  basculegion: "basculegion-male",
  morpeko: "morpeko-full-belly",
  maushold: "maushold-family-of-four",
  palafin: "palafin-zero",
  zygarde: "zygarde-50",
  tatsugiri: "tatsugiri-curly",
};

// ---- Bulbapedia fetch + extraction -------------------------------------

async function fetchBulbapediaHTML() {
  const url = new URL(BULBA_API);
  url.search = new URLSearchParams({
    action: "parse", page: PAGE, prop: "text",
    formatversion: "2", format: "json", redirects: "1",
  }).toString();

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept": "application/json" } });
  if (!res.ok) {
    throw new Error(
      `Bulbapedia API ${res.status}. If 403, set a descriptive USER_AGENT (Cloudflare blocks blank/default ones).`
    );
  }
  const data = await res.json();
  const html = data?.parse?.text;
  if (typeof html !== "string") throw new Error("Unexpected API shape — no parse.text. Check the PAGE title.");
  return html;
}

const stripTags = (s) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const decodeEntities = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
   .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/**
 * Extract { species, suffix } for every roster row. Each row pairs a menu sprite
 * (whose filename suffix encodes the form) with the species link in the next cell:
 *   <img alt="Raichu" src=".../Menu_CP_0026-Alola.png"> … </th> <td><a href="/wiki/Raichu_(Pokémon)">
 * Anchoring on the sprite catches EVERY row — base forms included, which the name-
 * cell <small> approach missed (base rows don't always carry a <small>). The
 * trailing </th><td><a …(Pokémon)> keeps us on real roster rows; gallery / navbox
 * sprites (Vivillon patterns, Furfrou trims, Alcremie creams…) don't have it.
 *
 * @param {string} html
 * @returns {{species:string,suffix:string}[]}
 */
function extractEntries(html) {
  /** @type {{species:string,suffix:string}[]} */
  const out = [];
  const re = /Menu_CP_\d+(-[^."]*)?\.png[^>]*>[\s\S]*?<\/th>\s*<td\b[^>]*>\s*<a href="\/wiki\/([^"#]+?_\(Pok[^"]*?\))"/g;
  for (const m of html.matchAll(re)) {
    const suffix = m[1] ? m[1].slice(1) : ""; // "Mega_X", "Alola", "Paldea_Combat", …
    const species = decodeEntities(decodeURIComponent(m[2]))
      .replace(/_/g, " ")
      .replace(/\s*\(Pok[ée]mon\)\s*$/i, "")
      .trim();
    out.push({ species, suffix });
  }
  return out;
}

// ---- Name → slug --------------------------------------------------------

function baseSlug(species) {
  const key = species.toLowerCase();
  if (SPECIAL_NAMES[key]) return SPECIAL_NAMES[key];
  return key
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // é → e
    .replace(/['.:]/g, "")
    .replace(/[♀]/g, "-f").replace(/[♂]/g, "-m")
    .replace(/\s+/g, "-");
}

/** @returns {string} a PokéAPI slug from the species + its sprite form suffix. */
function deriveSlug(species, suffix) {
  const s = (suffix || "").trim(); // "Mega_X", "Alola", "Paldea_Combat", "" (base)…
  const base = baseSlug(species);
  if (OVERRIDES[`${species}|${s}`]) return OVERRIDES[`${species}|${s}`];

  const rule = SPECIES_RULES[base];
  if (rule) return rule(s);

  if (!s) return DEFAULT_FORMS[base] ?? base; // base form (sprite has no suffix)

  if (/mega/i.test(s)) {
    if (/x/i.test(s)) return `${base}-mega-x`;
    if (/y/i.test(s)) return `${base}-mega-y`;
    return `${base}-mega`;
  }
  if (/alola/i.test(s))  return `${base}-alola`;
  if (/galar/i.test(s))  return `${base}-galar`;
  if (/hisui/i.test(s))  return `${base}-hisui`;
  if (/paldea/i.test(s)) return `${base}-paldea`;

  // Unknown suffix → fall back to base (or the species' default form). Anything
  // mishandled surfaces in the validation + diff.
  return DEFAULT_FORMS[base] ?? base;
}

// ---- PokéAPI validation -------------------------------------------------

/** @returns {Promise<{ok:boolean, id?:number, dex?:number}>} */
async function checkSlug(slug) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${POKEAPI}/${slug}`, { headers: { "Accept": "application/json" } });
      if (res.status === 404) return { ok: false };
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const dex = Number(String(data?.species?.url || "").match(/\/pokemon-species\/(\d+)\//)?.[1] ?? 0);
      return { ok: true, id: data.id, dex };
    } catch {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return { ok: false };
}

/** Validate slugs with bounded concurrency. */
async function validateAll(slugs) {
  const meta = new Map();
  const invalid = [];
  let i = 0;
  async function worker() {
    while (i < slugs.length) {
      const slug = slugs[i++];
      const r = await checkSlug(slug);
      if (r.ok) meta.set(slug, { id: r.id, dex: r.dex });
      else invalid.push(slug);
    }
  }
  await Promise.all(Array.from({ length: POKEAPI_CONCURRENCY }, worker));
  return { meta, invalid };
}

// ---- Main ---------------------------------------------------------------

async function main() {
  const args = new Set(process.argv.slice(2));
  const dump = args.has("--dump");
  const checkOnly = args.has("--check");

  console.log(`→ Fetching "${PAGE}" from Bulbapedia…`);
  const html = await fetchBulbapediaHTML();
  if (dump) {
    await mkdir(resolve(ROOT, "tools/.cache"), { recursive: true });
    await writeFile(resolve(ROOT, "tools/.cache/bulbapedia.html"), html, "utf8");
    console.log("  dumped raw HTML → tools/.cache/bulbapedia.html");
  }

  const entries = extractEntries(html);
  console.log(`→ Found ${entries.length} roster rows.`);

  // Derive slugs, dedup, separate any that couldn't be mapped at all.
  const slugSet = new Set();
  const unmapped = [];
  for (const e of entries) {
    const slug = deriveSlug(e.species, e.suffix);
    if (!slug) unmapped.push(`${e.species} [${e.suffix}]`);
    else slugSet.add(slug);
  }
  const slugs = [...slugSet];
  console.log(`→ Derived ${slugs.length} unique slugs.`);

  console.log(`→ Validating against PokéAPI…`);
  const { meta, invalid } = await validateAll(slugs);

  // Auto-heal: a stray base-species link sitting under a "Mega"/regional heading
  // can produce an invalid form slug (e.g. raichu-mega, charizard-mega). Demote
  // any invalid *form* slug to its base species; if that base is itself legal,
  // the form was a phantom — drop it. Only genuinely unresolvable names fail.
  const stripForm = (s) => s.replace(/-(mega-x|mega-y|mega|alola|galar|hisui|paldea)$/, "");
  const healed = [];
  const hardFail = [...unmapped];
  if (invalid.length) {
    const bases = [...new Set(invalid.map(stripForm))].filter((b) => b && !meta.has(b));
    if (bases.length) {
      const extra = await validateAll(bases);
      for (const [s, m] of extra.meta) meta.set(s, m);
    }
    for (const s of invalid) {
      const b = stripForm(s);
      if (b !== s && meta.has(b)) healed.push(`${s}→${b}`);
      else hardFail.push(s);
    }
  }
  if (healed.length) console.log(`  healed ${healed.length} phantom form(s): ${healed.join(", ")}`);

  if (hardFail.length) {
    const f = [...new Set(hardFail)];
    console.error(`\n✖ ${f.length} entr${f.length > 1 ? "ies" : "y"} could not be resolved to a valid PokéAPI slug:`);
    for (const x of f) console.error(`   - ${x}`);
    console.error(`\nAdd it to DEFAULT_FORMS (default-form species) or OVERRIDES (key = Bulbapedia label),`);
    console.error(`then re-run. The build fails on purpose so nothing ships with a gap.\n`);
    process.exit(1);
  }

  // Deterministic order: non-megas first, then megas; each by species dex, then form id.
  const isMega = (s) => /-mega(-[xy])?$/.test(s);
  const sorted = [...meta.keys()].sort((a, b) => {
    const ma = isMega(a), mb = isMega(b);
    if (ma !== mb) return ma ? 1 : -1;
    const A = meta.get(a), B = meta.get(b);
    return A.dex - B.dex || A.id - B.id || a.localeCompare(b);
  });

  // Diff against the current roster (set-based, so it's independent of file formatting).
  let current = [];
  try { current = JSON.parse(await readFile(OUT, "utf8")); } catch { /* first run */ }
  const cur = new Set(current);
  const next = new Set(sorted);
  const added = sorted.filter((s) => !cur.has(s));
  const removed = current.filter((s) => !next.has(s));

  console.log(`\n— Roster: ${sorted.length} slugs (was ${current.length})`);
  if (added.length)   console.log(`  + added (${added.length}): ${added.join(", ")}`);
  if (removed.length) console.log(`  - removed (${removed.length}): ${removed.join(", ")}`);
  if (!added.length && !removed.length) console.log(`  no change.`);

  if (checkOnly) {
    if (added.length || removed.length) { console.error("\n--check: roster.json is out of date."); process.exit(1); }
    return;
  }

  await writeFile(OUT, JSON.stringify(sorted, null, 2) + "\n", "utf8");
  console.log(`\n✓ Wrote ${OUT}`);
}

main().catch((err) => { console.error("\n✖", err.message); process.exit(1); });
