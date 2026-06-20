// src/views/screens/RosterScreen.tsx
import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { CHAMPIONS_ROSTER } from "../../models/roster.model";
import { fetchPokemonBatch, localizedName, rollShiny } from "../../models/pokemon.model";
import { type Pokemon } from "../../models/types";
import { useTranslations, type Lang } from "../../i18n/translations";
import { RosterCard } from "../components/RosterCard";

type Filter = "all" | "pokemon" | "mega";

// Small first batch so the first cards paint quickly on a cold PokéAPI cache,
// then larger batches for throughput. Roster order is preserved either way.
const FIRST_BATCH = 12;
const BATCH_SIZE = 24;
// Computed once at module level — not on every render.
const ALL_SLUGS = [...CHAMPIONS_ROSTER];

// --- Virtualization geometry ---------------------------------------------
// The grid is uniform, so windowing is just arithmetic. CARD_H MUST match the
// fixed height inside RosterCard (140); if you change one, change the other.
const COLS = 3;
const CARD_H = 140;
const GAP = 10;
const ROW_H = CARD_H + GAP; // vertical pitch between rows
const OVERSCAN = 6;         // extra rows kept above/below the viewport

// Mega = the `form` field (mega / mega-x / mega-y), NOT slug.includes("mega"):
// "meganium" and "metagross-mega" are both in the roster, so the slug would
// produce false positives.
const isMega = (p: Pokemon) => p.form.startsWith("mega");

// Module-level cache so the roster survives this screen's unmount/remount.
// Without it, every visit reset `list` to [] and rebuilt all cards from scratch
// (even with the network cache warm). Now a return visit seeds straight from here.
// Shiny is rolled once per Pokémon and kept here too, so it's stable across visits.
let cachedList: Pokemon[] = [];
const cachedShiny = new Set<string>();
let fullyLoaded = false;

