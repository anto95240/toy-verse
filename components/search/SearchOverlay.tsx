"use client"

import React, { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faTimes, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus automatique quand l'overlay s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Rediriger vers la home avec le paramètre de recherche
      // (Nécessite que ta HomePage gère le param URL ?search=...)
      router.push(`/home?search=${encodeURIComponent(query)}`)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col h-full p-4 safe-top">
        {/* Header Overlay */}
        <div className="flex justify-end mb-8 pt-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-10">
          <h2 className="text-3xl font-bold text-center mb-4 font-title">
            Que cherchez-vous ?
          </h2>
          
          <div className="relative w-full max-w-lg mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Star Wars, Lego, N° 75000..."
              className="w-full bg-transparent border-b-2 border-primary/50 py-4 text-2xl text-center focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          <button 
            type="submit"
            disabled={!query.trim()}
            className="mx-auto mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Rechercher <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>
      </div>
    </div>
  )
}