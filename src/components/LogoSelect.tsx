import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
  logoUrl?: string | null;
}

interface LogoSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}

const LogoSelect = ({ value, onValueChange, options, placeholder, disabled }: LogoSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled} dir="rtl">
      <SelectTrigger className="bg-secondary border-border text-foreground w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border z-[100] max-h-60">
        {options.length === 0 ? (
          <div className="py-3 text-center text-sm text-muted-foreground">لا توجد بيانات</div>
        ) : (
          options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center gap-2">
                {opt.logoUrl && (
                  <img
                    src={opt.logoUrl}
                    alt={opt.label}
                    className="w-5 h-5 rounded-sm object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <span>{opt.label}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default LogoSelect;
