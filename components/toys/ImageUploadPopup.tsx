"use client"

import React, { useState } from "react"
import { convertToWebP } from "@/utils/imageConverter"

interface ImageUploadPopupProps {
  isOpen: boolean; onClose: () => void; onFileSelect: (file: File) => void; loading: boolean
}

export default function ImageUploadPopup({ isOpen, onClose, onFileSelect, loading }: ImageUploadPopupProps) {
  const [showUrl, setShowUrl] = useState(false)
  const [url, setUrl] = useState("")
  const [loadUrl, setLoadUrl] = useState(false)

  const processFile = async (file?: File) => {
    if (!file) return
    try { onFileSelect(await convertToWebP(file)); onClose() } 
    catch { onFileSelect(file); onClose() } // Fallback
  }

  const handleUrl = async () => {
    if (!url.trim()) return
    setLoadUrl(true)
    try {
      const res = await fetch(url); if (!res.ok) throw new Error()
      const blob = await res.blob()
      await processFile(new File([blob], 'img.jpg', { type: blob.type }))
      setUrl(""); setShowUrl(false)
    } catch { alert('Erreur image'); } finally { setLoadUrl(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-3">
        <h3 className="text-lg font-semibold mb-4 text-center">Choisir une image</h3>
        
        <label className="btn-upload bg-green-600 hover:bg-green-700">
          📁 Local <input type="file" accept="image/*" onChange={e => processFile(e.target.files?.[0])} disabled={loading} className="hidden" />
        </label>
        
        <label className="btn-upload bg-orange-600 hover:bg-orange-700">
          📷 Caméra <input type="file" accept="image/*" capture="environment" onChange={e => processFile(e.target.files?.[0])} disabled={loading} className="hidden" />
        </label>
        
        <button onClick={() => setShowUrl(!showUrl)} className="btn-upload bg-blue-600 hover:bg-blue-700">🌐 Via URL</button>
        
        {showUrl && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <input type="url" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="w-full border rounded p-2" disabled={loadUrl} />
            <button onClick={handleUrl} disabled={!url || loadUrl} className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50">{loadUrl ? "..." : "Valider"}</button>
          </div>
        )}
        
        <button onClick={onClose} className="btn-upload bg-gray-400 hover:bg-gray-500">Annuler</button>
      </div>
      <style jsx>{`.btn-upload { @apply w-full px-4 py-3 text-white rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50; }`}</style>
    </div>
  )
}