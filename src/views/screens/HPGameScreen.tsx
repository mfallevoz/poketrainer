/**
 * VIEW — HPGameScreen (TS)
 * Same étirer layout + auto-advance as the speed duel. HPCard is a MODULE-LEVEL
 * component so it isn't remounted every render (which would kill the HP-bar fill
 * and number count-up animations).
 */

import { useHPGame, HP_MAX, type Choice } from "../../controllers/hpGame.controller";
import { useTranslations, type Lang } from "../../i18n/translations";
import { localizedName } from "../../models/pokemon.model";
import { TYPE_COLORS, TYPE_LABELS } from "../../models/typeChart.model";
import type { Combatant } from "../../models/types";
import CountUp from "../components/CountUp";

const HP_COLOR = "#f87171";
const WIN = "#4ade80";
const LOSE = "#f87171";

type Side = Exclude<Choice, "tie">;

function HPCard({ side, c, revealed, locked, isWinner, isWrong, lang, onSelect }: {
  side: Side;
  c: Combatant;
  revealed: boolean;
  locked: boolean;
  isWinner: boolean;
  isWrong: boolean;
  lang: Lang;
  onSelect: (side: Side) => void;
}) {
  const pct = Math.min(Math.round((c.pokemon.hp / HP_MAX) * 100), 100);
  const name = localizedName(c.pokemon, lang);
  const tint = TYPE_COLORS[c.pokemon.types[0]];

  let border = `1px solid ${tint}33`;
  if (isWinner) border = `1.5px solid ${WIN}`;
  if (isWrong) border = `1.5px solid ${LOSE}`;

  return (
    <button onClick={() => onSelect(side)} disabled={locked}
      style={{ flex: 1, minHeight: 132, width: "100%", textAlign: "left", cursor: locked ? "default" : "pointer",
        background: `linear-gradient(0deg, ${tint}14, ${tint}14), var(--color-background-primary)`,
        border, borderRadius: 18, padding: "14px 16px",
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <img src={c.shiny ? c.pokemon.spriteShiny : c.pokemon.sprite}
          alt={name} width={76} height={76} style={{ objectFit: "contain", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 16 }}>
            {name}{c.shiny && <span title="Shiny!">✨</span>}
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
            {c.pokemon.types.map((ty) => (
              <span key={ty} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99,
                background: TYPE_COLORS[ty] + "30", color: TYPE_COLORS[ty], fontWeight: 600 }}>{TYPE_LABELS[ty][lang]}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1,
          color: revealed ? (isWinner ? WIN : "var(--color-text-primary)") : "var(--color-text-tertiary)" }}>
          <CountUp value={c.pokemon.hp} active={revealed} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>0</span>
        <div style={{ flex: 1, height: 8, borderRadius: 99, background: "var(--color-background-tertiary)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, width: revealed ? `${pct}%` : "0%",
            background: isWinner ? WIN : HP_COLOR, transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
        </div>
        <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>{HP_MAX}</span>
      </div>
    </button>
  );
}

export default function HPGameScreen({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const ts = t.hpGame;
  const { state, actions } = useHPGame();
  const { matchup, loading, choice, revealed, resetting, truth, score, streak } = state;

  if (loading || !matchup) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>{ts.loading}</div>;
  }

  const { a, b } = matchup;
  const locked = revealed || resetting;

  const aWin = revealed && (truth === "a" || truth === "tie");
  const aWrong = revealed && choice === "a" && !aWin;
  const bWin = revealed && (truth === "b" || truth === "tie");
  const bWrong = revealed && choice === "b" && !bWin;

  const tieBorder = revealed
    ? (truth === "tie" ? WIN : (choice === "tie" ? LOSE : "var(--color-border-tertiary)"))
    : "var(--color-border-tertiary)";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 12rem)" }}>
      <p style={{ textAlign: "center", fontWeight: 700, fontSize: 17, margin: "12px 0 14px" }}>{ts.desc}</p>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center",
        opacity: resetting ? 0 : 1, transform: resetting ? "translateY(6px)" : "none",
        transition: "opacity .4s ease, transform .4s ease" }}>
        <HPCard side="a" c={a} revealed={revealed} locked={locked} isWinner={aWin} isWrong={aWrong} lang={lang} onSelect={actions.select} />
        <button onClick={() => actions.select("tie")} disabled={locked}
          style={{ alignSelf: "center", marginTop: -2, marginBottom: -2, padding: "7px 18px", borderRadius: 99, cursor: locked ? "default" : "pointer",
            background: revealed && truth === "tie" ? `${WIN}22` : "var(--color-background-secondary)",
            border: `1px solid ${tieBorder}`, color: revealed && truth === "tie" ? WIN : "var(--color-text-secondary)",
            fontWeight: 700, fontSize: 13 }}>
          ⚖ {ts.tied}
        </button>
        <HPCard side="b" c={b} revealed={revealed} locked={locked} isWinner={bWin} isWrong={bWrong} lang={lang} onSelect={actions.select} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <div style={{ flex: 1, background: "var(--color-background-secondary)", borderRadius: 12, padding: "9px 12px" }}>
          <div style={{ fontSize: 10, color: "var(--color-text-secondary)", letterSpacing: ".04em", textTransform: "uppercase" }}>{t.score.score}</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 1, fontVariantNumeric: "tabular-nums" }}>{score}</div>
        </div>
        <div style={{ flex: 1, background: "var(--color-background-secondary)", borderRadius: 12, padding: "9px 12px" }}>
          <div style={{ fontSize: 10, color: "var(--color-text-secondary)", letterSpacing: ".04em", textTransform: "uppercase" }}>{t.score.streak}</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 1, fontVariantNumeric: "tabular-nums" }}>{streak} 🔥</div>
        </div>
      </div>
    </div>
  );
}