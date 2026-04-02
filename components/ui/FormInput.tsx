import React from "react";

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string | number | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  required?: boolean;
  placeholder?: string;
}

export const FormInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled,
  ...props
}: FormInputProps) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="peer w-full bg-secondary border-2 border-border rounded-lg px-4 pt-6 pb-3 text-sm text-foreground placeholder:text-transparent focus:outline-none focus:ring-0 focus:border-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      placeholder=" "
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute left-4 top-2 text-xs font-semibold text-muted-foreground transition-all duration-300 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
    >
      {label}
    </label>
  </div>
);