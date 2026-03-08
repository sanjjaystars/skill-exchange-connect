import { Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PointsCounterProps {
  points: number;
  size?: "sm" | "md" | "lg";
}

const PointsCounter = ({ points, size = "md" }: PointsCounterProps) => {
  const sizes = {
    sm: { icon: "h-3.5 w-3.5", text: "text-sm", container: "px-2 py-0.5" },
    md: { icon: "h-4 w-4", text: "text-base", container: "px-3 py-1" },
    lg: { icon: "h-5 w-5", text: "text-xl", container: "px-4 py-2" },
  };
  const s = sizes[size];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 ${s.container}`}
    >
      <Zap className={`${s.icon} text-amber-500 fill-amber-500`} />
      <span className={`${s.text} font-display font-bold text-amber-500`}>
        {points.toLocaleString()}
      </span>
    </motion.div>
  );
};

export default PointsCounter;
