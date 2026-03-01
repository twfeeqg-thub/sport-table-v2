import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { checkDuplicate } from "@/lib/checkDuplicate";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import FileUpload from "@/components/FileUpload";
import { FormField, StyledInput } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Loader2, Trash2, Edit } from "lucide-react";
import SearchableSelector, { SelectorOption } from "@/components/SearchableSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Club {
  id: number;
  name_ar: string;
  country_code: string;
  logo_url: string;
  country_name?: string; // Made optional as it's not fetched directly
}

const Clubs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [countryOptions, setCountryOptions] = useState<SelectorOption[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<Club | null>(null);

  const fetchClubs = async () => {
    let query = supabase.from('teams').select('*');

    if (country) {
      query = query.eq('country_code', country);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching clubs:', error);
      toast({ title: "خطأ", description: "فشل في جلب قائمة الأندية", variant: "destructive" });
      setClubs([]);
      return;
    }
    
    setClubs(data || []);
  };

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

  useEffect(() => {
    fetchClubs();
  }, [country]);

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `clubs/${fileName}`;

    const { error } = await supabase.storage.from("assets").upload(filePath, file);
    if (error) throw new Error(`Failed to upload logo: ${error.message}`);

    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const resetForm = () => {
    setName("");
    setLogoFile(null);
    setEditingClub(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Login required", variant: "destructive" });
      return;
    }
    if (!name.trim() || !country || (!logoFile && !editingClub)) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة وتحميل الشعار", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (!editingClub) {
        const exists = await checkDuplicate("teams", "name_ar", name.trim());
        if (exists) {
          const overwrite = window.confirm("This name already exists. Do you want to overwrite it?");
          if (!overwrite) {
            setLoading(false);
            return;
          }
        }
      }

      let logoUrl = editingClub?.logo_url || '';
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }
      
      const upsertData: any = {
        name_ar: name.trim(),
        country_code: country,
        logo_url: logoUrl,
        user_id: user.id,
      };

      if (editingClub) {
        upsertData.id = editingClub.id;
      }

      const { error } = await supabase.from("teams").upsert(upsertData, { onConflict: editingClub ? "id" : "name_ar" });

      if (error) throw error;

      toast({ title: "تم بنجاح", description: editingClub ? "تم تحديث النادي بنجاح" : "تم إضافة النادي بنجاح" });
      resetForm();
      fetchClubs(); 
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setName(club.name_ar);
    setCountry(club.country_code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteDialog = (club: Club) => {
    setClubToDelete(club);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!clubToDelete) return;

    try {
      const { error } = await supabase.from('teams').delete().match({ id: clubToDelete.id });
      if (error) throw error;

      const logoPath = clubToDelete.logo_url.split('/').pop();
      if (logoPath) {
        await supabase.storage.from('assets').remove([`clubs/${logoPath}`]);
      }
      
      toast({ title: "تم الحذف", description: "تم حذف النادي بنجاح." });
      fetchClubs();
    } catch (error: any) {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    } finally {
        setIsDeleteDialogOpen(false);
        setClubToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold neon-text mb-1 flex items-center gap-3">
            <Shield className="w-7 h-7" />
            إدارة الأندية
          </h1>
          <p className="text-muted-foreground">إضافة أو تحديث الأندية في النظام</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <SearchableSelector
              options={countryOptions}
              value={country}
              onChange={setCountry}
              placeholder="اختر الدولة للتصفية والإضافة"
              searchPlaceholder="ابحث عن دولة..."
              emptyText="لم يتم العثور على دول."
              showLogo={true}
              className="h-12"
            />

            <FormField label="اسم النادي" required>
              <StyledInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ريال مدريد"
                disabled={!country}
              />
            </FormField>

            <FileUpload
              onFileChange={setLogoFile}
              label="شعار النادي"
              disabled={!name.trim()}
              previewUrl={logoFile ? URL.createObjectURL(logoFile) : (editingClub ? editingClub.logo_url : null)}
            />

            <Button type="submit" disabled={!country || !name.trim() || loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              {editingClub ? 'تحديث النادي' : 'إضافة النادي'}
            </Button>
             {editingClub && (
              <Button variant="outline" onClick={resetForm} className="w-full">
                إلغاء التعديل
              </Button>
            )}
          </form>
        </GlassCard>

        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">قائمة الأندية</h2>
            <GlassCard>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">الشعار</TableHead>
                    <TableHead>اسم النادي</TableHead>
                    <TableHead>رمز الدولة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell>
                        <img src={club.logo_url} alt={club.name_ar} className="w-10 h-10 object-contain rounded-full bg-white/10 p-1" />
                      </TableCell>
                      <TableCell className="font-medium">{club.name_ar}</TableCell>
                      <TableCell>{club.country_code}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(club)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(club)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
        </div>
      </div>
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف نادي '{clubToDelete?.name_ar}'؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>إلغاء</AlertDialogCancel>
            {/* [SYNTAX-FIX]: Corrected the closing tag from </Action> to </AlertDialogAction> */}
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Clubs;
