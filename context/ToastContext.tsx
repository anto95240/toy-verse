"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast, { ToastType } from '@/components/ui/Toast'

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* FIX: On utilise 'left-auto' et 'right-5' pour forcer l'ancrage à droite.
         On ajoute 'items-end' pour que les toasts s'alignent sur la droite.
         
    left: auto;
    right: 0px;

      */}
      <div className="fixed top-24 left-auto right-0 z-50 flex flex-col items-end gap-3 w-auto max-w-[90vw] pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}