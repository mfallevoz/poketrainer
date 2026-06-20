/**
 * MODEL — Pokémon
 * Fetches by SLUG (not Dex id) so forms are first-class. Reads HOME sprites
 * (normal + shiny) straight from the payload, with graceful fallbacks.
 * Also pulls localized species names from /pokemon-species (cached separately),
 * so the UI can show "Dracaufeu" / "Charizard" depending on language.
 */

import type { Pokemon, TypeName } from "./types";
import type { Lang } from "../i18n/translations";

const BASE_URL = "https://pokeapi.co/api/v2";
const _cache = new Map<string, Pokemon>();
const _speciesNames = new Map<string, { en: string; fr: string }>();

/** 1/4096 — the modern (Gen VI+) full-odds shiny rate. A little wink. */
export const SHINY_RATE = 1 / 4096;
export const rollShiny = (): boolean => Math.random() < SHINY_RATE;

function _stat(raw: any, name: string): number {
  return raw.stats.find((s: any) => s.stat.name === name)?.base_stat ?? 0;
}

/**
 * Localized base-species names. One /pokemon-species call per species,
 * cached — all forms of a species (mega/regional) reuse the same entry.
 */
async function _speciesLocalizedNames(
  species: string,
): Promise<{ en: string; fr: string }> {
  const cached = _speciesNames.get(species);
  if (cached) return cached;

  let names = { en: species, fr: species };
  try {
    const res = await fetch(`${BASE_URL}/pokemon-species/${species}`);
    if (res.ok) {
      const data = await res.json();
      const pick = (l: string): string | undefined =>
        data.names.find((n: any) => n.language?.name === l)?.name;
      const en = pick("en") ?? species;
      names = { en, fr: pick("fr") ?? en };
    }
  } catch {
    /* keep slug fallback on network error */
  }
  _speciesNames.set(species, names);
  return names;
}

function _fromRaw(
  raw: any,
  names: { en: string; fr: string },
  form: string,
): Pokemon {
  const other = raw.sprites.other ?? {};
  const home = other.home ?? {};
  const art = other["official-artwork"] ?? {};

  // HOME first (what you asked for), then official artwork, then the base sprite.
  const sprite =
    home.front_default ?? art.front_default ?? raw.sprites.front_default;
  const spriteShiny =
    home.front_shiny ?? art.front_shiny ?? raw.sprites.front_shiny ?? sprite;

  return {
    id: raw.id,
    slug: raw.name,
    name: raw.name,
    names,
    form,
    speed: _stat(raw, "speed"),
    hp: _stat(raw, "hp"),
    attack: _stat(raw, "attack"),
    defense: _stat(raw, "defense"),
    spAtk: _stat(raw, "special-attack"),
    spDef: _stat(raw, "special-defense"),
    types: raw.types.map((t: any) => t.type.name as TypeName),
    sprite,
    spriteShiny,
  };
}

/** Fetch one Pokémon OR form by its PokéAPI slug. Cached for the session. */
export async function fetchPokemon(slug: string): Promise<Pokemon> {
  const cached = _cache.get(slug);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/pokemon/${slug}`);
  if (!res.ok) throw new Error(`PokéAPI ${res.status} for "${slug}"`);
  const raw = await res.json();

  // species drives the localized base name; the leftover slug part is the form.
  const species: string = raw.species?.name ?? slug;
  const names = await _speciesLocalizedNames(species);
  const form = slug.startsWith(`${species}-`)
    ? slug.slice(species.length + 1)
    : "";

  const pokemon = _fromRaw(raw, names, form);
  _cache.set(slug, pokemon);
  return pokemon;
}

export function fetchPokemonBatch(slugs: string[]): Promise<Pokemon[]> {
  return Promise.all(slugs.map(fetchPokemon));
}

/**
 * Localized form suffixes. The species name comes from the API (per language);
 * only the form wrapper is static (these few tokens are stable & finite).
 */
const FORM_LABEL: Record<string, Record<Lang, (n: string) => string>> = {
  "mega":   { en: (n) => `Mega ${n}`,     fr: (n) => `Méga-${n}` },
  "mega-x": { en: (n) => `Mega ${n} X`,   fr: (n) => `Méga-${n} X` },
  "mega-y": { en: (n) => `Mega ${n} Y`,   fr: (n) => `Méga-${n} Y` },
  "alola":  { en: (n) => `Alolan ${n}`,   fr: (n) => `${n} d'Alola` },
  "galar":  { en: (n) => `Galarian ${n}`, fr: (n) => `${n} de Galar` },
  "hisui":  { en: (n) => `Hisuian ${n}`,  fr: (n) => `${n} de Hisui` },
  "paldea": { en: (n) => `Paldean ${n}`,  fr: (n) => `${n} de Paldea` },
};

/**
 * Localized display name.
 *   ("venusaur-mega",   "fr") → "Méga-Florizarre"
 *   ("raichu-alola",    "fr") → "Raichu d'Alola"
 *   ("charizard-mega-x","en") → "Mega Charizard X"
 */
export function localizedName(p: Pokemon, lang: Lang): string {
  const base = p.names[lang] || p.names.en;
  const fn = FORM_LABEL[p.form]?.[lang];
  return fn ? fn(base) : base;
}

/**
 * Legacy English-only formatter from a bare slug. Kept for components that
 * don't yet receive a `lang` (e.g. PokemonCard). Prefer localizedName().
 */
export function formatPokemonName(slug: string): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const FORM: Record<string, (base: string) => string> = {
    "mega": (b) => `Mega ${b}`,
    "mega-x": (b) => `Mega ${b} X`,
    "mega-y": (b) => `Mega ${b} Y`,
    "alola": (b) => `${b} (Alola)`,
    "galar": (b) => `${b} (Galar)`,
    "hisui": (b) => `${b} (Hisui)`,
    "paldea": (b) => `${b} (Paldea)`,
  };
  const [base, ...rest] = slug.split("-");
  const label = FORM[rest.join("-")];
  return label ? label(cap(base)) : slug.split("-").map(cap).join(" ");
}
