import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import FileUpload from "@/components/FileUpload";
import { FormField, StyledInput } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { Mic, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { checkDuplicate } from "@/lib/checkDuplicate";
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

interface Commentator {
  id: number;
  name_ar: string;
  country_code: string;
  image_url: string;
  country_name: string;
}

const Commentators = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState<SelectorOption[]>([]);

  const [commentators, setCommentators] = useState<Commentator[]>([]);
  const [editingCommentator, setEditingCommentator] = useState<Commentator | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentatorToDelete, setCommentatorToDelete] = useState<Commentator | null>(null);

  const fetchCommentators = async () => {
    const { data, error } = await supabase
      .from('commentators')
      .select('*, country:countries( name_ar, code )');
    if (error) {
      console.error('Error fetching commentators:', error);
      return;
    }
    const mappedData = data.map(d => ({...d, country_name: d.country.name_ar, country_code: d.country.code}));
    setCommentators(mappedData as any);
  };

  useEffect(() => {
    fetchCommentators();
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `commentators/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("assets").upload(filePath, file);
    if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);

    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const resetForm = () => {
    setName("");
    setCountry("");
    setImageFile(null);
    setEditingCommentator(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "Login required", variant: "destructive" });
      return;
    }
    if (!name.trim() || !country) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (!editingCommentator) {
        const exists = await checkDuplicate("commentators", "name_ar", name.trim());
        if (exists) {
          const overwrite = window.confirm("This name already exists. Do you want to overwrite it?");
          if (!overwrite) {
            setLoading(false);
            return;
          }
        }
      }

      let imageUrl = editingCommentator?.image_url || '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const upsertData: any = {
        name_ar: name.trim(),
        country_code: country,
        image_url: imageUrl,
        user_id: user.id,
      };

      if (editingCommentator) {
        upsertData.id = editingCommentator.id;
      }

      const { error } = await supabase.from("commentators").upsert(upsertData, { onConflict: editingCommentator ? "id" : "name_ar" });
      if (error) throw error;
      toast({ title: "تم بنجاح", description: editingCommentator ? "تم تحديث المعلق بنجاح" : "تم إضافة المعلق بنجاح" });
      resetForm();
      fetchCommentators();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (commentator: Commentator) => {
    setEditingCommentator(commentator);
    setName(commentator.name_ar);
    setCountry(commentator.country_code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteDialog = (commentator: Commentator) => {
    setCommentatorToDelete(commentator);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!commentatorToDelete) return;

    try {
      const { error } = await supabase.from('commentators').delete().match({ id: commentatorToDelete.id });
      if (error) throw error;

      if (commentatorToDelete.image_url) {
        const imagePath = commentatorToDelete.image_url.split('/').slice(-2).join('/');
        if (imagePath) {
          await supabase.storage.from('assets').remove([imagePath]);
        }
      }
      
      toast({ title: "تم الحذف", description: "تم حذف المعلق بنجاح." });
      fetchCommentators();
    } catch (error: any) {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    } finally {
        setIsDeleteDialogOpen(false);
        setCommentatorToDelete(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold neon-text mb-1 flex items-center gap-3">
            <Mic className="w-7 h-7" />
            إدارة المعلقين
          </h1>
          <p className="text-muted-foreground">إضافة أو تحديث المعلقين في النظام</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="اسم المعلق" required>
              <StyledInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: عصام الشوالي"
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

            <FileUpload
              onFileChange={setImageFile}
              label="صورة المعلق (اختياري)"
              previewUrl={imageFile ? URL.createObjectURL(imageFile) : (editingCommentator ? editingCommentator.image_url : null)}
            />

            <Button type="submit" disabled={loading || !name.trim() || !country} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              {editingCommentator ? 'تحديث المعلق' : 'إضافة المعلق'}
            </Button>
             {editingCommentator && (
              <Button variant="outline" onClick={resetForm} className="w-full">
                إلغاء التعديل
              </Button>
            )}
          </form>
        </GlassCard>

        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">قائمة المعلقين</h2>
             <GlassCard>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">الصورة</TableHead>
                    <TableHead>اسم المعلق</TableHead>
                    <TableHead>الدولة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commentators.map((commentator) => (
                    <TableRow key={commentator.id}>
                      <TableCell>
                        <img src={commentator.image_url || 'https://placehold.co/96x96/000000/FFFFFF/png?text=?'} alt={commentator.name_ar} className="w-10 h-10 object-cover rounded-full bg-white/10 p-1" />
                      </TableCell>
                      <TableCell className="font-medium">{commentator.name_ar}</TableCell>
                      <TableCell>{commentator.country_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(commentator)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(commentator)}>
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
              هل أنت متأكد أنك تريد حذف المعلق '{commentatorToDelete?.name_ar}'؟ لا يمكن التراجع عن هذا الإجراء.
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

export default Commentators;