"use client"

import { useTheme } from "@/hooks/useTheme"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
      title={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
    >
      <FontAwesomeIcon 
        icon={theme === "light" ? faMoon : faSun} 
        className={`text-lg transition-transform duration-500 ${theme === 'light' ? 'rotate-0' : 'rotate-180 text-yellow-400'}`} 
      />
    </button>
  )
}