
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
      toast({ title: isLogin ? "تم تسجيل الدخول" : "تم إنشاء الحساب بنجاح. يرجى مراجعة بريدك الإلكتروني للتفعيل." });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "مرحباً بعودتك!" : "حساب جديد للوصول للميزات الكاملة"}
          </p>
        </div>

        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className="bg-secondary border-border"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
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
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="bg-secondary border-border"
                dir="ltr"
                required
              />
            </div>

            {/* ADD-ON: Privacy Policy Checkbox and Link injected into the form */}
            {!isLogin && (
                <div className="flex items-center space-x-2 space-x-reverse pt-2">
                    <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
                    <Label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        أوافق على{" "}
                        <Link to="/privacy-policy" target="_blank" className="underline text-primary hover:text-primary/80">
                        سياسة الخصوصية وشروط الاستخدام
                        </Link>
                    </Label>
                </div>
            )}

            {/* FIX: Button is now correctly disabled based on the 'agreed' state */}
            <Button type="submit" className="w-full" disabled={loading || (!isLogin && !agreed)}>
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm">
            {isLogin ? "ليس لديك حساب؟" : "هل لديك حساب بالفعل؟"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? "أنشئ حساباً" : "سجل الدخول"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
