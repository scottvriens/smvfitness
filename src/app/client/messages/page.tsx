import { MessageThread } from "@/components/client/MessageThread";
import { requireProfile } from "@/lib/auth";
import { getMessages } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const profile = await requireProfile("client");
  const supabase = await createClient();

  const [messages, { data: coach }] = await Promise.all([
    getMessages(profile.id),
    supabase.from("profiles").select("name, avatar_initials").eq("role", "coach").limit(1).maybeSingle(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-clay)]/25 text-sm font-semibold text-[var(--color-clay-deep)]">
          {coach?.avatar_initials ?? "?"}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-charcoal)]">
            {coach?.name ?? "Your coach"}
          </h1>
          <p className="text-xs text-[var(--color-charcoal)]/50">Your coach</p>
        </div>
      </div>
      <MessageThread
        clientId={profile.id}
        currentUserId={profile.id}
        currentUserRole="client"
        initialMessages={messages}
      />
    </div>
  );
}
