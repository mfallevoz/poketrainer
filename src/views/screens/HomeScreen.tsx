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
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "calc(100dvh - 12rem)" }}>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 20 }}>
        {t.app.selectGame}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {GAMES.map((g) => {
          const soon = comingSoon.includes(g.id);
          return (
            <button
              key={g.id}
              className={soon ? undefined : "pt-card"}
              onClick={() => onPlay(g.id)}
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "1rem 1.25rem",
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 16, cursor: soon ? "default" : "pointer", textAlign: "left", width: "100%",
                boxShadow: "var(--shadow-card)", opacity: soon ? 0.55 : 1,
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

      <div style={{ marginTop: 32, padding: "1rem", background: "var(--color-background-secondary)", borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          {t.app.footer}
        </div>
      </div>
    </div>
  );
}