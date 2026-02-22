import GlassCard from "@/components/GlassCard";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Zap, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || "مستخدم";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold neon-text mb-1">مرحباً، {displayName} 👋</h1>
          <p className="text-sm text-muted-foreground">لوحة التحكم الرياضية</p>
        </div>

        {/* Quick actions */}
        <Link to="/scheduler">
          <GlassCard hover className="gradient-neon cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center animate-glow">
                <CalendarDays className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">مجدول المباريات</h2>
                <p className="text-xs text-muted-foreground">إنشاء وإرسال جداول المباريات</p>
              </div>
              <Zap className="w-5 h-5 text-primary animate-pulse-neon" />
            </div>
          </GlassCard>
        </Link>

        <Link to="/manage">
          <GlassCard hover className="cursor-pointer mt-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">إدارة البيانات</h2>
                <p className="text-xs text-muted-foreground">بطولات، أندية، قنوات، معلقين</p>
              </div>
            </div>
          </GlassCard>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
