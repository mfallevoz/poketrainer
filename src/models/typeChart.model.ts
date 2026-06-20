/**
 * MODEL — Type Chart (Gen IX)  ·  supersedes the earlier version (adds getWrongOptions)
 * Record<TypeName, …> forces all 18 keys to be present — leave one out and it
 * won't compile.
 */

import { TYPE_NAMES, type TypeName } from "./types";

/** Types that deal super-effective (2×) damage TO each defending type. */
export const TYPE_CHART: Record<TypeName, TypeName[]> = {
  normal: ["fighting"],
  fire: ["water", "ground", "rock"],
  water: ["electric", "grass"],
  electric: ["ground"],
  grass: ["fire", "ice", "poison", "flying", "bug"],
  ice: ["fire", "fighting", "rock", "steel"],
  fighting: ["flying", "psychic", "fairy"],
  poison: ["ground", "psychic"],
  ground: ["water", "grass", "ice"],
  flying: ["electric", "ice", "rock"],
  psychic: ["bug", "ghost", "dark"],
  bug: ["fire", "flying", "rock"],
  rock: ["water", "grass", "fighting", "ground", "steel"],
  ghost: ["ghost", "dark"],
  dragon: ["ice", "dragon", "fairy"],
  dark: ["fighting", "bug", "fairy"],
  steel: ["fire", "fighting", "ground"],
  fairy: ["poison", "steel"],
};

export const TYPE_COLORS: Record<TypeName, string> = {
  normal: "#9BA0AA", fire: "#FF7C44", water: "#5DB0F0", electric: "#F8D030",
  grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
  ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
  rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
  steel: "#B7B7CE", fairy: "#D685AD",
};

export const getWeaknesses = (t: TypeName): TypeName[] => TYPE_CHART[t] ?? [];

/** `count` random types that are NOT super-effective against `defender`. */
export function getWrongOptions(defender: TypeName, count = 3): TypeName[] {
  const weak = getWeaknesses(defender);
  const pool = TYPE_NAMES.filter((t) => !weak.includes(t));
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Localized type names (official FR). 18 fixed values — cheaper as a static map
 * than 18 /type/{name} calls. Index with the active Lang: TYPE_LABELS[t][lang].
 */
export const TYPE_LABELS: Record<TypeName, { en: string; fr: string }> = {
  normal:   { en: "Normal",   fr: "Normal" },
  fire:     { en: "Fire",     fr: "Feu" },
  water:    { en: "Water",    fr: "Eau" },
  electric: { en: "Electric", fr: "Électrik" },
  grass:    { en: "Grass",    fr: "Plante" },
  ice:      { en: "Ice",      fr: "Glace" },
  fighting: { en: "Fighting", fr: "Combat" },
  poison:   { en: "Poison",   fr: "Poison" },
  ground:   { en: "Ground",   fr: "Sol" },
  flying:   { en: "Flying",   fr: "Vol" },
  psychic:  { en: "Psychic",  fr: "Psy" },
  bug:      { en: "Bug",      fr: "Insecte" },
  rock:     { en: "Rock",     fr: "Roche" },
  ghost:    { en: "Ghost",    fr: "Spectre" },
  dragon:   { en: "Dragon",   fr: "Dragon" },
  dark:     { en: "Dark",     fr: "Ténèbres" },
  steel:    { en: "Steel",    fr: "Acier" },
  fairy:    { en: "Fairy",    fr: "Fée" },
};

/**
 * HOME / SV-style type symbol icon (community set, SVG).
 * NOTE: these are WHITE silhouettes on transparent bg — render them on a
 * colored disc (e.g. TYPE_COLORS[type]) or they vanish on light surfaces.
 * Default: duiker101/pokemon-type-svg-icons (confirmed `icons/{type}.svg`).
 * For the closer-to-HOME recreation, swap the base to:
 *   https://cdn.jsdelivr.net/gh/partywhale/pokemon-type-icons@main/icons/${type}.svg
 * (verify partywhale's exact path/branch before switching).
 */
export const typeIconUrl = (type: TypeName): string =>
  `https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons@master/icons/${type}.svg`;
