/**
 * VIEW — StatBar component
 * Animated horizontal bar that reveals the stat value on a delay.
 */

interface StatBarProps {
  value: number;
  maxValue: number;
  color: string;
  revealed: boolean;
  label: string;
}

export default function StatBar({ value, maxValue, color, revealed, label }: StatBarProps) {
  const pct = Math.min(Math.round((value / maxValue) * 100), 100);

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "var(--color-text-secondary)",
        marginBottom: 4,
      }}>
        <span>{label}</span>
        <span style={{
          fontWeight: 500,
          color: revealed ? "var(--color-text-primary)" : "transparent",
          transition: "color 0.4s 0.6s",
        }}>
          {value}
        </span>
      </div>

      <div style={{
        background: "var(--color-background-tertiary)",
        borderRadius: 99,
        height: 8,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: revealed ? `${pct}%` : "0%",
          background: color,
          borderRadius: 99,
          transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }} />
      </div>
    </div>
  );
}
