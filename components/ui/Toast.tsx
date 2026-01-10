"use client"

import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faXmark, 
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  onClose: (id: string) => void
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  const styles = {
    success: 'bg-card border-l-4 border-l-green-500 text-foreground shadow-lg shadow-green-500/5',
    error: 'bg-card border-l-4 border-l-destructive text-foreground shadow-lg shadow-destructive/5',
    info: 'bg-card border-l-4 border-l-blue-500 text-foreground shadow-lg shadow-blue-500/5'
  }

  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    info: faInfoCircle
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-destructive',
    info: 'text-blue-500'
  }

  return (
    <div className={`
      pointer-events-auto w-full max-w-sm overflow-hidden rounded-r-xl border border-border backdrop-blur-md p-4 shadow-xl 
      transition-all duration-500 ease-out animate-in slide-in-from-right-12 fade-in
      ${styles[type]}
    `}>
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 flex-shrink-0 ${iconColors[type]}`}>
          <FontAwesomeIcon icon={icons[type]} size="lg" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={() => onClose(id)}
          aria-label="ferme la popup"
          className="group rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-black/5"
        >
          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}