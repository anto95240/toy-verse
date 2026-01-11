import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"

interface ToggleButtonProps {
  isActive: boolean
  onClick: () => void
  icon: IconDefinition
  label: string
  activeColorClass?: string // ex: "text-primary" ou "text-purple-600"
}

export default function ToggleButton({ isActive, onClick, icon, label, activeColorClass = "text-primary" }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
        isActive
          ? `bg-background ${activeColorClass} shadow-sm ring-1 ring-border`
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <FontAwesomeIcon icon={icon} />
      {label}
    </button>
  )
}