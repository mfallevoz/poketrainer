// src/views/components/RosterCard.tsx
import { useState, memo } from "react";
import { type Pokemon } from "../../models/types";
import { localizedName } from "../../models/pokemon.model";
import { useTranslations, type Lang } from "../../i18n/translations";

/**
 * VIEW — RosterCard
 * Flip card for the catalogue. Front: sprite + localized name. Back: the full
 * stat line (6 stats, i18n labels). `shiny` is decided at the screen level
 * (1/4096, stable for the session) and passed in as a prop — the card only
 * renders it: shiny sprite + gold outline + ✨.
 */
export const RosterCard = memo(
  ({ p, lang, shiny }: { p: Pokemon; lang: Lang; shiny: boolean }) => {
    const t = useTranslations(lang);
    const [flipped, setFlipped] = useState(false);

    const sprite = shiny ? p.spriteShiny : p.sprite;

    // Left column = HP/Atk/Def, right column = SpA/SpD/Spe (the grid fills row by row).
    const stats: [keyof typeof t.stats, number][] = [
      ["hp", p.hp],      ["spa", p.spAtk],
      ["atk", p.attack], ["spd", p.spDef],
      ["def", p.defense], ["spe", p.speed],
    ];

    return (
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{ height: 140, perspective: 1000, cursor: "pointer" }}
      >
        <div
          style={{
            position: "relative", width: "100%", height: "100%",
            transformStyle: "preserve-3d", transition: "transform 0.6s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          }}
        >
          {/* Front face */}
          <div
            style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden",
              background: "var(--color-background-primary)", borderRadius: 12,
              border: shiny
                ? "1px solid var(--color-shiny)"
                : "1px solid var(--color-border-tertiary)",
              boxShadow: shiny ? "0 0 12px -2px var(--color-shiny)" : "none",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}
          >
            {shiny && (
              <span
                aria-hidden
                style={{ position: "absolute", top: 6, right: 8, fontSize: 11, color: "var(--color-shiny)" }}
              >
                ✨
              </span>
            )}
            <img
              src={sprite}
              alt={localizedName(p, lang)}
              loading="lazy"
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
            <span
              style={{
                fontSize: 9, fontWeight: 700,
                color: shiny ? "var(--color-shiny)" : "var(--color-text-primary)",
              }}
            >
              {localizedName(p, lang)}
            </span>
          </div>

          {/* Back face — full stat line */}
          <div
            style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)",
              background: "var(--color-background-secondary)", borderRadius: 12, padding: 10,
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                columnGap: 10, rowGap: 3, fontSize: 9.5,
              }}
            >
              {stats.map(([key, val]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>{t.stats[key]}</span>
                  <span style={{ fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);