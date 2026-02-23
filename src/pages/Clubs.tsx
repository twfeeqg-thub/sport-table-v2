import { useState } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import CountrySelector from "@/components/CountrySelector";
import FileUpload from "@/components/FileUpload";
import { FormField, StyledInput } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { checkDuplicate } from "@/lib/checkDuplicate";

const Clubs = () => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const exists = await checkDuplicate("clubs", name);
      if (exists) {
        toast({ title: "تحذير", description: "هذا الاسم موجود بالفعل", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("clubs").insert({
        name: name.trim(),
        country,
        logo_url: logo || null,
      });
      if (error) throw error;
      toast({ title: "تمت الإضافة", description: "تم إضافة النادي بنجاح" });
      setName(""); setCountry(""); setLogo("");
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold neon-text mb-1 flex items-center gap-3">
            <Shield className="w-7 h-7" />
            إدارة الأندية
          </h1>
          <p className="text-muted-foreground">إضافة أندية جديدة إلى النظام</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="اسم النادي" required>
              <StyledInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ريال مدريد"
              />
            </FormField>

            <CountrySelector value={country} onChange={setCountry} />

            <FileUpload
              bucket="assets"
              folder="clubs"
              onUpload={setLogo}
              label="شعار النادي"
              currentUrl={logo}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              إضافة النادي
            </Button>
          </form>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Clubs;
