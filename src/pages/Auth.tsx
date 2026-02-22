import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      toast({ title: isLogin ? "تم تسجيل الدخول" : "تم إنشاء الحساب بنجاح" });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto animate-glow">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold neon-text">سبورت سي إم إس</h1>
          <p className="text-sm text-muted-foreground">نظام إدارة المحتوى الرياضي</p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex gap-2">
            <Button
              variant={isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsLogin(true)}
              type="button"
            >
              <LogIn className="w-4 h-4 ml-2" />
              دخول
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsLogin(false)}
              type="button"
            >
              <UserPlus className="w-4 h-4 ml-2" />
              تسجيل
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">الاسم</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="bg-secondary border-border"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="bg-secondary border-border"
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">كلمة المرور</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-secondary border-border"
                dir="ltr"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
