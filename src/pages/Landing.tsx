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
                      Sanjjay <span className="text-muted-foreground mx-1">↔</span> Prince
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
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold">SkillSwap</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase">Built by DarkSyntax-Sanjjay</p>
            <div className="flex items-center gap-2">
              <a href="https://www.linkedin.com/in/sanjjay-aroumougam-43a919382/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary transition-colors" aria-label="LinkedIn">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.instagram.com/blaze._xr/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary transition-colors" aria-label="Instagram">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="tel:+918608948946" className="text-muted-foreground/50 hover:text-primary transition-colors text-[10px]">
                +91 8608948946
              </a>
            </div>
          </div>
          <p className="text-xs">© 2026 SkillSwap</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
