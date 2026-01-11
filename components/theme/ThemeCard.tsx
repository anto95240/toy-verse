import React from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Theme } from '@/types/theme'

interface ThemeCardProps {
  theme: Theme
  imageUrl: string | null
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

export const ThemeCard = ({ theme, imageUrl, onClick, onEdit, onDelete }: ThemeCardProps) => (
  <li className="modern-card rounded-2xl cursor-pointer p-6 flex flex-col items-center floating-animation glow-effect w-full max-w-sm group">
    <div className="cursor-pointer w-full overflow-hidden rounded-md" onClick={onClick}>
      {imageUrl ? (
        <Image src={imageUrl} alt={theme.name} width={400} height={160} className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      ) : (
        <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-500 border border-gray-300">Sans image</div>
      )}
    </div>
    <div className="flex flex-1 items-center pt-4 justify-between w-full mt-2">
      <h3 className="font-semibold text-lg truncate flex-1 pr-2">{theme.name}</h3>
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="text-btn-edit hover:text-green-600 p-2 rounded-full hover:bg-green-50" aria-label="Modifier"><FontAwesomeIcon icon={faPen} /></button>
        <button onClick={onDelete} className="text-btn-delete hover:text-red-600 p-2 rounded-full hover:bg-red-50" aria-label="Supprimer"><FontAwesomeIcon icon={faTrash} /></button>
      </div>
    </div>
  </li>
)