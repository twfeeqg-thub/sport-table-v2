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
import { Trophy, Plus, Loader2, Edit, Trash2 } from "lucide-react";
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

interface Tournament {
  id: number;
  name_ar: string;
  country_code: string;
  logo_url: string;
  countries: {
    name_ar: string;
  } | null;
}

const Tournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState<SelectorOption[]>([]);
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);

  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, countries(name_ar)');
    if (error) {
      console.error('Error fetching tournaments:', error);
      setTournaments([]);
      return;
    }
    setTournaments(data || []);
  };

  useEffect(() => {
    fetchTournaments();
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

    const { error: uploadError } = await supabase.storage.from("assets").upload(filePath, file);
    if (uploadError) throw new Error(`Failed to upload logo: ${uploadError.message}`);

    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data.publicUrl;
  };
  
  const resetForm = () => {
      setName("");
      setCountry("");
      setLogoFile(null);
      setEditingTournament(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Login required", variant: "destructive" });
      return;
    }
    if (!name.trim() || !country || (!logoFile && !editingTournament)) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة وتحميل الشعار", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (!editingTournament) {
          const exists = await checkDuplicate("tournaments", "name_ar", name.trim());
          if (exists) {
            const overwrite = window.confirm("This name already exists. Do you want to overwrite it?");
            if (!overwrite) {
              setLoading(false);
              return;
            }
          }
      }

      let logoUrl = editingTournament?.logo_url || '';
      if (logoFile) {
          logoUrl = await uploadLogo(logoFile);
      }

      const upsertData: any = {
        name_ar: name.trim(),
        country_code: country,
        logo_url: logoUrl,
        user_id: user.id,
      };

      if(editingTournament) {
          upsertData.id = editingTournament.id;
      }

      const { error } = await supabase.from("tournaments").upsert(upsertData, { onConflict: editingTournament ? "id" : "name_ar" });


      if (error) throw error;

      toast({ title: "تم بنجاح", description: editingTournament ? "تم تحديث البطولة بنجاح" : "تم إضافة البطولة بنجاح" });
      resetForm();
      fetchTournaments();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setName(tournament.name_ar);
    setCountry(tournament.country_code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteDialog = (tournament: Tournament) => {
    setTournamentToDelete(tournament);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tournamentToDelete) return;

    try {
      const { error } = await supabase.from('tournaments').delete().match({ id: tournamentToDelete.id });
      if (error) throw error;

      if (tournamentToDelete.logo_url) {
          const logoPath = tournamentToDelete.logo_url.split('/').slice(-2).join('/');
          if (logoPath) {
            await supabase.storage.from('assets').remove([logoPath]);
          }
      }
      
      toast({ title: "تم الحذف", description: "تم حذف البطولة بنجاح." });
      fetchTournaments();
    } catch (error: any) {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    } finally {
        setIsDeleteDialogOpen(false);
        setTournamentToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
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
              previewUrl={logoFile ? URL.createObjectURL(logoFile) : (editingTournament ? editingTournament.logo_url : null)}
            />

            <Button type="submit" disabled={!country || !name.trim() || loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              {editingTournament ? 'تحديث البطولة' : 'إضافة البطولة'}
            </Button>
            {editingTournament && (
                <Button variant="outline" onClick={resetForm} className="w-full">
                    إلغاء التعديل
                </Button>
            )}
          </form>
        </GlassCard>

        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">قائمة البطولات</h2>
            <GlassCard>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">الشعار</TableHead>
                    <TableHead>اسم البطولة</TableHead>
                    <TableHead>الدولة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell>
                        <img src={tournament.logo_url} alt={tournament.name_ar} className="w-10 h-10 object-contain rounded-full bg-white/10 p-1" />
                      </TableCell>
                      <TableCell className="font-medium">{tournament.name_ar}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://flagcdn.com/${tournament.country_code?.toLowerCase()}.svg`}
                            alt={tournament.countries?.name_ar || tournament.country_code}
                            className="w-6 h-4 object-cover rounded-sm"
                          />
                          <span>{tournament.countries?.name_ar || tournament.country_code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(tournament)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(tournament)}>
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
              هل أنت متأكد أنك تريد حذف بطولة '{tournamentToDelete?.name_ar}'؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Tournaments;
