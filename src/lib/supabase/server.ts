import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used inside Server Components / Server Actions / Route Handlers — e.g. the
// dashboard and program pages reading data before the page renders.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore since the
            // proxy below refreshes the session on every request instead.
          }
        },
      },
      global: {
        // Next.js patches the global fetch() and, unless told otherwise,
        // can cache identical GET requests across requests/deployments —
        // including the REST calls Supabase makes under the hood. Every
        // query here needs live data, so opt every one of them out.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
