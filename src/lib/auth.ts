import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  role: "coach" | "client";
  name: string;
  email: string;
  avatar_initials: string;
  joined_date: string;
}

// Server-side guard used at the top of each protected layout. Sends anyone
// who isn't signed in to /login, and sends a signed-in user who's in the
// wrong section (a client hitting /coach/*, say) back to their own home.
export async function requireProfile(expectedRole?: "coach" | "client"): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  if (expectedRole && profile.role !== expectedRole) {
    redirect(profile.role === "coach" ? "/coach/dashboard" : "/client/today");
  }

  return profile as Profile;
}
