import GlassCard from "@/components/GlassCard";
import Layout from "@/components/Layout";
import { Trophy, Shield, Tv, Mic, CalendarDays, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "البطولات", icon: Trophy, path: "/tournaments", color: "text-primary" },
  { label: "الأندية", icon: Shield, path: "/clubs", color: "text-success" },
  { label: "القنوات", icon: Tv, path: "/channels", color: "text-warning" },
  { label: "المعلقين", icon: Mic, path: "/commentators", color: "text-neon-glow" },
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في نظام إدارة المحتوى الرياضي</p>
        </div>

        {/* Quick access cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.path} to={stat.path}>
                <GlassCard hover className="flex items-center gap-4 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl gradient-neon flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إدارة</p>
                    <p className="text-lg font-bold text-foreground">{stat.label}</p>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>

        {/* Scheduler quick access */}
        <Link to="/scheduler">
          <GlassCard hover className="gradient-neon cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center animate-glow">
                <CalendarDays className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">مجدول المباريات</h2>
                <p className="text-sm text-muted-foreground">إنشاء وإرسال جداول المباريات بضغطة زر</p>
              </div>
              <Zap className="w-6 h-6 text-primary animate-pulse-neon" />
            </div>
          </GlassCard>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
