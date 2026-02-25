import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, CalendarDays, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

const bottomNavItems = [
  { path: "/", label: "الرئيسية", icon: Home },
  { path: "/manage", label: "الإدارة", icon: ClipboardList },
  { path: "/scheduler", label: "المجدول", icon: CalendarDays },
  { path: "/profile", label: "حسابي", icon: User },
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-inter">
      <header className="fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-lg border-b border-white/5">
         <div className="max-w-2xl mx-auto flex justify-between items-center p-4">
            <div>
              {/* Potentially a logo here in the future */}
            </div>
            <ThemeToggle />
         </div>
      </header>
      
      <main className="pt-20 px-4 max-w-2xl mx-auto">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                  active
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`transition-all duration-300 ${active ? "shadow-neon" : ""}`}>
                   <Icon className={`w-6 h-6 transition-all duration-300 ${active ? "-translate-y-1" : ""}`} />
                </div>
                <span className="text-[11px] font-bold tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
