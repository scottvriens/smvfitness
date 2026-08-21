"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function goToDashboard(userId: string) {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    router.push(profile?.role === "coach" ? "/coach/dashboard" : "/client/today");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const initials = name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, avatar_initials: initials } },
        });
        if (signUpError) throw signUpError;

        if (data.user && !data.session) {
          // Email confirmation is switched on for this project — they'll
          // need to click the link before they can sign in.
          setCheckEmail(true);
          return;
        }
        if (data.user) await goToDashboard(data.user.id);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) await goToDashboard(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-6">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-taupe)] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-base font-bold text-white">
            SV
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-charcoal)]">Check your email</h1>
          <p className="mt-2 text-sm text-[var(--color-charcoal)]/60">
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back
            here and sign in.
          </p>
          <button
            onClick={() => {
              setCheckEmail(false);
              setMode("signin");
            }}
            className="mt-6 w-full rounded-xl bg-[var(--color-sage)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-sage)] text-base font-bold text-white">
            SV
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-charcoal)]">SMV Fitness</h1>
          <p className="mt-1 text-sm text-[var(--color-charcoal)]/55">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <div className="mb-5 flex rounded-xl border border-[var(--color-taupe)] bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-[var(--color-sage)] text-white"
                : "text-[var(--color-charcoal)]/60"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-[var(--color-sage)] text-white"
                : "text-[var(--color-charcoal)]/60"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--color-taupe)] bg-white p-6 shadow-sm">
          {mode === "signup" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
                Name
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Reyes"
                className="w-full rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
              Password
            </label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[var(--color-clay)]/15 px-3 py-2 text-xs text-[var(--color-clay-deep)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--color-sage)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--color-charcoal)]/40">
          Signing up with your coach&apos;s own email creates the coach account automatically —
          everyone else becomes a client.
        </p>
      </div>
    </div>
  );
}
