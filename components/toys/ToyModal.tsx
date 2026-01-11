'use client'

import React from 'react'
import ToyForm from './ToyForm'
import ImageUploadPopup from './ImageUploadPopup'
import Modal from '@/components/ui/Modal' // <--- Utilisation de la Modale Générique
import { useToyModal } from '@/hooks/useToyModal'
import type { Toy } from '@/types/theme'

interface ToyModalProps {
  isOpen: boolean; onClose: () => void; themeId: string; userId: string; onSave: (toy: Toy) => void; toy: Toy | null
}

export default function ToyModal(props: ToyModalProps) {
  const { form, setForm, file, setFile, previewUrl, setPreviewUrl, loading, showImagePopup, setShowImagePopup, handleSubmit } = useToyModal(props.isOpen, props.onClose, props.themeId, props.userId, props.onSave, props.toy)

  if (!props.isOpen) return null

  return (
    <>
      <Modal 
        isOpen={props.isOpen} 
        onClose={props.onClose} 
        title={props.toy ? 'Modifier le jouet' : 'Nouveau jouet'}
        loading={loading}
      >
        <ToyForm
          form={form} setForm={setForm}
          previewUrl={previewUrl} setPreviewUrl={setPreviewUrl} setFile={setFile}
          setShowImagePopup={setShowImagePopup} loading={loading}
          onSubmit={handleSubmit} onClose={props.onClose}
        />
      </Modal>

      <ImageUploadPopup isOpen={showImagePopup} onClose={() => setShowImagePopup(false)} onFileSelect={setFile} loading={loading} />
    </>
  )
}