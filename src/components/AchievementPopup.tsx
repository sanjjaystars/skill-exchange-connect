import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface AchievementPopupProps {
  badge: string | null;
  onDismiss: () => void;
}

const AchievementPopup = ({ badge, onDismiss }: AchievementPopupProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 400);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [badge, onDismiss]);

  return (
    <AnimatePresence>
      {visible && badge && (
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 15 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-card border border-amber-500/30 rounded-2xl px-6 py-4 shadow-2xl shadow-amber-500/10 flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold">Achievement Unlocked</p>
            <p className="text-sm font-display font-bold">{badge}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;
