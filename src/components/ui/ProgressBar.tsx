export function ProgressBar({
  value,
  max = 100,
  color = "var(--color-sage)",
  trackColor = "var(--color-taupe-soft)",
  height = 8,
}: {
  value: number;
  max?: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ background: trackColor, height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
