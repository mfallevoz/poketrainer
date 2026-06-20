/**
 * VIEW — TypeGameScreen (TS)
 * Directional cue "[? your pick] → ×2 → [defender]" + filling grid + auto-advance.
 * No verdict text, no answer reveal, no "next" button: the green/wrong tile
 * colors already show whether you were right and which option was correct. After
 * a beat the question + grid fade out (resetting), then the next one fades in.
 */

import { useTypeGame } from "../../controllers/typeGame.controller";
import { useTranslations, type Lang } from "../../i18n/translations";
import { TYPE_COLORS, TYPE_LABELS, typeIconUrl } from "../../models/typeChart.model";
import type { TypeName } from "../../models/types";

const IMPACT = "#f97316";

/** White type symbol on a colored disc — the HOME badge. */
function TypeBadgeIcon({ type, size }: { type: TypeName; size: number }) {
  return (
    <span aria-hidden style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: TYPE_COLORS[type], display: "inline-flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,.18)",
    }}>
      <img src={typeIconUrl(type)} alt="" width={Math.round(size * 0.64)} height={Math.round(size * 0.64)} style={{ display: "block" }} />
    </span>
  );
}

export default function TypeGameScreen({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const ts = t.typeGame;
  const { state, actions } = useTypeGame();
  const { question, selected, resetting, score, streak } = state;

  if (!question) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>{ts.loading}</div>;
  }

  const def = question.defenderType;
  const locked = selected !== null || resetting;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 12rem)" }}>

      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
        opacity: resetting ? 0 : 1, transform: resetting ? "translateY(6px)" : "none",
        transition: "opacity .4s ease, transform .4s ease" }}>

        <div style={{ background: "var(--color-background-secondary)", borderRadius: 18, padding: "24px 16px 26px", textAlign: "center", margin: "12px 0 14px" }}>
          <p style={{ fontSize: 14.5, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 20px" }}>
            {ts.question(TYPE_LABELS[def][lang])}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 74 }}>
              {selected ? (
                <TypeBadgeIcon type={selected} size={60} />
              ) : (
                <span style={{ width: 60, height: 60, borderRadius: "50%", border: "1.5px dashed var(--color-border-secondary)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "var(--color-text-tertiary)" }}>?</span>
              )}
              <span style={{ fontSize: 11.5, color: "var(--color-text-tertiary)" }}>
                {selected ? TYPE_LABELS[selected][lang] : ts.pick}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, marginBottom: 22 }}>
              <span style={{ fontSize: 26, lineHeight: 1, color: IMPACT }}>→</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: IMPACT, fontVariantNumeric: "tabular-nums" }}>×2</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 74 }}>
              <TypeBadgeIcon type={def} size={60} />
              <span style={{ fontSize: 13, fontWeight: 700, color: TYPE_COLORS[def] }}>{TYPE_LABELS[def][lang]}</span>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "20px 0 0" }}>{ts.hint}</p>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gridTemplateRows: "1fr 1fr", gap: 10 }}>
          {question.options.map((type) => {
            const isSelected = selected === type;
            const isCorrect = type === question.correctAnswer;

            let bg = "var(--color-background-primary)";
            let border = "1.5px solid var(--color-border-tertiary)";
            if (isSelected && isCorrect) { bg = "var(--color-correct-bg)"; border = "1.5px solid var(--color-correct-border)"; }
            if (isSelected && !isCorrect) { bg = "var(--color-wrong-bg)"; border = "1.5px solid var(--color-wrong-border)"; }
            if (selected && !isSelected && isCorrect) { bg = "var(--color-correct-bg)"; border = "1.5px solid var(--color-correct-border)"; }

            return (
              <button key={type} onClick={() => actions.select(type)} disabled={locked}
                style={{ borderRadius: 14, background: bg, border, cursor: locked ? "default" : "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 8 }}>
                <TypeBadgeIcon type={type} size={46} />
                <span style={{ fontWeight: 600, fontSize: 14, color: TYPE_COLORS[type] }}>{TYPE_LABELS[type][lang]}</span>
              </button>
            );
          })}
        </div>
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