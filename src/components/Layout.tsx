import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, CalendarDays, User } from "lucide-react";

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
    <div className="min-h-screen pb-20">
      {/* Main content */}
      <main className="p-4 max-w-2xl mx-auto">{children}</main>

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-primary/15 shadow-neon" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
