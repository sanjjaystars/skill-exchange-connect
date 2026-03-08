import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
}

const MatchBadge = ({ percentage, size = "md" }: MatchBadgeProps) => {
  const getColor = () => {
    if (percentage >= 80) return "text-primary glow-primary";
    if (percentage >= 50) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-bold border",
        getColor(),
        percentage >= 80 ? "border-primary/40 bg-primary/10" : "border-border bg-secondary",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-12 w-12 text-sm",
        size === "lg" && "h-16 w-16 text-lg"
      )}
    >
      {percentage}%
    </div>
  );
};

export default MatchBadge;
