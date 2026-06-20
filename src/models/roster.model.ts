/**
 * MODEL — Roster
 * The Champions allowlist is a list of SLUGS, not National Dex ids.
 *
 * This is the fix for forms: 'raichu' and 'raichu-alola' are different entries;
 * 'venusaur' and 'venusaur-mega' are different entries. A dex-id list collapses
 * every form onto one number — which is why the old filter dropped your forms.
 * With slugs, a duel of Raichu vs Alolan Raichu is just two different slugs.
 *
 * Regulation M-B (valid until 2026-09-02). Extend from Bulbapedia:
 * https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_in_Pokémon_Champions
 * (base + regional forms in one list; Megas are just more slugs.)
 */

import { fetchPokemonBatch, rollShiny } from "./pokemon.model";
import type { Matchup } from "./types";
import rosterData from "./roster.json";

export const CHAMPIONS_ROSTER: readonly string[] = rosterData as readonly string[];

function _twoDistinct<T>(pool: readonly T[]): [T, T] {
  const i = Math.floor(Math.random() * pool.length);
  let j = Math.floor(Math.random() * pool.length);
  while (j === i) j = Math.floor(Math.random() * pool.length);
  return [pool[i], pool[j]];
}

/**
 * Builds one duel. Shiny is rolled PER ENCOUNTER (1/4096 each side) and lives on
 * the Combatant, never on the cached Pokémon — so the same species can show up
 * shiny one round and normal the next.
 */
export async function getRandomMatchup(): Promise<Matchup> {
  const [slugA, slugB] = _twoDistinct(CHAMPIONS_ROSTER);
  const [a, b] = await fetchPokemonBatch([slugA, slugB]);
  return {
    a: { pokemon: a, shiny: rollShiny() },
    b: { pokemon: b, shiny: rollShiny() },
  };
}
