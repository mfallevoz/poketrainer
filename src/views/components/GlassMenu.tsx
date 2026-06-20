/**
 * VIEW — GlassMenu
 * Persistent Liquid-Glass bottom navigation, single tap to switch (no deploy
 * gesture). Includes an Accueil tab. Coming-soon games render greyed; tapping
 * routes through `onSelect` (App shows a toast instead of navigating). Items
 * lift slightly on desktop hover via the .pt-nav-item class.
 */

import type { Lang } from "../../i18n/translations";
import type { GameId } from "../../App";

const ITEMS: { id: GameId; icon: string; label: Record<Lang, string> }[] = [
  { id: "home",  icon: "🏠", label: { en: "Home",  fr: "Accueil" } },
  { id: "speed", icon: "⚡", label: { en: "Speed", fr: "Vitesse" } },
  { id: "hp",    icon: "❤️", label: { en: "OHKO",  fr: "OHKO" } },
  { id: "type",   icon: "🎯", label: { en: "Types",  fr: "Types"  } },
  { id: "roster", icon: "📋", label: { en: "Roster", fr: "Roster" } },
];

export default function GlassMenu({
  lang,
  active,
  onSelect,
  comingSoon,
}: {
  lang: Lang;
  active: GameId;
  onSelect: (id: GameId) => void;
  comingSoon: GameId[];
}) {
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 24, zIndex: 50, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <nav
        className="lg sheen"
        aria-label="Navigation"
        style={{
          pointerEvents: "auto", height: 58, width: "min(92vw, 380px)", borderRadius: 29,
          display: "flex", alignItems: "center", padding: "0 6px", gap: 4,
        }}
      >
        {ITEMS.map((it) => {
          const soon = comingSoon.includes(it.id);
          const isActive = active === it.id && !soon;
          return (
            <button
              key={it.id}
              className="pt-nav-item"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(it.id)}
              style={{
                flex: 1, border: "none", cursor: "pointer", borderRadius: 22, padding: "6px 4px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
                boxShadow: isActive ? "inset 0 1px 0.5px rgba(255,255,255,0.35)" : "none",
                color: soon ? "var(--color-text-tertiary)" : isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                opacity: soon ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{it.icon}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700 }}>{it.label[lang]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}