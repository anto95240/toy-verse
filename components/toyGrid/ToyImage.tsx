// import React from "react"
// import Image from "next/image"
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
// import { faImage } from "@fortawesome/free-solid-svg-icons"
// import { useSignedUrl } from "@/hooks/useSignedUrl"
// import type { ToyImageProps } from "@/types/toyGrid"

// export default function ToyImage({ 
//   toy, 
//   toyImageUrls,
//   currentUserId 
// }: ToyImageProps) {
//   const { imageUrl, isLoading, hasError } = useSignedUrl(toy, toyImageUrls, currentUserId)

//   if (isLoading) {
//     return (
//       <div className="w-48 h-48 bg-gray-100 flex flex-col items-center justify-center border rounded animate-pulse">
//         <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
//         <div className="text-gray-500 text-xs">Chargement...</div>
//       </div>
//     )
//   }

//   if (hasError || !imageUrl) {
//     return (
//       <div className="w-48 h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-400 border rounded">
//         <FontAwesomeIcon icon={faImage} className="text-2xl mb-2" />
//         <span className="text-xs text-center px-2">
//           {hasError ? "Image non trouvée" : "Pas d'image"}
//         </span>
//       </div>
//     )
//   }

//   return (
//     <div className="relative w-48 h-48">
//       <Image
//         src={imageUrl}
//         alt={toy.nom}
//         fill
//         className="object-contain"
//         unoptimized
//         onError={(e) => {
//           const target = e.target as HTMLImageElement
//           target.style.display = 'none'
//           if (target.parentElement) {
//             target.parentElement.innerHTML = `
//               <div class="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-400 border rounded">
//                 <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
//                   <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
//                 </svg>
//                 <span class="text-xs">Erreur</span>
//               </div>
//             `
//           }
//         }}
//       />
//     </div>
//   )
// }

import React from "react"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage } from "@fortawesome/free-solid-svg-icons"
import { useSignedUrl } from "@/hooks/useSignedUrl"
import type { ToyImageProps } from "@/types/toyGrid"

export default function ToyImage({ 
  toy, 
  toyImageUrls,
  currentUserId 
}: ToyImageProps) {
  const { imageUrl, isLoading, hasError } = useSignedUrl(toy, toyImageUrls, currentUserId)

  if (isLoading) {
    return (
      <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 flex flex-col items-center justify-center border rounded animate-pulse">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div className="text-gray-500 text-xs">Chargement...</div>
      </div>
    )
  }

  if (hasError || !imageUrl) {
    return (
      <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-400 border rounded">
        <FontAwesomeIcon icon={faImage} className="text-xl sm:text-2xl mb-2" />
        <span className="text-xs text-center px-2">
          {hasError ? "Image non trouvée" : "Pas d'image"}
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-36 h-36 sm:w-48 sm:h-48">
      <Image
        src={imageUrl}
        alt={toy.nom}
        fill
        className="object-contain"
        unoptimized
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          if (target.parentElement) {
            target.parentElement.innerHTML = `
              <div class="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-400 border rounded">
                <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="text-xs">Erreur</span>
              </div>
            `
          }
        }}
      />
    </div>
  )
}