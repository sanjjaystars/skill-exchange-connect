import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/chat", label: "Chat" },
    { to: "/profile", label: "Profile" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex flex-col group">
          <span className="font-display text-xl font-bold text-foreground">SkillSwap</span>
        </Link>

        <div className="flex items-center gap-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
                location.pathname === to
                  ? "border-primary/50 text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              )}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200 flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
