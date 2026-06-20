/**
 * VIEW — HomeScreen (TS)
 * Game picker. Vertically centered so it isn't top-heavy on tall screens.
 * Enabled cards lift on desktop hover (.pt-card); coming-soon games render
 * greyed with a "Soon" badge and a lock, and tapping them surfaces a toast
 * (handled by App's `onPlay`/`go`). The Roster sits a bit lower in a quieter
 * style — it's a reference/tool, not a game.
 */

import { useTranslations, type Lang } from "../../i18n/translations";
import type { GameId } from "../../App";

const GAMES: {
  id: Exclude<GameId, "home">;
  icon: string;
  bg: string;
  tKey: "speedGame" | "hpGame" | "typeGame";
}[] = [
  { id: "speed", icon: "⚡", bg: "#818cf822", tKey: "speedGame" },
  { id: "hp",    icon: "❤️", bg: "#f8717122", tKey: "hpGame" },
  { id: "type",  icon: "🎯", bg: "#4ade8022", tKey: "typeGame" },
];

export default function HomeScreen({
  lang,
  onPlay,
  comingSoon,
}: {
  lang: Lang;
  onPlay: (id: Exclude<GameId, "home">) => void;
  comingSoon: GameId[];
}) {
  const t = useTranslations(lang);

  return (
    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>

      {/* Vertically centered container for games. minHeight: 0 keeps it from expanding arbitrarily */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1, minHeight: 0 }}>
        {GAMES.map((g) => {
          const soon = comingSoon.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => onPlay(g.id)}
              className="pt-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "1rem",
                borderRadius: 16,
                background: "var(--color-background-primary)",
                border: "1px solid var(--color-border-tertiary)",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                opacity: soon ? 0.6 : 1,
                marginBottom: 12,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: g.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
              }}>
                {g.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 15 }}>
                  {t[g.tKey].title}
                  {soon && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase",
                      padding: "2px 7px", borderRadius: 99,
                      background: "var(--color-background-tertiary)", color: "var(--color-text-tertiary)",
                    }}>{t.app.soon}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
                  {t[g.tKey].desc}
                </div>
              </div>
              <span style={{ color: "var(--color-text-tertiary)", fontSize: soon ? 15 : 18 }} aria-hidden>
                {soon ? "🔒" : "›"}
              </span>
            </button>
          );
        })}

        {/* Roster — same shape as the game cards so it sits in the family; the neutral
            icon tint and the separation above are what mark it as a reference tool. */}
        <button
          onClick={() => onPlay("roster")}
          className="pt-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "1rem",
            borderRadius: 16,
            background: "var(--color-background-primary)",
            border: "1px solid var(--color-border-tertiary)",
            textAlign: "left",
            width: "100%",
            cursor: "pointer",
            marginTop: 16,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: "#a1a1aa22",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
          }}>
            📋
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 15 }}>{t.app.roster}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {t.roster.desc}
            </div>
          </div>
          <span style={{ color: "var(--color-text-tertiary)", fontSize: 18 }} aria-hidden>›</span>
        </button>
      </div>

      {/* Footer — pinned to the bottom (marginTop:auto). A thin hairline + centered,
          muted text instead of a filled grey slab, to match the dark minimal-luxury
          look. flexShrink:0 keeps it from being squeezed on short screens. */}
      <footer
        style={{
          marginTop: "auto",
          flexShrink: 0,
          paddingTop: "0.875rem",
          borderTop: "1px solid var(--color-border-tertiary)",
        }}
      >
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: 11,
            lineHeight: 1.5,
            letterSpacing: "0.02em",
            color: "var(--color-text-tertiary)",
          }}
        >
          {t.app.footer}
        </p>
      </footer>

    </div>
  );
}