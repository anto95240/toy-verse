"use client"

import React, { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUp } from "@fortawesome/free-solid-svg-icons"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-32 right-6 neo-button modern-card p-3 rounded-full border border-border-color hover:border-btn-add hover:glow-effect transition-all duration-300 z-40 opacity-90 hover:opacity-100"
      aria-label="Remonter en haut de la page"
      title="Remonter en haut"
    >
      <FontAwesomeIcon icon={faArrowUp} className="w-5 h-5 text-text-prim" />
    </button>
  )
}