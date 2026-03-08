import { Award, BookOpen, Crown, GraduationCap, Heart, Shield, Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";

const badgeConfig: Record<string, { icon: any; color: string }> = {
  "Beginner Teacher": { icon: BookOpen, color: "text-sky-400 bg-sky-400/10 border-sky-400/30" },
  "Skill Mentor": { icon: GraduationCap, color: "text-violet-400 bg-violet-400/10 border-violet-400/30" },
  "Skill Master": { icon: Sparkles, color: "text-primary bg-primary/10 border-primary/30" },
  "Elite Teacher": { icon: Crown, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  "Community Helper": { icon: Heart, color: "text-rose-400 bg-rose-400/10 border-rose-400/30" },
  "Streak Champion": { icon: Flame, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  "Python Mentor": { icon: Award, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  "Top Mentor": { icon: Award, color: "text-primary bg-primary/10 border-primary/30" },
};

const defaultBadge = { icon: Shield, color: "text-muted-foreground bg-secondary border-border" };

interface BadgeDisplayProps {
  badges: string[];
  compact?: boolean;
}

const BadgeDisplay = ({ badges, compact = false }: BadgeDisplayProps) => {
  if (badges.length === 0) {
    return <p className="text-xs text-muted-foreground">No badges yet. Complete sessions to earn badges!</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, i) => {
        const config = badgeConfig[badge] || defaultBadge;
        const Icon = config.icon;
        return (
          <motion.span
            key={badge}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`inline-flex items-center gap-1 rounded-full border ${config.color} ${
              compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
            } font-medium`}
          >
            <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
            {badge}
          </motion.span>
        );
      })}
    </div>
  );
};

export default BadgeDisplay;
