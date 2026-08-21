import { Card, CardHeading } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { WeightChart } from "@/components/client/WeightChart";
import { progressPhotos } from "@/lib/mock-data";
import { TrendingDown, Scale, Calendar } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getWeightHistory } from "@/lib/data";

export default async function ProgressPage() {
  const profile = await requireProfile("client");
  const weightHistory = await getWeightHistory(profile.id);

  const frontPhotos = progressPhotos.filter((p) => p.angle === "front");
  const earliestFront = frontPhotos[0];
  const latestFront = frontPhotos[frontPhotos.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Progress</h1>
        <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
          {weightHistory.length > 0
            ? `Your trends from ${weightHistory.length} check-in${weightHistory.length === 1 ? "" : "s"}.`
            : "Submit a check-in with your weight to start seeing trends here."}
        </p>
      </div>

      {weightHistory.length > 0 && (
        <>
          {(() => {
            const first = weightHistory[0];
            const latest = weightHistory[weightHistory.length - 1];
            const change = +(latest.weightKg - first.weightKg).toFixed(1);
            return (
              <div className="grid grid-cols-3 gap-3">
                <StatTile label="Current" value={`${latest.weightKg} kg`} icon={Scale} />
                <StatTile
                  label="Change"
                  value={`${change > 0 ? "+" : ""}${change} kg`}
                  icon={TrendingDown}
                  accent="var(--color-olive-deep)"
                />
                <StatTile
                  label="Since"
                  value={new Date(first.date).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                  })}
                  icon={Calendar}
                  accent="var(--color-clay-deep)"
                />
              </div>
            );
          })()}

          <Card>
            <CardHeading title="Bodyweight trend" subtitle="Logged at each weekly check-in" />
            <WeightChart data={weightHistory} />
          </Card>
        </>
      )}

      <Card>
        <CardHeading title="Progress photos" subtitle="Front view, first vs. most recent" />
        <div className="grid grid-cols-2 gap-3">
          <PhotoPlaceholder label={new Date(earliestFront.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} color={earliestFront.colorSwatch} />
          <PhotoPlaceholder label={new Date(latestFront.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} color={latestFront.colorSwatch} />
        </div>

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--color-charcoal)]/45">
          All photos
        </p>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {progressPhotos.map((photo) => (
            <PhotoPlaceholder
              key={photo.id}
              label={photo.angle}
              color={photo.colorSwatch}
              small
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--color-charcoal)]/45">
          These are still sample placeholders — real photo uploads are the next build step.
        </p>
      </Card>
    </div>
  );
}

function PhotoPlaceholder({
  label,
  color,
  small = false,
}: {
  label: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div>
      <div
        className={`flex items-center justify-center rounded-xl border border-[var(--color-taupe)] ${
          small ? "aspect-square" : "aspect-[3/4]"
        }`}
        style={{ background: color }}
      >
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium capitalize text-[var(--color-charcoal)]/60">
          {label}
        </span>
      </div>
    </div>
  );
}
