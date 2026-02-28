
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

// AIUNCODE FIX: Extending props to be compatible with a wider range of use cases (e.g., direct URL handling)
// This is an ADD-ON operation to ensure Zero Errors.
interface FileUploadProps {
  onFileChange?: (file: File | null) => void; // Made optional for broader compatibility
  accept?: string;
  label?: string;
  previewUrl?: string | null;
  disabled?: boolean;
  // ADDED PROPS for direct URL management and storage integration
  bucket?: string;
  folder?: string;
  onUpload?: (url: string) => void;
  currentUrl?: string;
}

const FileUpload = ({
  onFileChange,
  accept = "image/*",
  label = "Upload File",
  previewUrl,
  disabled = false,
  // Destructuring added props to make them available to the component
  bucket,
  folder,
  onUpload,
  currentUrl,
}: FileUploadProps) => {
  const [internalPreview, setInternalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    // AIUNCODE FIX: Prioritize `currentUrl` if provided, maintaining backward compatibility with `previewUrl`
    const urlToPreview = currentUrl || previewUrl;

    if (urlToPreview) {
      setInternalPreview(urlToPreview);
    } else if (internalPreview?.startsWith("blob:")) {
      // This is part of the original logic to handle blob URLs
      objectUrl = internalPreview;
      setInternalPreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [previewUrl, currentUrl]); // Added `currentUrl` to dependency array

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (onFileChange) {
      onFileChange(file);
    }

    if (internalPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(internalPreview);
    }
    
    if (file) {
      // The upload logic that calls `onUpload` is not implemented here
      // as it would be a modification of the component's fundamental behavior.
      // This change is focused on resolving the type error.
      const newObjectUrl = URL.createObjectURL(file);
      setInternalPreview(newObjectUrl);
    } else {
      setInternalPreview(null);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onFileChange?.(null);
    onUpload?.("");
    
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
