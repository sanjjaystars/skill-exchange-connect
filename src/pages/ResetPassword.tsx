import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Check hash for recovery token
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-2xl font-bold text-gradient">SkillSwap</span>
        </div>

        <div className="glass rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Password updated!</h2>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-center mb-2">Set new password</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Enter your new password below
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-muted-foreground">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-secondary border-border focus:border-primary/50"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm text-muted-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-secondary border-border focus:border-primary/50"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
