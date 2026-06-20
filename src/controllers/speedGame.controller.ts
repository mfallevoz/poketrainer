/**
 * CONTROLLER — Speed game
 * Three outcomes: pick A, pick B, or call a TIE. The "tie" path is a real
 * competitive skill — equal Speed means turn order is a coin flip.
 *
 * Rounds auto-advance: answer → result shown (REVEAL_MS) → resetting (cards fade,
 * gauges drain, numbers return to "?") → next matchup loads. No "next" button.
 */

import { useState, useEffect, useCallback } from "react";
import { getRandomMatchup } from "../models/roster.model";
import type { Matchup } from "../models/types";

/** Bar scale ceiling (top base Speeds sit ~150–160; 180 leaves headroom). */
export const SPEED_MAX = 180;
/** Speed-tier granularity, in stat points per cell. */
export const SPEED_STEP = 10;

/** How long the result stays up, then the fade-out window before the next round. */
const REVEAL_MS = 1300;
const RESET_MS = 420;

export type Choice = "a" | "b" | "tie";

export interface SpeedGameState {
  matchup: Matchup | null;
  loading: boolean;
  choice: Choice | null;
  revealed: boolean;
  resetting: boolean;        // brief fade-out between answering and the next round
  truth: Choice | null;      // who is actually faster, or "tie"
  correct: boolean | null;
  score: number;
  streak: number;
}

function _truth(m: Matchup): Choice {
  const sa = m.a.pokemon.speed;
  const sb = m.b.pokemon.speed;
  if (sa === sb) return "tie";
  return sa > sb ? "a" : "b";
}

export function useSpeedGame() {
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

  // Phase 1: hold the result, then start the fade-out (card keeps its result
  // while fading — the reset to "?" happens on the next card, never mid-fade).
  useEffect(() => {
    if (!revealed) return;
    const id = setTimeout(() => { setResetting(true); }, REVEAL_MS);
    return () => clearTimeout(id);
  }, [revealed]);

  // Phase 2: once faded, load the next matchup.
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
    state: { matchup, loading, choice, revealed, resetting, truth, correct, score, streak } as SpeedGameState,
    actions: { select },
  };
}