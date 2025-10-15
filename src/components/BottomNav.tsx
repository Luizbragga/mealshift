import { Home, History, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { hapticLight } from "@/lib/haptics";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = async (path: string) => {
    await hapticLight();
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => handleNav("/home")}
          className={`flex flex-col items-center gap-1 min-touch px-4 transition-colors ${
            isActive("/home") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Today</span>
        </button>

        <button
          onClick={() => handleNav("/historico")}
          className={`flex flex-col items-center gap-1 min-touch px-4 transition-colors ${
            isActive("/historico") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <History size={24} />
          <span className="text-xs font-medium">History</span>
        </button>

        <button
          onClick={() => handleNav("/lembretes")}
          className={`flex flex-col items-center gap-1 min-touch px-4 transition-colors ${
            isActive("/lembretes") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Bell size={24} />
          <span className="text-xs font-medium">Reminders</span>
        </button>
      </div>
    </nav>
  );
}
