"use client";

import { createBrowserClient } from "@supabase/ssr";

// Used inside Client Components ("use client" files) — e.g. the habit
// checklist, check-in form, and message thread once they write real data.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
