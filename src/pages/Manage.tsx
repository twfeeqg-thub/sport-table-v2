import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import { Trophy, Shield, Tv, Mic } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { label: "البطولات", icon: Trophy, path: "/tournaments", desc: "إدارة البطولات والدوريات" },
  { label: "الأندية", icon: Shield, path: "/clubs", desc: "إدارة الأندية والفرق" },
  { label: "القنوات", icon: Tv, path: "/channels", desc: "إدارة القنوات الناقلة" },
  { label: "المعلقين", icon: Mic, path: "/commentators", desc: "إدارة المعلقين الرياضيين" },
];

const Manage = () => (
  <Layout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold neon-text mb-1">الإدارة</h1>
        <p className="text-muted-foreground">إدارة البيانات الأساسية للنظام</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <GlassCard hover className="flex items-center gap-4 cursor-pointer">
                <div className="w-12 h-12 rounded-xl gradient-neon flex items-center justify-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  </Layout>
);

export default Manage;
