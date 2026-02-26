
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, Trash2, Save, Wand2, ShieldAlert, LogOut, Mail, Info } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
    full_name: string;
    avatar_url: string;
    fb_url: string | null;
    tw_url: string | null;
    snap_url: string | null;
    insta_url: string | null;
    tele_url: string | null;
    wa_url: string | null;
    main_social_platform: string | null;
}

const socialPlatforms = [
  { id: "fb_url", name: "Facebook" },
  { id: "tw_url", name: "Twitter / X" },
  { id: "snap_url", name: "Snapchat" },
  { id: "insta_url", name: "Instagram" },
  { id: "tele_url", name: "Telegram" },
  { id: "wa_url", name: "WhatsApp" },
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, fb_url, tw_url, snap_url, insta_url, tele_url, wa_url, main_social_platform")
          .eq("id", user.id)
          .single();

        if (error && error.code === 'PGRST116') {
            console.log("No profile found, creating a new one.");
            const newUserFullName = user.email?.split('@')[0] || 'New User';
            // FIX: Removed non-existent 'updated_at' column from insert
            const { data: newData, error: insertError } = await supabase
                .from('profiles')
                .insert({ id: user.id, full_name: newUserFullName } as any)
                .select('*')
                .single();
            
            if (insertError) throw insertError;
            data = newData;
        } else if (error) {
            throw error;
        }

        if (data) {
          setProfile(data as Profile);
          setFormData(data as Profile);
        }

      } catch (error: any) {
        toast({ title: "خطأ في جلب البيانات", description: error.message, variant: "destructive" });
        console.error("Error fetching profile:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (field: keyof Profile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      // FIX: Removed non-existent 'updated_at' column from update
      const updateData = { ...formData };

      const { error } = await supabase
        .from("profiles")
        .update(updateData as any)
        .eq("id", user.id);

      if (error) throw error;
      setProfile(prev => ({ ...prev, ...updateData } as Profile));
      toast({ title: "تم بنجاح", description: "تم تحديث بيانات حسابك بنجاح." });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;
    setUpdating(true);
    try {
        const file = event.target.files[0];
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const newAvatarUrl = urlData.publicUrl;

        const { error: dbError } = await supabase.from('profiles').update({ avatar_url: newAvatarUrl } as any).eq('id', user.id);
        if (dbError) throw dbError;

        const updatedProfile = { ...profile, avatar_url: newAvatarUrl } as Profile;
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        toast({ title: 'تم بنجاح', description: 'تم تحديث الصورة الرمزية.' });
    } catch (error: any) {
        toast({ title: 'فشل رفع الصورة', description: `خطأ: ${error.message}. يرجى التأكد من تفعيل صلاحيات الرفع (Storage Policies) في لوحة تحكم Supabase`, variant: 'destructive' });
    } finally {
        setUpdating(false);
    }
  };

  const handleResetSocial = async () => {
    if (!user) return;
    const resetData = { fb_url: null, tw_url: null, snap_url: null, insta_url: null, tele_url: null, wa_url: null, main_social_platform: null };
    setFormData(prev => ({...prev, ...resetData}));
    toast({ title: 'تم المسح', description: 'تم مسح البيانات الاجتماعية. انقر على "حفظ" لتأكيد التغييرات.' });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) { throw new Error(`RPC Error: ${error.message}`); }
      toast({ title: "تم حذف الحساب", description: "نأسف لرحيلك. سيتم تسجيل خروجك الآن." });
      setTimeout(() => signOut(), 2000);
    } catch (error: any) {
        toast({ title: "خطأ فادح", description: `فشل حذف الحساب: ${error.message}`, variant: "destructive" });
        setUpdating(false);
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">إعدادات الحساب</h1>
            <Button variant="outline" onClick={signOut} disabled={updating}><LogOut className="ml-2 w-4 h-4"/> تسجيل الخروج</Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User /> الحساب الشخصي</CardTitle>
                <CardDescription>إدارة بيانات حسابك الأساسية وصورة العرض.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <div className="space-y-2 text-center">
                      <Avatar className="h-24 w-24 border-2 border-primary mx-auto">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="text-3xl">{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <Label htmlFor="avatar-upload" className={`inline-block px-4 py-2 rounded-md cursor-pointer ${updating ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>تغيير الصورة</Label>
                      <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={updating}/>
                    </div>
                    <div className="space-y-4 flex-grow">
                      <div className="space-y-1.5">
                          <Label htmlFor="full_name">الاسم الكامل</Label>
                          <Input id="full_name" value={formData.full_name || ''} onChange={(e) => handleInputChange('full_name', e.target.value)} disabled={updating} />
                      </div>
                      <div className="space-y-1.5">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="email" value={user?.email || ''} readOnly disabled className="pl-10 bg-muted/50" />
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="w-3 h-3"/> يتم إدارته عبر نظام الأمان.</p>
                      </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">المصفوفة الاجتماعية</CardTitle>
                <CardDescription>إدارة الروابط الاجتماعية التي تظهر في ملفك الشخصي.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {socialPlatforms.map(p => (
                        <div className="space-y-1.5" key={p.id}>
                            <Label htmlFor={p.id}>{p.name}</Label>
                            <Input id={p.id} value={formData[p.id as keyof Profile] || ''} onChange={(e) => handleInputChange(p.id as keyof Profile, e.target.value)} placeholder={`رابط صفحتك على ${p.name}`} disabled={updating} dir="ltr"/>
                        </div>
                    ))}
                </div>
                <div className="space-y-1.5">
                    <Label>المنصة الاجتماعية الأساسية</Label>
                    <Select value={formData.main_social_platform || ''} onValueChange={(value) => handleInputChange('main_social_platform', value)} disabled={updating}>
                        <SelectTrigger><SelectValue placeholder="اختر المنصة التي تفضلها للتواصل" /></SelectTrigger>
                        <SelectContent>
                            {socialPlatforms.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Button variant="ghost" onClick={handleResetSocial} disabled={updating}><Wand2 className="ml-2 w-4 h-4"/>مسح البيانات الاجتماعية</Button>
                <Button onClick={handleUpdateProfile} disabled={updating}>
                    {updating && <Loader2 className="ml-2 w-4 h-4 animate-spin"/>} 
                    <Save className="ml-2 w-4 h-4"/> حفظ كل التغييرات
                </Button>
            </CardFooter>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert/> منطقة الخطر</CardTitle>
                <CardDescription>الإجراءات التالية لا يمكن التراجع عنها. يرجى المتابعة بحذر.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" disabled={updating}><Trash2 className="ml-2 w-4 h-4"/> حذف الحساب نهائياً</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                            <AlertDialogDescription>هذا الإجراء سيقوم بحذف حسابك بالكامل بما في ذلك جميع بياناتك الشخصية والاجتماعية بشكل نهائي. لا يمكن التراجع عن هذا القرار.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">نعم، أحذف حسابي</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>

      </div>
    </Layout>
  );
};

export default ProfilePage;
