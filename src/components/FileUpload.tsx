import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Upload, X } from "lucide-react";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  label?: string;
  previewUrl?: string | null;
  disabled?: boolean;
}

const FileUpload = ({
  onFileChange,
  accept = "image/*",
  label = "Upload File",
  previewUrl,
  disabled = false,
}: FileUploadProps) => {
  const [internalPreview, setInternalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    if (previewUrl) {
      setInternalPreview(previewUrl);
    } else if (internalPreview?.startsWith("blob:")) {
      objectUrl = internalPreview;
      setInternalPreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (internalPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(internalPreview);
    }
    if (file) {
      const newObjectUrl = URL.createObjectURL(file);
      setInternalPreview(newObjectUrl);
      onFileChange(file);
    } else {
      setInternalPreview(null);
      onFileChange(null);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFileChange(null);
    setInternalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div
        className={`relative flex justify-center items-center w-full h-32 rounded-md border-2 border-dashed ${ disabled ? "bg-muted/50 border-muted-foreground/20 cursor-not-allowed" : "border-muted-foreground/50 bg-secondary hover:bg-muted transition-colors cursor-pointer"}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={accept}
          disabled={disabled}
        />
        {internalPreview ? (
          <>
            <img src={internalPreview} alt="File preview" className="h-full w-full object-contain rounded-md p-1" />
            {!disabled && (
              <Button onClick={handleRemove} variant="ghost" size="icon" className="absolute top-1 right-1 bg-background/50 backdrop-blur-sm rounded-full w-7 h-7">
                <X className="w-4 h-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <Upload className="mx-auto h-8 w-8" />
            <p className="mt-1 text-xs">Click to browse or drag and drop</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;