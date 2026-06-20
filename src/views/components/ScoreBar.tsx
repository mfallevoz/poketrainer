/**
 * VIEW — ScoreBar component
 * Displays score and streak side by side. Labels come from the caller.
 */

interface ScoreBarProps {
  score: number;
  streak: number;
  scoreLabel: string;
  streakLabel: string;
}

export default function ScoreBar({ score, streak, scoreLabel, streakLabel }: ScoreBarProps) {
  const tiles: { label: string; value: number | string }[] = [
    { label: scoreLabel, value: score },
    { label: streakLabel, value: `${streak} 🔥` },
  ];

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {tiles.map(({ label, value }) => (
        <div
          key={label}
          style={{
            flex: 1,
            background: "var(--color-background-secondary)",
            borderRadius: 10,
            padding: "8px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{label}</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}
