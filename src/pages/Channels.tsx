import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
// [PURGE-FIX] Explicitly importing SelectorOption for absolute type safety.
import SearchableSelector, { SelectorOption } from "@/components/SearchableSelector";
import FileUpload from "@/components/FileUpload";
// [PURGE-FIX] Corrected and verified import path for Form components.
import { FormField, StyledInput } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { Tv, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { checkDuplicate } from "@/lib/checkDuplicate";

const Channels = () => {
  const { toast } = useToast(); 
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [logo, setLogo] = useState("");
  const [frequency, setFrequency] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const exists = await checkDuplicate("channels", "name_ar", name.trim());
      if (exists) {
        toast({ title: "تحذير", description: "هذا الاسم موجود بالفعل", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("channels").insert({
        name_ar: name.trim(),
        country_code: country,
        logo_url: logo || null,
        frequency: frequency.trim() || null,
      });
      if (error) throw error;
      toast({ title: "تمت الإضافة", description: "تم إضافة القناة بنجاح" });
      setName(""); setCountry(""); setLogo(""); setFrequency("");
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
            <Tv className="w-7 h-7" />
            إدارة القنوات
          </h1>
          <p className="text-muted-foreground">إضافة قنوات تلفزيونية جديدة</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="اسم القناة" required>
              <StyledInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: بي إن سبورتس"
              />
            </FormField>

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

            <FormField label="التردد">
              <StyledInput
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="مثال: 11919 / عمودي / 27500"
              />
            </FormField>

            <FileUpload
              bucket="assets"
              folder="channels"
              onUpload={setLogo}
              label="شعار القناة"
              currentUrl={logo}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              إضافة القناة
            </Button>
          </form>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Channels;
