"use client"

import React, { useState } from "react"

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
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
      onClose()
    }
  }

  function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const capturedFile = e.target.files?.[0]
    if (capturedFile) {
      onFileSelect(capturedFile)
      onClose()
    }
  }

  async function handleUrlSubmit() {
    if (!imageUrl.trim()) return
    
    setIsLoadingUrl(true)
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Image non accessible')
      
      const blob = await response.blob()
      const file = new File([blob], 'image-from-url.jpg', { type: blob.type })
      
      onFileSelect(file)
      onClose()
      setImageUrl("")
      setShowUrlInput(false)
    } catch (error) {
      alert('Erreur lors du chargement de l\'image depuis l\'URL')
      console.error('Erreur URL image:', error)
    } finally {
      setIsLoadingUrl(false)
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
              📁 Choisir depuis l&apos;ordinateur
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
                capture="environment"
                onChange={handleCameraCapture}
                disabled={loading}
                className="hidden"
                aria-label="Prendre une photo"
              />
            </label>
            
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🌐 Utiliser une URL d&apos;image
            </button>
            
            {showUrlInput && (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-[#2d3748] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingUrl}
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl.trim() || isLoadingUrl}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingUrl ? "Chargement..." : "Utiliser cette URL"}
                </button>
              </div>
            )}
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
