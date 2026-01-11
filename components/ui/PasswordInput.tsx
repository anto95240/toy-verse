import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { FormInput } from "./FormInput" // On réutilise votre Input de base

interface PasswordInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  autoComplete?: string
}

export const PasswordInput = ({ id, label, value, onChange, disabled, required, autoComplete = "new-password" }: PasswordInputProps) => {
  const [show, setShow] = useState(false)

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
        // On passe les props html standard via spread dans FormInput si prévu, sinon on adapte FormInput
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 z-10"
        aria-label={show ? "Masquer" : "Afficher"}
      >
        <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
      </button>
    </div>
  )
}