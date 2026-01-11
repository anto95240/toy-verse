import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSort, faListOl } from "@fortawesome/free-solid-svg-icons"
import Pagination from "@/components/common/Pagination"

interface ToySortControlsProps {
  sortCriteria: string
  setSortCriteria: (val: any) => void
  itemsPerPage: number
  setItemsPerPage: (val: number) => void
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void // Changement ici pour accepter un number direct ou fonction
  totalItems: number
}

export default function ToySortControls({
  sortCriteria,
  setSortCriteria,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems
}: ToySortControlsProps) {
  
  // Wrapper pour adapter le setPage de la pagination
  const handlePageChange = (p: number) => setCurrentPage(p);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Tri */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          <FontAwesomeIcon icon={faSort} />
        </div>
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          aria-label="Trier par"
          className="pl-9 pr-8 py-2.5 text-sm font-medium bg-secondary border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
        >
          <optgroup label="Date d'ajout">
            <option value="added_desc">Ajoutés récemment</option>
            <option value="added_asc">Ajoutés anciennement</option>
          </optgroup>
          <optgroup label="Année de sortie">
            <option value="release_desc">Sortis récemment</option>
            <option value="release_asc">Sortis anciennement</option>
          </optgroup>
        </select>
      </div>

      {/* Items par page */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          <FontAwesomeIcon icon={faListOl} />
        </div>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          aria-label="Jouets par page"
          className="pl-9 pr-8 py-2.5 text-sm font-medium bg-secondary border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
        >
          <option value={12}>12 par page</option>
          <option value={24}>24 par page</option>
          <option value={48}>48 par page</option>
        </select>
      </div>

      {/* Pagination Compacte */}
      {totalItems > itemsPerPage && (
        <div className="hidden sm:block ml-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPrevious={() => handlePageChange(Math.max(1, currentPage - 1))}
            onNext={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            hasNextPage={currentPage < totalPages}
            hasPreviousPage={currentPage > 1}
          />
        </div>
      )}
    </div>
  )
}