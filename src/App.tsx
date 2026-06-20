/**
 * App.tsx — Root router (typed)
 * Persistent chrome (AppHeader + GlassMenu) wraps every screen.
 * Header = identity + language. GlassMenu = single-tap nav (Home + games).
 * Navigation goes through `go`, which intercepts not-yet-shipped games
 * (COMING_SOON) and shows a transient toast instead of navigating.
 */

import { useState, useRef, useCallback, type ComponentType } from "react";
// @ts-ignore: CSS imports are handled by the bundler
import "./styles/tokens.css";
import { useTranslations, type Lang } from "./i18n/translations";

import AppHeader from "./views/components/AppHeader";
import GlassMenu from "./views/components/GlassMenu";
import HomeScreen from "./views/screens/HomeScreen";
import SpeedGameScreen from "./views/screens/SpeedGameScreen";
import HPGameScreen from "./views/screens/HPGameScreen";
import TypeGameScreen from "./views/screens/TypeGameScreen";
import RosterScreen from "./views/screens/RosterScreen";

export type GameId = "home" | "speed" | "hp" | "type" | "roster";

/** Games not shippable yet — greyed out; tapping shows a "coming soon" toast. */
export const COMING_SOON: GameId[] = ["hp"];

interface GameScreenProps {
  lang: Lang;
}

const GAME_SCREENS: Record<Exclude<GameId, "home">, ComponentType<GameScreenProps>> = {
  speed: SpeedGameScreen,
  hp: HPGameScreen,
  type: TypeGameScreen,
  roster: RosterScreen,
};

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [activeGame, setActiveGame] = useState<GameId>("home");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const t = useTranslations(lang);

  const go = useCallback((id: GameId) => {
    if (COMING_SOON.includes(id)) {
      setToast(t.app.comingSoon);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 2200);
      return;
    }
    setActiveGame(id);
  }, [t]);

  const Screen = activeGame !== "home" ? GAME_SCREENS[activeGame] : null;

  return (
    <div
      className="poketrainer-root"
      style={{
        maxWidth: "var(--game-max-width, 440px)",
        margin: "0 auto",
        padding: "1.5rem 1rem 0",    // bottom inset moved to the main wrapper (per-screen)
        boxSizing: "border-box",     // CRITICAL: keeps padding inside the 100dvh, preventing overflow
        height: "100dvh",            // Strict viewport height
        maxHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",          // Strictly prevents global scrolling (screens scroll internally)
      }}
    >
      <AppHeader lang={lang} onSetLang={setLang} />

      {/* Main area wrapper: minHeight:0 prevents flex children from blowing out the layout.
          Every screen keeps a 7rem bottom gap so nothing slips under the GlassMenu —
          except the roster, which scrolls its content behind the bar (iOS-style) and
          reserves that gap internally instead. */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,              // CRITICAL: prevents nested flex overflow
          paddingBottom: activeGame === "roster" ? 0 : "7rem",
        }}
      >
        {Screen ? (
          <Screen lang={lang} />
        ) : (
          <HomeScreen lang={lang} onPlay={go} comingSoon={COMING_SOON} />
        )}
      </div>

      <GlassMenu lang={lang} active={activeGame} onSelect={go} comingSoon={COMING_SOON} />

      {toast && (
        <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "6.5rem", zIndex: 9999, width: "calc(100% - 2rem)", maxWidth: "408px" }}>
          <div className="pt-nav-item" style={{ background: "var(--color-background-secondary)", backdropFilter: "blur(12px)", border: "1px solid var(--color-border-secondary)", padding: "0.75rem 1rem", borderRadius: "12px", textAlign: "center", fontSize: "14px", color: "var(--color-text-primary)", boxShadow: "var(--shadow-card)" }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}