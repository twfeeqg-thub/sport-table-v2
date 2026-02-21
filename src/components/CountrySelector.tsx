import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/countries";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CountrySelector = ({ value, onChange, className = "" }: CountrySelectorProps) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        الدولة <span className="text-destructive">*</span>
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-secondary border-border text-foreground">
          <SelectValue placeholder="اختر الدولة" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code} className="text-foreground">
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountrySelector;
