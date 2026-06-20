/**
 * VIEW — TypeBadge component
 * Renders a coloured pill for a given Pokémon type.
 */

import { TYPE_COLORS } from "../../models/typeChart.model";
import type { TypeName } from "../../models/types";

interface TypeBadgeProps {
  type: TypeName;
  size?: "sm" | "md";
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function TypeBadge({ type, size = "sm" }: TypeBadgeProps) {
  const color = TYPE_COLORS[type] ?? "#888";
  const fontSize = size === "md" ? 13 : 11;
  const padding = size === "md" ? "4px 12px" : "2px 8px";

  return (
    <span
      style={{
        fontSize,
        padding,
        borderRadius: 99,
        background: color + "33",
        color,
        fontWeight: 500,
        display: "inline-block",
        lineHeight: 1.6,
      }}
    >
      {cap(type)}
    </span>
  );
}