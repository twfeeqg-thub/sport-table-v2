import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  bucket: string;
  folder?: string;
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
}

const FileUpload = ({ bucket, folder = "", onUpload, accept = "image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml", label = "رفع ملف", currentUrl }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${folder ? folder + "/" : ""}${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      
      setPreview(publicUrl);
      onUpload(publicUrl);
      toast({ title: "تم الرفع بنجاح", description: "تم رفع الملف بنجاح" });
    } catch (error: any) {
      toast({ title: "خطأ في الرفع", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
      <div className="glass-card p-4 flex flex-col items-center gap-3">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="معاينة" className="w-20 h-20 object-contain rounded-lg" />
            <button
              onClick={() => { setPreview(null); onUpload(""); }}
              className="absolute -top-2 -left-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-destructive-foreground" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border-border text-foreground"
        >
          <Upload className="w-4 h-4 ml-2" />
          {uploading ? "جاري الرفع..." : label}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
