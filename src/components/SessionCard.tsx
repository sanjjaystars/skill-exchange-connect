import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SessionCardProps {
  session: {
    id: string;
    skill: string;
    status: string;
    created_at: string;
    partner_name: string;
    is_teacher: boolean;
  };
  onComplete: (id: string) => void;
  onReview: (id: string) => void;
  hasReviewed: boolean;
}

const SessionCard = ({ session, onComplete, onReview, hasReviewed }: SessionCardProps) => {
  const isCompleted = session.status === "completed";

  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          isCompleted ? "bg-accent/15" : "bg-primary/15"
        }`}>
          {isCompleted ? <CheckCircle className="h-4 w-4 text-accent" /> : <Clock className="h-4 w-4 text-primary" />}
        </div>
        <div>
          <p className="text-sm font-medium">
            {session.is_teacher ? "Teaching" : "Learning"}{" "}
            <span className="text-primary">{session.skill || "General"}</span>{" "}
            with <span className="font-semibold">{session.partner_name}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })} · {session.status}
          </p>
        </div>
      </div>
      <div className="flex gap-2 ml-12 sm:ml-0">
        {!isCompleted && (
          <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => onComplete(session.id)}>
            <CheckCircle className="h-3 w-3 mr-1" /> Complete
          </Button>
        )}
        {isCompleted && !hasReviewed && (
          <Button size="sm" className="rounded-full text-xs" onClick={() => onReview(session.id)}>
            <MessageSquare className="h-3 w-3 mr-1" /> Review
          </Button>
        )}
        {isCompleted && hasReviewed && (
          <span className="text-[11px] text-muted-foreground px-2 py-1">✓ Reviewed</span>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
