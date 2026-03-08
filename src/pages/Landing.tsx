import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Check } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/login", label: "Login / Join" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-foreground">SkillSwap</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5 hidden md:block">Connect globally. Teach what you know.</span>
          </div>
          <div className="flex items-center gap-1.5">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs sm:text-sm text-muted-foreground mb-6">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Real-time skill exchange
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-display font-bold tracking-tight leading-tight mb-5">
                Match with people who can{" "}
                <span className="text-gradient">teach you what you need</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mb-6 leading-relaxed">
                SkillSwap helps learners and mentors connect through mutual skill exchange.
                Find someone with the skills you need and start learning together.
              </p>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-5">
                <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 h-10" asChild>
                  <Link to="/dashboard">Start Matching</Link>
                </Button>
                <Button variant="outline" className="rounded-full border-border hover:border-foreground/30 px-5 h-10" asChild>
                  <Link to="/login">Join Free</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {["SQL Backend", "Matching Engine", "1:1 Chat", "Profile Builder"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] border border-border text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-3"
            >
              {/* Match preview card */}
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Top recommended match</p>
                    <h3 className="font-display text-lg sm:text-xl font-bold">
                      Sanjjay <span className="text-muted-foreground mx-1">↔</span> Arun
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs sm:text-sm font-semibold border border-accent/30">
                    75% match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">You teach</p>
                      <div className="flex flex-wrap gap-1">
                        {["Python", "Web Basics"].map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">You want</p>
                      <div className="flex flex-wrap gap-1">
                        {["C", "DSA"].map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Arun teaches</p>
                      <div className="flex flex-wrap gap-1">
                        {["C", "C++"].map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Arun wants</p>
                      <div className="flex flex-wrap gap-1">
                        {["Python", "JS"].map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-[11px] bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base sm:text-lg font-bold">Recent activity</h3>
                  <span className="text-[10px] text-muted-foreground">Live</span>
                </div>
                <div className="space-y-1.5">
                  {["Welcome to SkillSwap", "Arun accepted your connection"].map((msg) => (
                    <div key={msg} className="px-3 py-2.5 rounded-xl bg-secondary/60 text-sm text-foreground">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "Create your profile",
                desc: "Add the skills you can teach, what you want to learn, and your availability.",
              },
              {
                title: "Get smart matches",
                desc: "The app finds users whose skills align with your learning goals.",
              },
              {
                title: "Chat and exchange",
                desc: "Connect through real-time chat and schedule learning sessions.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-5 sm:p-6"
              >
                <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold">SkillSwap</span>
          </div>
          <p className="text-xs">© 2026 SkillSwap</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
