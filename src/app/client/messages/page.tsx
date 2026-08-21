import { MessageThread } from "@/components/client/MessageThread";
import { messages, coachUser } from "@/lib/mock-data";

export default function MessagesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-clay)]/25 text-sm font-semibold text-[var(--color-clay-deep)]">
          {coachUser.avatarInitials}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-charcoal)]">{coachUser.name}</h1>
          <p className="text-xs text-[var(--color-charcoal)]/50">Your coach</p>
        </div>
      </div>
      <MessageThread initialMessages={messages} />
    </div>
  );
}
