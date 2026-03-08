import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Password reset email sent!");
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
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-2xl font-bold text-gradient">SkillSwap</span>
        </Link>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
              </p>
              <Link to="/login">
                <Button variant="outline" className="rounded-full">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold text-center mb-2">Forgot password?</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-secondary border-border focus:border-primary/50"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="h-3 w-3 inline mr-1" /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
