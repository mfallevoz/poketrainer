/**
 * MODEL — shared types
 */

export const TYPE_NAMES = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
  "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
  "steel", "fairy",
] as const;

export type TypeName = (typeof TYPE_NAMES)[number];

export interface Pokemon {
  /** PokéAPI numeric id. Alternate forms are ≥ 10000 (raichu-alola = 10100). */
  id: number;
  /** PokéAPI resource slug — the real key. 'raichu' ≠ 'raichu-alola'. */
  slug: string;
  /** Raw API name (== slug). */
  name: string;
  /** Localized species names from /pokemon-species (e.g. fr "Dracaufeu"). */
  names: { en: string; fr: string };
  /** Form token derived from the slug: "" | "mega" | "mega-x" | "alola" | … */
  form: string;
  speed: number;
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  types: TypeName[];
  sprite: string;
  spriteShiny: string;
}

export interface Combatant {
  pokemon: Pokemon;
  shiny: boolean;
}

export interface Matchup {
  a: Combatant;
  b: Combatant;
}
