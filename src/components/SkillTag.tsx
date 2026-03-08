import { cn } from "@/lib/utils";

interface SkillTagProps {
  skill: string;
  variant?: "teach" | "learn" | "default";
  size?: "sm" | "md";
}

const SkillTag = ({ skill, variant = "default", size = "md" }: SkillTagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-all duration-200",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variant === "teach" &&
          "bg-primary/15 text-primary border border-primary/30",
        variant === "learn" &&
          "bg-accent/15 text-accent border border-accent/30",
        variant === "default" &&
          "bg-secondary text-secondary-foreground border border-border"
      )}
    >
      {variant === "teach" && "📚 "}
      {variant === "learn" && "🎯 "}
      {skill}
    </span>
  );
};

export default SkillTag;
