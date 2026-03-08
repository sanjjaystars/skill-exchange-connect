import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, MessageSquare, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/sessions", label: "Sessions" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/chat", label: "Chat", badge: unreadCount },
    { to: "/profile", label: "Profile" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <span className="font-display text-lg font-bold text-foreground">SkillSwap</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1.5">
          {links.map(({ to, label, badge }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                location.pathname === to || (to === "/chat" && location.pathname.startsWith("/chat"))
                  ? "border-primary/50 text-primary bg-primary/10"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {label}
              {badge && badge > 0 ? (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold animate-scale-in">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="sm:hidden flex items-center gap-2">
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
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border/40 bg-background/95 backdrop-blur-md animate-fade-in">
          <div className="p-3 space-y-1">
            {links.map(({ to, label, badge }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                  location.pathname === to || (to === "/chat" && location.pathname.startsWith("/chat"))
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
            ))}
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
