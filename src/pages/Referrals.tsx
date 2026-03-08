import Navbar from "@/components/Navbar";
import InviteCard from "@/components/referral/InviteCard";
import ReferralHistory from "@/components/referral/ReferralHistory";
import ReferralLeaderboard from "@/components/referral/ReferralLeaderboard";
import { useReferral } from "@/hooks/useReferral";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const Referrals = () => {
  const { user } = useAuth();
  const { stats, loading, getReferralLink } = useReferral();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-20 pb-12 px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Invite & Earn</h1>
          <p className="text-sm text-muted-foreground">
            Share your referral code and earn <span className="text-primary font-medium">100 points</span> per friend who joins
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading referral data...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <InviteCard
                referralCode={stats.referral_code}
                referralLink={getReferralLink()}
                totalReferrals={stats.total_referrals}
                totalPoints={stats.total_points}
              />
              <ReferralHistory referrals={stats.recent_referrals} />
            </div>
            <div>
              <ReferralLeaderboard
                topReferrers={stats.top_referrers}
                currentUserId={user?.id}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Referrals;
