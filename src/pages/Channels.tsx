import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SearchableSelector, { SelectorOption } from "@/components/SearchableSelector";
import FileUpload from "@/components/FileUpload";
import { FormField, StyledInput } from "@/components/FormComponents";
import { Button } from "@/components/ui/button";
import { Tv, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { checkDuplicate } from "@/lib/checkDuplicate";
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


// Interface for type safety
interface Channel {
  id: number;
  name_ar: string;
  country_code: string;
  logo_url: string;
  frequency: string;
  country_name: string;
}

const Channels = () => {
  const { toast } = useToast(); 
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [logo, setLogo] = useState("");
  const [frequency, setFrequency] = useState("");
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState<SelectorOption[]>([]);
  
  // New state for CRUD operations
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select('*');

    if (error) {
      console.error('Error fetching channels:', error);
      toast({ title: "خطأ", description: "فشل في جلب قائمة القنوات", variant: "destructive" });
      setChannels([]);
      return;
    }
    
    setChannels(data || []);
  };

  useEffect(() => {
    fetchChannels();
    
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
    const filePath = `channels/${fileName}`;

    const { error } = await supabase.storage.from("assets").upload(filePath, file);
    if (error) throw new Error(`Failed to upload logo: ${error.message}`);

    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const resetForm = () => {
    setName("");
    setCountry("");
    setLogo("");
    setFrequency("");
    setEditingChannel(null);
    setLogoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (!editingChannel) {
        const exists = await checkDuplicate("channels", "name_ar", name.trim());
        if (exists) {
          const overwrite = window.confirm("This name already exists. Do you want to overwrite it?");
          if (!overwrite) {
            setLoading(false);
            return;
          }
        }
      }

      let logoUrl = editingChannel?.logo_url || '';
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }
      
      const upsertData: any = {
        name_ar: name.trim(),
        country_code: country,
        logo_url: logoUrl,
        frequency: frequency.trim() || null,
      };

      if (editingChannel) {
        upsertData.id = editingChannel.id;
      }

      const { error } = await supabase.from("channels").upsert(upsertData, { onConflict: editingChannel ? "id" : "name_ar" });

      if (error) throw error;

      toast({ title: "تم بنجاح", description: editingChannel ? "تم تحديث القناة بنجاح" : "تم إضافة القناة بنجاح" });
      resetForm();
      fetchChannels(); 
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setName(channel.name_ar);
    setCountry(channel.country_code);
    setLogo(channel.logo_url || "");
    setFrequency(channel.frequency || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteDialog = (channel: Channel) => {
    setChannelToDelete(channel);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!channelToDelete) return;

    try {
      const { error } = await supabase.from('channels').delete().match({ id: channelToDelete.id });
      if (error) throw error;
      
      if (channelToDelete.logo_url) {
        const logoPath = channelToDelete.logo_url.split('/').slice(-2).join('/');
        if (logoPath) {
           await supabase.storage.from('assets').remove([logoPath]);
        }
      }

      toast({ title: "تم الحذف", description: "تم حذف القناة بنجاح." });
      fetchChannels();
    } catch (error: any) {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setChannelToDelete(null);
    }
  };


  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold neon-text mb-1 flex items-center gap-3">
            <Tv className="w-7 h-7" />
            إدارة القنوات
          </h1>
          <p className="text-muted-foreground">إضافة أو تحديث القنوات التلفزيونية</p>
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
              onFileChange={setLogoFile}
              label="شعار القناة"
              previewUrl={logoFile ? URL.createObjectURL(logoFile) : (editingChannel ? editingChannel.logo_url : null)}
            />

            <Button type="submit" disabled={loading || !name.trim() || !country} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
              {editingChannel ? 'تحديث القناة' : 'إضافة القناة'}
            </Button>
            {editingChannel && (
              <Button variant="outline" onClick={resetForm} className="w-full">
                إلغاء التعديل
              </Button>
            )}
          </form>
        </GlassCard>

        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">قائمة القنوات</h2>
            <GlassCard>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">الشعار</TableHead>
                    <TableHead>اسم القناة</TableHead>
                    <TableHead>الدولة</TableHead>
                    <TableHead>التردد</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell>
                        <img src={channel.logo_url} alt={channel.name_ar} className="w-10 h-10 object-contain rounded-full bg-white/10 p-1" />
                      </TableCell>
                      <TableCell className="font-medium">{channel.name_ar}</TableCell>
                      <TableCell>{channel.country_code}</TableCell>
                      <TableCell>{channel.frequency}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(channel)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(channel)}>
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
              هل أنت متأكد أنك تريد حذف قناة '{channelToDelete?.name_ar}'؟ لا يمكن التراجع عن هذا الإجراء.
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

export default Channels;
