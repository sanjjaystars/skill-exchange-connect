import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, MessageSquare, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/feed", label: "Feed" },
    { to: "/sessions", label: "Sessions" },
    { to: "/leaderboard", label: "Board" },
    { to: "/chat", label: "Chat", badge: unreadCount },
    { to: "/profile", label: "Profile" },
  ];

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate("/login");
  }, [signOut, navigate]);

  const isActive = useCallback((to: string) => {
    return location.pathname === to || (to === "/chat" && location.pathname.startsWith("/chat"));
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <span className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
            SkillSwap
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, badge }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 btn-press",
                isActive(to)
                  ? "border-primary/50 text-primary bg-primary/10"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {label}
              {badge && badge > 0 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold"
                >
                  {badge > 99 ? "99+" : badge}
                </motion.span>
              ) : null}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-full text-sm font-medium border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 flex items-center gap-1.5 btn-press"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          {unreadCount > 0 && (
            <Link to="/chat" className="relative p-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors btn-press"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-3 space-y-1">
              {links.map(({ to, label, badge }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                      isActive(to)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    {label}
                    {badge && badge > 0 ? (
                      <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: links.length * 0.04 }}>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
