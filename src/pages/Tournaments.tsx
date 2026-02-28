import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
// [ALIGNMENT-FIX] Corrected import path based on mandatory exploration.
import { checkDuplicate } from "@/lib/checkDuplicate";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import FileUpload from "@/components/FileUpload";
import { FormField, StyledInput } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, Loader2 } from "lucide-react";
import SearchableSelector, { SelectorOption } from "@/components/SearchableSelector";

const Tournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState<SelectorOption[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase.from("countries").select("code, name_ar");
      if (error) {
        console.error("Error fetching countries:", error);
        return;
      }
      const options = data.map((c) => ({ 
        value: c.code, 
        label: c.name_ar, 
        logo_url: `https://flagcdn.com/w320/${c.code.toLowerCase()}.png` 
      }));
      setCountryOptions(options as SelectorOption[]);
    };
    fetchCountries();
  }, []);

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `tournaments/${fileName}`;

    const { error } = await supabase.storage.from("assets").upload(filePath, file);
    if (error) throw new Error(`Failed to upload logo: ${error.message}`);

    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Login required", variant: "destructive" });
      return;
    }
    if (!name.trim() || !country || !logoFile) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة وتحميل الشعار", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const exists = await checkDuplicate("tournaments", "name_ar", name.trim());
      if (exists) {
        const overwrite = window.confirm("This name already exists. Do you want to overwrite it?");
        if (!overwrite) {
          setLoading(false);
          return;
        }
      }

      const logoUrl = await uploadLogo(logoFile);

      const { error } = await supabase.from("tournaments").upsert(
        {
          name_ar: name.trim(),
          country_code: country,
          logo_url: logoUrl,
          user_id: user.id,
        },
        { onConflict: "name_ar" }
      );

      if (error) throw error;

      toast({ title: "تم بنجاح", description: exists ? "تم تحديث البطولة بنجاح" : "تم إضافة البطولة بنجاح" });
      setName("");
      setCountry("");
      setLogoFile(null);
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
            <Trophy className="w-7 h-7" />
            إدارة البطولات
          </h1>
          <p className="text-muted-foreground">إضافة أو تحديث البطولات في النظام</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <SearchableSelector
              options={countryOptions}
              value={country}
              onChange={setCountry}
              placeholder="اختر الدولة"
              searchPlaceholder="ابحث عن دولة..."
              emptyText="لم يتم العثور على دول."
              showLogo={true}
              className="h-12"
            />

            <FormField label="اسم البطولة" required>
              <StyledInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: دوري أبطال أوروبا"
                disabled={!country}
              />
            </FormField>

            <FileUpload
              onFileChange={setLogoFile}
              label="شعار البطولة"
              disabled={!name.trim()}
              previewUrl={logoFile ? URL.createObjectURL(logoFile) : null}
            />

            <Button type="submit" disabled={!country || !name.trim() || !logoFile || loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              إضافة / تحديث البطولة
            </Button>
          </form>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Tournaments;
