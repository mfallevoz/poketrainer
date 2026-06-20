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

export type GameId = "home" | "speed" | "hp" | "type";

/** Games not shippable yet — greyed out; tapping shows a "coming soon" toast. */
export const COMING_SOON: GameId[] = ["hp"];

interface GameScreenProps {
  lang: Lang;
}

const GAME_SCREENS: Record<Exclude<GameId, "home">, ComponentType<GameScreenProps>> = {
  speed: SpeedGameScreen,
  hp: HPGameScreen,
  type: TypeGameScreen,
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
        padding: "1.5rem 1rem 7rem",
        minHeight: "100vh",
      }}
    >
      <AppHeader lang={lang} onSetLang={setLang} />

      {Screen ? (
        <Screen lang={lang} />
      ) : (
        <HomeScreen lang={lang} onPlay={go} comingSoon={COMING_SOON} />
      )}

      <GlassMenu lang={lang} active={activeGame} onSelect={go} comingSoon={COMING_SOON} />

      {toast && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 96, display: "flex", justifyContent: "center", zIndex: 60, pointerEvents: "none" }}>
          <div className="lg pt-toast" style={{ padding: "10px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}