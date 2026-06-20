/**
 * VIEW — AppHeader
 * Persistent top bar: site name (left) + language toggle (right).
 * The toggle is an iOS-style segmented control: a single "bubble" indicator
 * slides between EN and FR with a springy ease, instead of swapping two
 * separate backgrounds. Honors prefers-reduced-motion via tokens.css (the
 * global reduced-motion rule flattens the transition to instant).
 */

import { useTranslations, type Lang } from "../../i18n/translations";

const LANGS: Lang[] = ["en", "fr"];

export default function AppHeader({
  lang,
  onSetLang,
}: {
  lang: Lang;
  onSetLang: (l: Lang) => void;
}) {
  const t = useTranslations(lang);
  const index = LANGS.indexOf(lang); // 0 = en, 1 = fr → drives the bubble

  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "0.01em" }}>{t.app.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>{t.app.subtitle}</div>
      </div>

      <div
        className="lg"
        role="group"
        aria-label="Language"
        style={{ position: "relative", display: "flex", borderRadius: 99, padding: 3 }}
      >
        {/* sliding bubble — one indicator that travels between the two halves */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 3,
            bottom: 3,
            left: index === 0 ? 3 : "50%",
            width: "calc(50% - 3px)",
            background: "var(--color-text-primary)",
            borderRadius: 99,
            transition: "left .32s cubic-bezier(.34, 1.4, .5, 1)",
          }}
        />
        {LANGS.map((l) => (
          <button
            key={l}
            className="pt-toggle-btn"
            onClick={() => onSetLang(l)}
            aria-pressed={lang === l}
            style={{
              position: "relative",
              zIndex: 1,
              flex: 1,
              minWidth: 40,
              border: "none",
              cursor: "pointer",
              borderRadius: 99,
              padding: "5px 12px",
              fontSize: 12.5,
              fontWeight: 700,
              background: "transparent",
              color: lang === l ? "var(--color-page)" : "var(--color-text-secondary)",
              transition: "color .25s ease",
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}