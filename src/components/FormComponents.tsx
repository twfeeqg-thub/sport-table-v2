import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField = ({ label, required, children, className = "" }: FormFieldProps) => (
  <div className={className}>
    <label className="block text-sm font-medium text-muted-foreground mb-2">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
  </div>
);

export const StyledInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <Input ref={ref} {...props} className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${props.className || ""}`} />
));
StyledInput.displayName = "StyledInput";

export const StyledTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <Textarea ref={ref} {...props} className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${props.className || ""}`} />
));
StyledTextarea.displayName = "StyledTextarea";
