import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core"

interface StatCardProps {
  title: string
  value: string | number
  subtext?: string
  icon: IconDefinition
  color: string
}

export default function StatCard({ title, value, subtext, icon, color }: StatCardProps) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group h-full">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform ${color}`}>
        <FontAwesomeIcon icon={icon} className="text-2xl" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-xl font-semibold truncate max-w-[180px]">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </div>
    </div>
  )
}