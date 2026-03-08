import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StreakIndicatorProps {
  days: number;
  size?: "sm" | "md";
}

const StreakIndicator = ({ days, size = "md" }: StreakIndicatorProps) => {
  if (days <= 0) return null;

  const isSm = size === "sm";

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full border ${
        days >= 7
          ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
          : "bg-muted border-border text-muted-foreground"
      } ${isSm ? "px-2 py-0.5" : "px-3 py-1"}`}
    >
      <Flame className={isSm ? "h-3 w-3" : "h-4 w-4"} />
      <span className={`${isSm ? "text-xs" : "text-sm"} font-semibold`}>
        {days} day{days !== 1 ? "s" : ""}
      </span>
    </motion.div>
  );
};

export default StreakIndicator;
