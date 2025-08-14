"use client"

import React from "react"

interface ImageUploadPopupProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: File) => void
  loading: boolean
}

export default function ImageUploadPopup({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  loading 
}: ImageUploadPopupProps) {
  // Gestion du choix d"image depuis fichier local
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
      onClose()
    }
  }

  // Gestion de la prise de photo (caméra)
  function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const capturedFile = e.target.files?.[0]
    if (capturedFile) {
      onFileSelect(capturedFile)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Choisir une image</h3>
          
          <div className="space-y-3">
            <label className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              📁 Choisir depuis l'ordinateur
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
                aria-label="Choisir un fichier image"
              />
            </label>
            
            <label className="w-full px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              📷 Prendre une photo
              <input
                type="file"
                accept="image/*"
                onChange={handleCameraCapture}
                disabled={loading}
                className="hidden"
                aria-label="Prendre une photo"
              />
            </label>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}