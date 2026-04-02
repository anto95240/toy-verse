import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FormInput } from "./FormInput";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
}

export const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  disabled,
  required
}: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <FormInput
        id={id}
        label={label}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        disabled={disabled}
        className="absolute right-4 top-6 text-muted-foreground hover:text-primary transition-colors duration-200 disabled:opacity-50"
        aria-label={show ? "Masquer" : "Afficher"}
      >
        <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
      </button>
    </div>
  );
};
