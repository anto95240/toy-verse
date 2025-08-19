// "use client"

// import React from "react"
// import ToyCard from "./ToyCard"
// import EmptyState from "./EmptyState"
// import type { ToyGridProps } from "@/types/toyGrid"

// export default function ToyGrid({ 
//   toys, 
//   toyImageUrls, 
//   onEditToy, 
//   onDeleteToy,
//   searchResults,
//   isSearchActive = false,
//   onClearSearch,
//   currentThemeName,
//   currentUserId
// }: ToyGridProps) {
//   const toysToDisplay = isSearchActive && searchResults ? searchResults : toys
  
//   // Vérifier si on affiche des jouets d'un thème différent
//   const hasToysFromDifferentTheme = isSearchActive && searchResults && 
//     searchResults.some(toy => toy.theme_name !== currentThemeName)

//   if (toysToDisplay.length === 0) {
//     return (
//       <EmptyState
//         isSearchActive={isSearchActive}
//         onClearSearch={onClearSearch}
//       />
//     )
//   }

//   return (
//     <div>
//       {hasToysFromDifferentTheme && (
//         <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
//               <div>
//                 <p className="font-medium text-blue-900">
//                   Résultats de recherche multi-thèmes
//                 </p>
//                 <p className="text-sm text-blue-700">
//                   Certains jouets proviennent d&apos;autres thèmes.
//                 </p>
//               </div>
//             </div>
//             {onClearSearch && (
//               <button
//                 onClick={onClearSearch}
//                 className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
//               >
//                 Voir tous les jouets
//               </button>
//             )}
//           </div>
//         </div>
//       )}

//       <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-36 gap-y-12">
//         {toysToDisplay.map(toy => (
//           <ToyCard
//             key={toy.id}
//             toy={toy}
//             toyImageUrls={toyImageUrls}
//             currentUserId={currentUserId}
//             onEditToy={onEditToy}
//             onDeleteToy={onDeleteToy}
//             isFromDifferentTheme={toy.theme_name !== currentThemeName}
//           />
//         ))}
//       </ul>
//     </div>
//   )
// }


"use client"

import React from "react"
import ToyCard from "./ToyCard"
import EmptyState from "./EmptyState"
import Pagination from "../common/Pagination"
import { usePagination } from "@/hooks/usePagination"
import type { ToyGridProps } from "@/types/toyGrid"

export default function ToyGrid({ 
  toys, 
  toyImageUrls, 
  onEditToy, 
  onDeleteToy,
  searchResults,
  isSearchActive = false,
  onClearSearch,
  currentThemeName,
  currentUserId
}: ToyGridProps) {
  const toysToDisplay = isSearchActive && searchResults ? searchResults : toys
  
    
  // Configuration de la pagination
  const itemsPerPage = 12 // Nombre de jouets par page
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    hasNextPage,
    hasPreviousPage
  } = usePagination({
    items: toysToDisplay,
    itemsPerPage
  })
  
  // Vérifier si on affiche des jouets d'un thème différent
  const hasToysFromDifferentTheme = isSearchActive && searchResults && 
    searchResults.some(toy => toy.theme_name !== currentThemeName)

  if (toysToDisplay.length === 0) {
    return (
      <EmptyState
        isSearchActive={isSearchActive}
        onClearSearch={onClearSearch}
      />
    )
  }

  return (
    <div>
      {hasToysFromDifferentTheme && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-blue-900">
                  Résultats de recherche multi-thèmes
                </p>
                <p className="text-sm text-blue-700">
                  Certains jouets proviennent d&apos;autres thèmes.
                </p>
              </div>
            </div>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Voir tous les jouets
              </button>
            )}
          </div>
        </div>
      )}

      {/* Affichage de la pagination en haut */}
      {totalPages > 1 && (
        <div className="">
          <div className="text-center text-sm text-text-prim">
            Page {currentPage} sur {totalPages}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      )}

      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {paginatedItems.map(toy => (
          <ToyCard
            key={toy.id}
            toy={toy}
            toyImageUrls={toyImageUrls}
            currentUserId={currentUserId}
            onEditToy={onEditToy}
            onDeleteToy={onDeleteToy}
            isFromDifferentTheme={toy.theme_name !== currentThemeName}
          />
        ))}
      </ul>

      {/* Pagination en bas */}
      {totalPages > 1 && (
        <div className="">
          <div className="text-center text-sm text-text-prim">
            Page {currentPage} sur {totalPages}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      )}
    </div>
  )
}
