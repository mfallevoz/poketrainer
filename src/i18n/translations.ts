/**
 * I18N — Translations (typed)
 * `en` defines the canonical shape; `fr` is type-checked against it, so a
 * missing or misnamed key won't compile. useTranslations returns the fully
 * typed object — `t.speedGame.title` is a `string`, never `any`.
 */

export type Lang = "en" | "fr";

const en = {
  app: {
    title: "PokéTrainer",
    subtitle: "Master competitive Pokémon",
    tagline: "Train your instincts, one duel at a time.",
    selectGame: "Choose a challenge",
    footer: "Data via PokéAPI · Roster: Pokémon Champions Regulation M-B",
    comingSoon: "Coming soon",
    soon: "Soon",
  },
  nav: { back: "← Back" },
  score: { score: "Score", streak: "Streak", best: "Best" },
  speedGame: {
    title: "Speed Duel",
    desc: "Which Pokémon is faster?",
    instruction: "Tap the fastest Pokémon!",
    statLabel: "Speed",
    correct: "Correct!",
    wrong: "Wrong!",
    next: "Next duel",
    tied: "It's a tie!",
    loading: "Loading Pokémon…",
    tieExplain: (speed: number) =>
      `Speed tie — both ${speed}. Turn order is a 50/50 coin flip.`,
    gapExplain: (tiers: number, gap: number) =>
      `${tiers} tier${tiers > 1 ? "s" : ""} apart (${gap} points).`,
  },
  hpGame: {
    title: "OHKO",
    desc: "Who scores the one-hit KO?",
    instruction: "Tap the tankiest Pokémon!",
    statLabel: "HP",
    correct: "Correct!",
    wrong: "Wrong!",
    next: "Next battle",
    tied: "It's a tie!",
    loading: "Loading Pokémon…",
    tieExplain: (hp: number) => `Same HP (${hp}).`,
    gapExplain: (gap: number) =>
      `${gap} HP apart — raw bulk only; defenses matter too.`,
  },
  typeGame: {
    title: "Type Chart",
    desc: "Which type is super effective?",
    question: (type: string) => `Which type is super effective against ${type}?`,
    hint: "Pick its weakness — ×2 damage",
    pick: "your pick",
    correct: "Super effective!",
    wrong: "Not very effective…",
    answerPrefix: "Answer:",
    next: "Next question",
    loading: "Loading…",
  },
};

export type Translations = typeof en;

const fr: Translations = {
  app: {
    title: "PokéTrainer",
    subtitle: "Maîtrise le Pokémon compétitif",
    tagline: "Entraîne tes réflexes, un duel à la fois.",
    selectGame: "Choisis un défi",
    footer: "Données via PokéAPI · Roster : Pokémon Champions Règlement M-B",
    comingSoon: "Bientôt disponible",
    soon: "Bientôt",
  },
  nav: { back: "← Retour" },
  score: { score: "Score", streak: "Série", best: "Meilleur" },
  speedGame: {
    title: "Duel de Vitesse",
    desc: "Quel Pokémon est le plus rapide ?",
    instruction: "Clique sur le plus rapide !",
    statLabel: "Vitesse",
    correct: "Correct !",
    wrong: "Raté !",
    next: "Prochain duel",
    tied: "Égalité !",
    loading: "Chargement…",
    tieExplain: (speed: number) =>
      `Égalité de vitesse — ${speed} des deux côtés. L'ordre se joue à pile ou face (50/50).`,
    gapExplain: (tiers: number, gap: number) =>
      `${tiers} palier${tiers > 1 ? "s" : ""} d'écart (${gap} points).`,
  },
  hpGame: {
    title: "OHKO",
    desc: "Qui met KO en un coup ?",
    instruction: "Clique sur le plus solide !",
    statLabel: "PV",
    correct: "Correct !",
    wrong: "Raté !",
    next: "Prochain combat",
    tied: "Égalité !",
    loading: "Chargement…",
    tieExplain: (hp: number) => `Mêmes PV (${hp}).`,
    gapExplain: (gap: number) =>
      `${gap} PV d'écart — c'est la masse brute ; les défenses comptent aussi.`,
  },
  typeGame: {
    title: "Tableau des Types",
    desc: "Quel type est super efficace ?",
    question: (type: string) => `Quel type est super efficace contre ${type} ?`,
    hint: "Trouve sa faiblesse — dégâts ×2",
    pick: "ton choix",
    correct: "Super efficace !",
    wrong: "Pas très efficace…",
    answerPrefix: "Réponse :",
    next: "Question suivante",
    loading: "Chargement…",
  },
};

const translations: Record<Lang, Translations> = { en, fr };

export function useTranslations(lang: Lang): Translations {
  return translations[lang] ?? translations.en;
}

export default translations;