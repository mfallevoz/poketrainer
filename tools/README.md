# tools/ — roster.json generator

Regenerates [`src/models/roster.json`](../src/models/roster.json) — the list of
PokéAPI slugs for the Pokémon legal in the current Pokémon Champions regulation.

It exists because the *legality* list (which Pokémon are in the regulation) is
not in the PokéAPI — it lives in the game, mirrored on
[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_in_Pok%C3%A9mon_Champions).
This script pulls that list, turns each entry into a PokéAPI slug, **validates
every slug against the PokéAPI**, and writes the file in a deterministic order.

## Requirements

- **Node 18+** only (uses the built-in `fetch`). Check with `node -v`.
- No dependencies, no build step, no `tsx`.

## Run

```bash
node tools/generate-roster.mjs            # fetch → validate → write roster.json
node tools/generate-roster.mjs --check    # dry-run; exits 1 if the file is stale (good for CI)
node tools/generate-roster.mjs --dump     # also save the raw Bulbapedia HTML to tools/.cache/
```

Optional — add to `package.json`:

```json
"scripts": { "gen:roster": "node tools/generate-roster.mjs" }
```

then `npm run gen:roster`.

## How it works

```
Bulbapedia (MediaWiki API)
  → extract species + form labels
  → map to PokéAPI slugs (rules + special-form table + OVERRIDES)
  → validate each slug (GET /pokemon/{slug} must return 200)
  → sort: non-megas first, then megas; each by national-dex, then form id
  → diff vs current roster.json, then write
```

The run prints a summary and an **added / removed** diff. On a healthy run for the
*current* regulation it should report `no change`.

## When it fails (by design)

If any entry can't be resolved to a real PokéAPI slug, the script **exits 1** and
lists the offending labels — nothing is written. This is intentional: a silent gap
must never ship. To fix:

1. Find the correct PokéAPI slug (e.g. on https://pokeapi.co/api/v2/pokemon/).
2. Add it to `OVERRIDES` at the top of `generate-roster.mjs`
   (`"<Bulbapedia label>": "<slug>"`), or extend `SPECIES_RULES` for a whole
   species with multiple forms.
3. Re-run.

## Updating for a new regulation

Usually nothing — just re-run; the new roster is pulled automatically. Only touch
the script if:

- Bulbapedia renames the page → update `PAGE`.
- A brand-new special form appears that the rules don't cover → the run fails and
  tells you exactly which label to add to `OVERRIDES`.

## If the parse looks wrong

`extractEntries()` is the one part that depends on Bulbapedia's table layout. If
the printed counts look off (e.g. far fewer than ~240), run with `--dump` and
inspect `tools/.cache/bulbapedia.html` — the matching there may need a small tweak.

> Note: set a real contact in `USER_AGENT` (top of the script). Bulbapedia's
> Cloudflare rejects blank/default user agents with a 403.
