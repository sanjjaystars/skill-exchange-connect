import { motion } from "framer-motion";
import { UserPlus, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Referral {
  created_at: string;
  reward_points: number;
  status: string;
  name: string;
  avatar_url: string | null;
}

interface ReferralHistoryProps {
  referrals: Referral[];
}

const ReferralHistory = ({ referrals }: ReferralHistoryProps) => {
  if (referrals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 sm:p-6"
      >
        <h3 className="font-display text-lg font-bold mb-3">Referral History</h3>
        <div className="text-center py-6">
          <UserPlus className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No referrals yet. Share your code to get started!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-5 sm:p-6"
    >
      <h3 className="font-display text-lg font-bold mb-3">Referral History</h3>
      <div className="space-y-2">
        {referrals.map((ref, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/60"
          >
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              {ref.avatar_url ? (
                <img src={ref.avatar_url} alt={ref.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {ref.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ref.name} joined using your code</p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(ref.created_at), { addSuffix: true })}
              </div>
            </div>
            <span className="text-xs font-semibold text-primary">+{ref.reward_points} pts</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReferralHistory;
