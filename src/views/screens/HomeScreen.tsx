/**
 * VIEW — HomeScreen (TS)
 * Game picker. Vertically centered so it isn't top-heavy on tall screens.
 * Enabled cards lift on desktop hover (.pt-card); coming-soon games render
 * greyed with a "Soon" badge and a lock, and tapping them surfaces a toast
 * (handled by App's `onPlay`/`go`).
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
      </div>

      {/* Footer is pushed to the bottom of this flex container.
          Thanks to the 7rem padding in App.tsx, it stops perfectly above the GlassMenu.
          flexShrink: 0 prevents it from being crushed on very small screens. */}
      <div style={{ marginTop: "auto", padding: "1rem", background: "var(--color-background-secondary)", borderRadius: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          {t.app.footer || "PokéTrainer — All rights reserved."}
        </div>
      </div>

    </div>
  );
}