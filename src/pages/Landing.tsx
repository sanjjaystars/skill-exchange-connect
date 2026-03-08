import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Users, MessageSquare, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-xl font-bold text-gradient">SkillSwap</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap className="h-3.5 w-3.5" />
              Trade skills, grow together
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6">
              Learn anything by{" "}
              <span className="text-gradient">teaching</span>{" "}
              what you know
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              SkillSwap connects you with people around the world for knowledge exchange.
              You teach what you know, learn what you want — no money needed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base" asChild>
                <Link to="/login">
                  Start Swapping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border hover:border-primary/50 hover:bg-primary/5" asChild>
                <Link to="/dashboard">Explore Matches</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-display font-bold text-center mb-16"
          >
            How it works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Create your profile",
                desc: "List the skills you can teach and the ones you want to learn.",
                color: "primary",
              },
              {
                icon: Zap,
                title: "Get matched",
                desc: "Our algorithm finds the best skill-swap partners for you.",
                color: "accent",
              },
              {
                icon: MessageSquare,
                title: "Start learning",
                desc: "Connect via chat and schedule your knowledge exchange sessions.",
                color: "primary",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-xl p-6 text-center group hover:glow-primary transition-all duration-500"
              >
                <div className={`h-14 w-14 rounded-xl bg-${step.color}/15 flex items-center justify-center mx-auto mb-5`}>
                  <step.icon className={`h-6 w-6 text-${step.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-12 glow-primary"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Ready to <span className="text-gradient">swap</span>?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of learners exchanging skills every day.
            </p>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 text-base" asChild>
              <Link to="/login">
                Join SkillSwap
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold">SkillSwap</span>
          </div>
          <p>© 2026 SkillSwap. Learn by teaching.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
