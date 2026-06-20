# PokéTrainer

Gamified Pokémon strategy learning app, built around the **Pokémon Champions** roster (Regulation M-B, valid through 2 Sept 2026).

Three mini-games that drill competitive mechanics — speed tiers, type matchups, OHKO thresholds — in a mobile-first, dark minimal-luxury UI.

---

## Mini-games

| Game | Status | What it tests |
|---|---|---|
| **Speed Duel** | ✅ Active | Which Pokémon outspeeds the other? |
| **OHKO** | 🔒 Coming soon | Which Pokémon knocks the other out in one hit? |
| **Type Chart** | ✅ Active | Which type is super effective? |

---

## Architecture — MVC

```
src/
├── App.tsx                           Root router — lang, activeGame, COMING_SOON guard, toast
├── main.tsx                          Vite entry point
│
├── styles/
│   └── tokens.css                   Design tokens, Liquid Glass classes, hover (desktop), toast
│
├── i18n/
│   └── translations.ts              All UI strings — EN + FR; type-safe (Translations = typeof en)
│
├── models/                           ── MODEL LAYER ──────────────────────
│   ├── types.ts                      Shared types: Pokemon, Matchup, Lang…
│   ├── pokemon.model.ts              fetchPokemon(), localizedName(), SHINY_RATE = 1/4096
│   ├── roster.model.ts               CHAMPIONS_ROSTER (Reg. M-B slugs) + getRandomMatchup()
│   └── typeChart.model.ts            Gen 9 matchup table, TYPE_LABELS (FR official), TYPE_COLORS
│
├── controllers/                      ── CONTROLLER LAYER ─────────────────
│   ├── speedGame.controller.ts       useSpeedGame() — SPEED_MAX 180, SPEED_STEP 10
│   ├── hpGame.controller.ts          useHPGame()    — HP_MAX 255 (OHKO screen, currently unreachable)
│   └── typeGame.controller.ts        useTypeGame()
│                                     All three: REVEAL_MS 1300, RESET_MS 420, auto-advance
│
└── views/                            ── VIEW LAYER ───────────────────────
    ├── components/
    │   ├── AppHeader.tsx             Title + EN/FR language toggle (iOS-style sliding bubble)
    │   ├── GlassMenu.tsx             Persistent bottom nav — Liquid Glass, single-tap, 4 tabs
    │   ├── CountUp.tsx               Animated number counter (rAF, easeOutCubic, reduced-motion)
    │   ├── SpeedTierBar.tsx          18-cell staggered fill bar
    │   ├── StatBar.tsx               Horizontal animated stat bar
    │   ├── ScoreBar.tsx              Score + streak counters
    │   └── TypeBadge.tsx             Type icon on coloured disc (HOME style)
    └── screens/
        ├── HomeScreen.tsx            Game picker, vertically centred
        ├── SpeedGameScreen.tsx       Speed Duel UI
        ├── HPGameScreen.tsx          OHKO UI (unreachable while COMING_SOON includes "hp")
        └── TypeGameScreen.tsx        Type Chart Quiz UI
```

### Data flow

```
User tap
  └─▶ View (Screen) calls action from controller hook
        └─▶ Controller updates state + calls Model if needed
              └─▶ Model fetches PokéAPI / returns cached data
                    └─▶ Controller derives new state
                          └─▶ View re-renders
```

### Layer rules

| Layer | Can import from | Cannot import from |
|---|---|---|
| models | nothing | controllers, views |
| controllers | models only | views |
| views | controllers + models | — |
| App.tsx | views/screens only | models, controllers |
| i18n | nothing | everything else |

---

## Key design decisions

- **Pokémon forms are first-class** — `raichu-alola`, `charizard-mega-x`, etc. each have their own slot in the roster.
- **Sprites** — `sprites.other.home.front_default` / `front_shiny` (HOME style). Shiny triggered at 1/4096 per encounter.
- **Localised names** — species name via `/pokemon-species/{id}` → `names[]` field; form suffix via a static FR map (Méga-X, d'Alola…).
- **Type icons** — PokéAPI has no HOME-style type symbols; white silhouettes from `duiker101/pokemon-type-svg-icons` (jsDelivr) on a coloured disc (`TYPE_COLORS`).
- **Hover only on desktop** — all hover effects live inside `@media (hover: hover) and (pointer: fine)`, zero mobile side-effects.
- **Enabling OHKO** — one line in `App.tsx`: remove `"hp"` from `COMING_SOON`.

---

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the build locally
```

## Deploy to Vercel

Import the GitHub repo on [vercel.com](https://vercel.com) — Vite is auto-detected.

| Setting | Value |
|---|---|
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

No environment variables required (PokéAPI is public and unauthenticated).

---

## Adding a new mini-game

1. **Model** — add data constants to `models/` (or reuse existing ones)
2. **Controller** — create `controllers/myGame.controller.ts` exporting `useMyGame()`
3. **View** — create `views/screens/MyGameScreen.tsx`, import the hook
4. **i18n** — add `myGame: { title, desc, … }` to both `en` and `fr` in `translations.ts`
5. **Router** — add the `GameId` to `App.tsx` and a card to `HomeScreen.tsx`
6. **Unlock** — remove the `GameId` from `COMING_SOON` in `App.tsx` when ready

---

## Data sources

- Pokémon stats & sprites — [PokéAPI](https://pokeapi.co/) (free, open)
- Type icons — [duiker101/pokemon-type-svg-icons](https://github.com/duiker101/pokemon-type-svg-icons) via jsDelivr
- Champions roster — [Bulbapedia — Pokémon in Pokémon Champions](https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_in_Pok%C3%A9mon_Champions)
- Type chart — Generation IX official data (Scarlet / Violet)