export default function RosterScreen({ lang }: { lang: Lang }) {
  const t = useTranslations(lang);
  const [list, setList] = useState<Pokemon[]>(() => cachedList);
  const [shinySlugs, setShinySlugs] = useState<Set<string>>(() => new Set(cachedShiny));
  const [loading, setLoading] = useState(() => !fullyLoaded);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [headerVisible, setHeaderVisible] = useState(true);

  // Scroll/viewport state drives which rows are mounted.
  const scrollRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(0);
  const [gridTop, setGridTop] = useState(0); // grid's offset below the sticky header

  // Loads only what's missing. `cancelled` is LOCAL to each effect run (not a
  // shared ref): in StrictMode dev the effect runs twice, and the first run's loop
  // must stay cancelled when the second one starts — otherwise it double-appends.
  // We resume from `cachedList.length`, so a return mid-load continues cleanly.
  useEffect(() => {
    if (fullyLoaded) return; // everything is cached — state was seeded from it

    let cancelled = false;

    (async () => {
      let i = cachedList.length;
      let size = i === 0 ? FIRST_BATCH : BATCH_SIZE;
      while (i < ALL_SLUGS.length) {
        if (cancelled) return;
        try {
          const batch = await fetchPokemonBatch(ALL_SLUGS.slice(i, i + size));
          if (cancelled) return;
          for (const p of batch) if (rollShiny()) cachedShiny.add(p.slug);
          cachedList = cachedList.concat(batch);
          setList(cachedList);
          setShinySlugs(new Set(cachedShiny));
        } catch {
          // Failed batch (network, 404…) → keep going with the next one.
        }
        i += size;
        size = BATCH_SIZE;
      }
      if (!cancelled) {
        fullyLoaded = true;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Measure the scroll viewport height and the grid's top offset (= sticky header
  // height + grid padding). Re-measured on resize/orientation change.
  useLayoutEffect(() => {
    const measure = () => {
      const el = scrollRef.current;
      if (!el) return;
      setViewportH(el.clientHeight);
      setGridTop(spacerRef.current ? spacerRef.current.offsetTop : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Reset to the top when the result set changes, so the window can't be left
  // scrolled past the (now shorter) content.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    lastScrollTop.current = 0;
    setScrollTop(0);
    setHeaderVisible(true);
  }, [filter, search]);

  // Single scroll handler: header hide/show + virtualization window.
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const y = el.scrollTop;
    if (y > lastScrollTop.current && y > 80) setHeaderVisible(false);
    else if (y < lastScrollTop.current) setHeaderVisible(true);
    lastScrollTop.current = y;
    setScrollTop(y);
  };

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      const matchesSearch =
        !q ||
        localizedName(p, lang).toLowerCase().includes(q) ||
        p.slug.includes(q);
      const matchesFilter =
        filter === "all" ? true :
        filter === "mega" ? isMega(p) :
                            !isMega(p);
      return matchesSearch && matchesFilter;
    });
  }, [list, search, filter, lang]);

  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all",     label: t.roster.all },
    { id: "pokemon", label: t.roster.pokemon },
    { id: "mega",    label: t.roster.mega },
  ];

  // --- Window computation: only mount the rows in (or near) the viewport ---
  const rows = Math.ceil(filteredList.length / COLS);
  const totalGridH = rows > 0 ? rows * ROW_H - GAP : 0;
  const scrolledIntoGrid = scrollTop - gridTop;
  const startRow = Math.max(0, Math.floor(scrolledIntoGrid / ROW_H) - OVERSCAN);
  const endRow = Math.min(rows, Math.ceil((scrolledIntoGrid + viewportH) / ROW_H) + OVERSCAN);
  const visible = filteredList.slice(startRow * COLS, endRow * COLS);
  const offsetY = startRow * ROW_H;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{
        height: "100%", overflowY: "auto", overflowX: "hidden", position: "relative",
        // Content scrolls behind the floating GlassMenu; this 7rem inset keeps the
        // footer (and the last row at full scroll) clear of it, aligned with Home.
        paddingBottom: "7rem",
      }}
    >
      {/* Glass header — sticky inside the scroll container, hides on scroll down */}
      <div
        className="lg sheen"
        style={{
          position: "sticky", top: 8, zIndex: 10,
          padding: 16, borderRadius: 20,
          transition: "transform 0.3s ease, opacity 0.3s ease",
          transform: headerVisible ? "translateY(0)" : "translateY(-130%)",
          opacity: headerVisible ? 1 : 0,
        }}
      >
        <input
          type="text"
          placeholder={t.app.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 16px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.12)",
            color: "var(--color-text-primary)", marginBottom: 10, outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                className="pt-nav-item"
                onClick={() => setFilter(f.id)}
                style={{
                  flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)",
                  boxShadow: active ? "inset 0 1px 0.5px rgba(255,255,255,0.35)" : "none",
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontSize: 12, fontWeight: 700,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Virtualized grid: the spacer holds the full height; only the visible
          window is rendered, positioned at its true offset. */}
      <div style={{ padding: "12px 4px 16px" }}>
        <div ref={spacerRef} style={{ position: "relative", height: totalGridH }}>
          <div
            style={{
              position: "absolute", top: offsetY, left: 0, right: 0,
              display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: GAP,
            }}
          >
            {visible.map((p) => (
              <RosterCard key={p.slug} p={p} lang={lang} shiny={shinySlugs.has(p.slug)} />
            ))}
          </div>
        </div>

        {/* Empty state */}
        {!loading && filteredList.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--color-text-tertiary)", paddingTop: 40 }}>
            {t.roster.empty}
          </p>
        )}
      </div>

      {/* Footer — flush to the bottom of the content (no bottom padding) so it keeps
          the same margin to the GlassMenu as HomeScreen. Shown once loading is done. */}
      {!loading && (
        <footer
          style={{
            padding: "0.875rem 4px 0",
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
      )}
    </div>
  );
}