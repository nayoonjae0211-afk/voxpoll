import { cn } from "@/lib/utils";

export type Role = "user" | "assistant";

export function MessageBubble({
  role,
  content,
  streaming,
}: {
  role: Role;
  content: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex w-full animate-fade-in-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-body whitespace-pre-wrap leading-relaxed",
          isUser
            ? "bg-accent-soft text-text border border-accent/20"
            : "bg-surface text-text border border-border/60"
        )}
      >
        {content}
        {streaming && (
          <span className="ml-1 inline-block h-3 w-1.5 align-baseline bg-accent animate-pulse" />
        )}
      </div>
    </div>
  );
}
