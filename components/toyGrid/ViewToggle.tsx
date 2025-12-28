import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBoxOpen, faStar } from "@fortawesome/free-solid-svg-icons"

interface ViewToggleProps {
  view: 'collection' | 'wishlist'
  setView: (view: 'collection' | 'wishlist') => void
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
        <button
          onClick={() => setView('collection')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            view === 'collection'
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
          }`}
        >
          <FontAwesomeIcon icon={faBoxOpen} />
          Ma Collection
        </button>
        <button
          onClick={() => setView('wishlist')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
            view === 'wishlist'
              ? 'bg-purple-600 text-white shadow-md transform scale-105'
              : 'text-gray-500 hover:text-purple-600 hover:bg-gray-50'
          }`}
        >
          <FontAwesomeIcon icon={faStar} />
          Ma Wishlist
        </button>
      </div>
    </div>
  )
}