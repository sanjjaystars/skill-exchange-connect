import { useState } from "react";
import { Copy, Check, Share2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface InviteCardProps {
  referralCode: string | null;
  referralLink: string;
  totalReferrals: number;
  totalPoints: number;
}

const InviteCard = ({ referralCode, referralLink, totalReferrals, totalPoints }: InviteCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join SkillSwap",
          text: `Join me on SkillSwap and start exchanging skills! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">Invite Friends</h3>
          <p className="text-xs text-muted-foreground">Earn 100 points per invite</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-secondary/60 p-3 text-center">
          <p className="text-2xl font-display font-bold text-primary">{totalReferrals}</p>
          <p className="text-[11px] text-muted-foreground">Friends Joined</p>
        </div>
        <div className="rounded-xl bg-secondary/60 p-3 text-center">
          <p className="text-2xl font-display font-bold text-accent">{totalPoints}</p>
          <p className="text-[11px] text-muted-foreground">Points Earned</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border font-mono text-sm font-semibold tracking-wider text-foreground">
              {referralCode || "Loading..."}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={referralLink}
              className="bg-secondary border-border text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 h-9 text-sm border-border"
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share Invite
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default InviteCard;
