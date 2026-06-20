/**
 * VIEW — PokemonCard component
 * Tappable card: sprite, name, type badges, and an animated stat bar.
 * Purely presentational — all state comes from the controller via props.
 */

import StatBar from "./StatBar";
import TypeBadge from "./TypeBadge";
import { formatPokemonName } from "../../models/pokemon.model";
import type { Pokemon } from "../../models/types";

/** Numeric stat keys of a Pokémon — what the card is allowed to display. */
type StatKey = "speed" | "hp" | "attack" | "defense" | "spAtk" | "spDef";

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick: () => void;
  revealed: boolean;
  isWinner: boolean;     // true = this is the correct Pokémon
  isSelected: boolean;   // true = player tapped this card
  statKey: StatKey;
  maxStat: number;
  statLabel: string;
  statColor: string;
  disabled: boolean;
}

export default function PokemonCard({
  pokemon,
  onClick,
  revealed,
  isWinner,
  isSelected,
  statKey,
  maxStat,
  statLabel,
  statColor,
  disabled,
}: PokemonCardProps) {
  let borderColor = "var(--color-border-tertiary)";
  if (revealed && isWinner) borderColor = "var(--color-correct-border, #4ade80)";
  if (revealed && isSelected && !isWinner) borderColor = "var(--color-wrong-border, #f87171)";

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      role={disabled ? undefined : "button"}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={!disabled ? (e) => e.key === "Enter" && onClick() : undefined}
      aria-label={`Select ${formatPokemonName(pokemon.slug)}`}
      style={{
        background: "var(--color-background-primary)",
        border: `2px solid ${borderColor}`,
        borderRadius: 16,
        padding: "1rem",
        cursor: disabled ? "default" : "pointer",
        transition: "border-color 0.3s, transform 0.15s",
        transform: isSelected && !revealed ? "scale(0.98)" : "scale(1)",
        userSelect: "none",
        position: "relative",
      }}
    >
      {revealed && isWinner && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "#4ade8022", color: "#16a34a",
          fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99,
        }}>
          ✓ {statLabel}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src={pokemon.sprite}
          alt={formatPokemonName(pokemon.slug)}
          width={72}
          height={72}
          style={{ objectFit: "contain" }}
          loading="lazy"
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 15 }}>
            {formatPokemonName(pokemon.slug)}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </div>

      <StatBar
        value={pokemon[statKey]}
        maxValue={maxStat}
        color={statColor}
        revealed={revealed}
        label={statLabel}
      />
    </div>
  );
}
