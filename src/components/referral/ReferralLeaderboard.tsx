import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";

interface TopReferrer {
  user_id: string;
  name: string;
  avatar_url: string | null;
  invite_count: number;
  total_points: number;
}

interface ReferralLeaderboardProps {
  topReferrers: TopReferrer[];
  currentUserId?: string;
}

const ReferralLeaderboard = ({ topReferrers, currentUserId }: ReferralLeaderboardProps) => {
  const medals = ["🥇", "🥈", "🥉"];

  if (topReferrers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-bold">Top Referrers</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">Be the first to invite friends!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold">Top Referrers</h3>
      </div>
      <div className="space-y-2">
        {topReferrers.map((referrer, i) => (
          <motion.div
            key={referrer.user_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
              referrer.user_id === currentUserId
                ? "bg-primary/10 border border-primary/20"
                : "bg-secondary/60"
            }`}
          >
            <span className="text-lg w-7 text-center shrink-0">
              {i < 3 ? medals[i] : `#${i + 1}`}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              {referrer.avatar_url ? (
                <img src={referrer.avatar_url} alt={referrer.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {referrer.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {referrer.name}
                {referrer.user_id === currentUserId && (
                  <span className="text-[10px] text-primary ml-1">(you)</span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {referrer.invite_count} invite{referrer.invite_count !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-xs font-semibold text-primary">{referrer.total_points} pts</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReferralLeaderboard;
