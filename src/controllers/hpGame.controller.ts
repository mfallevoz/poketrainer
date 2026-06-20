/**
 * CONTROLLER — HP game
 * Twin of useSpeedGame: pick A, pick B, or call a TIE. Compares base HP.
 * (Raw HP is only a proxy for bulk — real bulk also depends on the defenses.)
 *
 * Rounds auto-advance: answer → result (REVEAL_MS) → resetting fade → next round.
 */

import { useState, useEffect, useCallback } from "react";
import { getRandomMatchup } from "../models/roster.model";
import type { Matchup } from "../models/types";

export const HP_MAX = 255;

const REVEAL_MS = 1300;
const RESET_MS = 420;

export type Choice = "a" | "b" | "tie";

export interface HPGameState {
  matchup: Matchup | null;
  loading: boolean;
  choice: Choice | null;
  revealed: boolean;
  resetting: boolean;
  truth: Choice | null;
  correct: boolean | null;
  score: number;
  streak: number;
}

function _truth(m: Matchup): Choice {
  const a = m.a.pokemon.hp;
  const b = m.b.pokemon.hp;
  if (a === b) return "tie";
  return a > b ? "a" : "b";
}

export function useHPGame() {
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setChoice(null);
    setRevealed(false);
    setResetting(false);
    setMatchup(await getRandomMatchup());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!revealed) return;
    const id = setTimeout(() => { setResetting(true); }, REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (!resetting) return;
    const id = setTimeout(() => { void load(); }, RESET_MS);
    return () => clearTimeout(id);
  }, [resetting, load]);

  const truth = matchup ? _truth(matchup) : null;
  const correct =
    revealed && choice !== null && truth !== null ? choice === truth : null;

  const select = useCallback((c: Choice) => {
    if (revealed || resetting || !matchup) return;
    setChoice(c);
    setRevealed(true);
    if (c === _truth(matchup)) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [revealed, resetting, matchup]);

  return {
    state: { matchup, loading, choice, revealed, resetting, truth, correct, score, streak } as HPGameState,
    actions: { select },
  };
}