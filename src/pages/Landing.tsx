import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Check } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/chat", label: "Chat" },
  { to: "/login", label: "Login / Join" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-foreground">SkillSwap</span>
            <span className="text-xs text-muted-foreground -mt-0.5 hidden sm:block">Connect globally. Teach what you know. Learn what you need.</span>
          </div>
          <div className="flex items-center gap-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-sm text-muted-foreground mb-8">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Real-time skill exchange idea demo
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-bold tracking-tight leading-tight mb-6">
                Match with people who can{" "}
                <span className="text-gradient">teach you what you need</span>
              </h1>

              <p className="text-base text-muted-foreground max-w-lg mb-8 leading-relaxed">
                SkillSwap helps learners and mentors connect through mutual skill exchange.
                If you know Python and want C, the platform finds someone with the opposite need and opens a direct chat.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6" asChild>
                  <Link to="/dashboard">Start Matching</Link>
                </Button>
                <Button variant="outline" className="rounded-full border-border hover:border-foreground/30 px-6" asChild>
                  <Link to="/login">Join Free</Link>
                </Button>
                <Button variant="outline" className="rounded-full border-border hover:border-foreground/30 px-6" asChild>
                  <Link to="/login">Add Demo User</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {["SQL Backend Ready", "Matching Engine", "1:1 Chat UI", "Profile Builder"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs border border-border text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right column — match preview + activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {/* Match preview card */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Top recommended match</p>
                    <h3 className="font-display text-xl font-bold">
                      Sanjjay <span className="text-muted-foreground mx-1">↔</span> Arun
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-sm font-semibold border border-accent/30">
                    75% match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Left user */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">You teach</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Python", "Web Basics", "Problem Solving"].map((s) => (
                          <span key={s} className="px-3 py-1 rounded-full text-xs bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">You want to learn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["C", "DSA"].map((s) => (
                          <span key={s} className="px-3 py-1 rounded-full text-xs bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Right user */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Arun teaches</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["C", "C++", "Pointers"].map((s) => (
                          <span key={s} className="px-3 py-1 rounded-full text-xs bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Arun wants to learn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Python", "JavaScript"].map((s) => (
                          <span key={s} className="px-3 py-1 rounded-full text-xs bg-secondary border border-border text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold">Recent activity</h3>
                  <span className="text-xs text-muted-foreground">Live demo state</span>
                </div>
                <div className="space-y-2">
                  {["Welcome to SkillSwap", "Arun accepted your connection"].map((msg) => (
                    <div key={msg} className="px-4 py-3 rounded-xl bg-secondary/60 text-sm text-foreground">
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
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Create your profile",
                desc: "Add the skills you can teach, the skills you want to learn, your bio, and your availability.",
              },
              {
                title: "Get smart matches",
                desc: "The app finds users whose teaching skills align with your learning goals and vice versa.",
              },
              {
                title: "Chat and exchange",
                desc: "Once matched, users can connect through chat and schedule learning sessions together.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
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
