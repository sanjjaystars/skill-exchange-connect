import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ChatContactItemProps {
  contact: Profile;
  isSelected: boolean;
  onSelect: () => void;
  lastMessage?: string;
  unread?: boolean;
}

const ChatContactItem = ({ contact, isSelected, onSelect, lastMessage, unread }: ChatContactItemProps) => (
  <button
    onClick={onSelect}
    className={cn(
      "w-full flex items-center gap-3 p-3 transition-all duration-150 text-left",
      isSelected
        ? "bg-primary/10 border-l-2 border-primary"
        : "hover:bg-secondary/50 border-l-2 border-transparent"
    )}
  >
    <div className="relative shrink-0">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-display font-bold">
        {contact.name?.[0] ?? "?"}
      </div>
      {contact.online && (
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between">
        <p className={cn("text-sm truncate", unread ? "font-bold" : "font-medium")}>{contact.name}</p>
        {unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
      </div>
      <p className="text-xs text-muted-foreground truncate">
        {lastMessage || (contact.teaches ?? []).slice(0, 2).join(", ") || "No skills listed"}
      </p>
    </div>
  </button>
);

export default ChatContactItem;
