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
      className="peer text-[#2d3748] w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder=""
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
    >
      {label}
    </label>
  </div>
);