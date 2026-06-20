/**
 * CONTROLLER — Type game
 * Builds an MCQ: given a defending type, pick a super-effective attacker.
 * Everything is TypeName-typed, so options/answers can't drift to a bad string.
 *
 * Rounds auto-advance: answer → colored result (REVEAL_MS) → resetting fade →
 * next question loads (tiles clear, attacker disc returns to "?"). No button.
 */

import { useState, useEffect, useCallback } from "react";
import { TYPE_NAMES, type TypeName } from "../models/types";
import { getWeaknesses, getWrongOptions } from "../models/typeChart.model";

const REVEAL_MS = 1300;
const RESET_MS = 420;

export interface TypeQuestion {
  defenderType: TypeName;
  correctAnswer: TypeName;
  options: TypeName[];
}

export interface TypeGameState {
  question: TypeQuestion | null;
  selected: TypeName | null;
  resetting: boolean;
  correct: boolean | null;
  score: number;
  streak: number;
}

const _pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const _shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

function _build(): TypeQuestion {
  const defenderType = _pick(TYPE_NAMES);
  const correctAnswer = _pick(getWeaknesses(defenderType));
  const options = _shuffle([...getWrongOptions(defenderType, 3), correctAnswer]);
  return { defenderType, correctAnswer, options };
}

export function useTypeGame() {
  const [question, setQuestion] = useState<TypeQuestion | null>(null);
  const [selected, setSelected] = useState<TypeName | null>(null);
  const [resetting, setResetting] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const load = useCallback(() => {
    setSelected(null);
    setResetting(false);
    setQuestion(_build());
  }, []);

  useEffect(() => { load(); }, [load]);

  // Phase 1: hold the colored result, then begin the fade.
  useEffect(() => {
    if (selected === null) return;
    const id = setTimeout(() => { setResetting(true); }, REVEAL_MS);
    return () => clearTimeout(id);
  }, [selected]);

  // Phase 2: once faded, load the next question (clears selection + colors).
  useEffect(() => {
    if (!resetting) return;
    const id = setTimeout(() => { load(); }, RESET_MS);
    return () => clearTimeout(id);
  }, [resetting, load]);

  const correct =
    selected !== null && question ? selected === question.correctAnswer : null;

  const select = useCallback((t: TypeName) => {
    if (selected || resetting || !question) return;
    setSelected(t);
    if (t === question.correctAnswer) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }, [selected, resetting, question]);

  return {
    state: { question, selected, resetting, correct, score, streak } as TypeGameState,
    actions: { select },
  };
}