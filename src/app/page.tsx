import Link from "next/link";
import { Dumbbell, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-cream)] px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-lg font-bold text-white">
          SV
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">SMV Fitness</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-charcoal)]/60">
          Training, nutrition, habits, check-ins, and progress — one place for your coaching
          clients.
        </p>

        <div className="mt-10 space-y-3">
          <Link
            href="/client/today"
            className="flex items-center justify-between rounded-2xl border border-[var(--color-taupe)] bg-white px-5 py-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-semibold text-[var(--color-charcoal)]">
                Preview as a client
              </span>
              <span className="block text-xs text-[var(--color-charcoal)]/55">
                Today&apos;s workout, habits, check-ins, progress
              </span>
            </span>
            <Dumbbell className="text-[var(--color-sage-deep)]" size={20} />
          </Link>

          <Link
            href="/coach/dashboard"
            className="flex items-center justify-between rounded-2xl border border-[var(--color-taupe)] bg-white px-5 py-4 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <span>
              <span className="block text-sm font-semibold text-[var(--color-charcoal)]">
                Preview as the coach
              </span>
              <span className="block text-xs text-[var(--color-charcoal)]/55">
                Client roster, check-in reviews, adherence
              </span>
            </span>
            <LayoutDashboard className="text-[var(--color-clay-deep)]" size={20} />
          </Link>
        </div>

        <p className="mt-10 text-xs text-[var(--color-charcoal)]/40">
          Early preview build — running on sample data, nothing is saved yet.
        </p>
      </div>
    </div>
  );
}
