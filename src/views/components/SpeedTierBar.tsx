/**
 * VIEW — SpeedTierBar
 * Speed as discrete tier cells (SPEED_STEP points each). Cells fill left→right
 * on reveal; cells beyond the opponent are emphasised so the gap is countable.
 * Uses CSS tokens so it works on any theme.
 */

import { SPEED_MAX, SPEED_STEP } from "../../controllers/speedGame.controller";

interface Props {
  value: number;
  revealed: boolean;
  color: string;
  compareValue?: number;
  reduced?: boolean;
}

export default function SpeedTierBar({ value, revealed, color, compareValue, reduced }: Props) {
  const cellCount = Math.ceil(SPEED_MAX / SPEED_STEP);
  const fillCells = value / SPEED_STEP;
  const compareCells = (compareValue ?? 0) / SPEED_STEP;

  return (
    <div style={{ display: "flex", gap: 2, height: 16 }}>
      {Array.from({ length: cellCount }).map((_, i) => {
        const fill = revealed ? Math.max(0, Math.min(1, fillCells - i)) : 0;
        const isGap =
          revealed && compareValue !== undefined &&
          i >= Math.floor(compareCells) && i < fillCells;

        return (
          <div key={i} style={{
            flex: 1, borderRadius: 2, background: "var(--color-background-tertiary)",
            overflow: "hidden", position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0, transformOrigin: "left",
              transform: `scaleX(${fill})`,
              background: color,
              opacity: isGap ? 1 : 0.6,
              boxShadow: isGap ? `0 0 6px ${color}` : "none",
              transition: reduced
                ? "none"
                : `transform .4s cubic-bezier(.22,1,.36,1) ${i * 0.025}s`,
            }} />
          </div>
        );
      })}
    </div>
  );
}
