import { Shield, Award, Crown, Sparkles } from "lucide-react";

interface ReputationBadgeProps {
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
}

function getBadge(avg: number, reviews: number, sessions: number) {
  if (sessions >= 50 && avg >= 4.5 && reviews >= 30) return { label: "Elite Teacher", icon: Crown, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" };
  if (sessions >= 20 && avg >= 4.0 && reviews >= 15) return { label: "Top Mentor", icon: Sparkles, color: "text-primary bg-primary/10 border-primary/30" };
  if (sessions >= 5 && avg >= 3.5 && reviews >= 5) return { label: "Trusted Member", icon: Award, color: "text-accent bg-accent/10 border-accent/30" };
  return { label: "New Member", icon: Shield, color: "text-muted-foreground bg-secondary border-border" };
}

const ReputationBadge = ({ averageRating, totalReviews, completedSessions }: ReputationBadgeProps) => {
  const badge = getBadge(averageRating, totalReviews, completedSessions);
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
      <Icon className="h-3 w-3" />
      {badge.label}
    </span>
  );
};

export default ReputationBadge;
