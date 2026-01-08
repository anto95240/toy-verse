import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faPen, 
  faTrash, 
  faPuzzlePiece, 
  faRulerVertical, 
  faCalendarAlt,
  faBuilding,
  faTag
} from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"
import { createSlug } from "@/lib/slugUtils"
import ToyImage from "./ToyImage"
import type { ToyCardProps } from "@/types/toyGrid"

export default function ToyCard({
  toy,
  toyImageUrls,
  currentUserId,
  onEditToy,
  onDeleteToy,
  isFromDifferentTheme = false
}: ToyCardProps) {
  const router = useRouter()

  const handleThemeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (toy.theme_name) {
      const themeSlug = createSlug(toy.theme_name.trim())
      router.push(`/${themeSlug}`)
    }
  }

  // MODIFICATION: badge avec bg-secondary et text-muted-foreground
  const InfoBadge = ({ icon, text, color }: { icon: any, text: string | number, color?: string }) => (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border">
      <FontAwesomeIcon icon={icon} className={color || "text-muted-foreground"} />
      <span>{text}</span>
    </div>
  )

  return (
    <li className="w-full group">
      {/* --- Layout Mobile (Vertical) --- */}
      {/* MODIFICATION: bg-card au lieu de bg-white */}
      <div className="flex flex-col sm:hidden modern-card rounded-2xl overflow-hidden floating-animation relative bg-card">
        
        {toy.numero && (
          <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
            #{toy.numero}
          </div>
        )}

        {/* MODIFICATION: Fond d'image subtil avec bg-muted/30 */}
        <div className="flex justify-center p-4 bg-muted/30">
          <ToyImage toy={toy} toyImageUrls={toyImageUrls} currentUserId={currentUserId} />
        </div>
        
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start mb-3 gap-2">
            <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2">{toy.nom}</h3>
            
            <div className="flex gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEditToy(toy); }}
                aria-label="modification"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
              >
                <FontAwesomeIcon icon={faPen} className="text-xs" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteToy(toy.id); }}
                aria-label="supression"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {toy.nb_pieces && <InfoBadge icon={faPuzzlePiece} text={toy.nb_pieces} color="text-primary" />}
            {toy.taille && <InfoBadge icon={faRulerVertical} text={toy.taille} color="text-purple-500" />}
            {toy.release_date && <InfoBadge icon={faCalendarAlt} text={toy.release_date} color="text-orange-500" />}
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
             {toy.studio && (
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} className="text-muted-foreground/70 text-xs w-4" />
                    <span className="truncate">{toy.studio}</span>
                </div>
             )}
             {toy.categorie && (
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faTag} className="text-muted-foreground/70 text-xs w-4" />
                    <span className="truncate">{toy.categorie}</span>
                </div>
             )}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
             <div className="flex gap-2">
                {toy.is_exposed && (
                <span className="text-[10px] uppercase tracking-wider font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">
                    Exposé
                </span>
                )}
                {toy.is_soon && (
                <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full border border-purple-500/20">
                    Wishlist
                </span>
                )}
             </div>

            {isFromDifferentTheme && toy.theme_name && (
                <button
                onClick={handleThemeClick}
                className="text-xs font-semibold text-primary hover:underline"
                >
                {toy.theme_name} →
                </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Layout Desktop (Horizontal) --- */}
      <div className="hidden sm:flex modern-card rounded-2xl overflow-hidden h-64 floating-animation bg-card border border-border hover:shadow-lg transition-all">
        
        {/* MODIFICATION: bg-muted/30 pour la zone image */}
        <div className="w-48 bg-muted/30 flex flex-col items-center justify-between p-4 relative group-hover:bg-muted/50 transition-colors">
           {toy.numero && (
             <div className="absolute top-2 left-2 z-10 bg-card/80 backdrop-blur text-foreground text-xs font-bold px-2 py-1 rounded shadow-sm">
                #{toy.numero}
             </div>
           )}
          
          <div className="w-full flex-1 flex items-center justify-center">
             <ToyImage toy={toy} toyImageUrls={toyImageUrls} currentUserId={currentUserId} />
          </div>
          
          <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEditToy(toy); }}
              className="text-muted-foreground hover:text-green-600 transition-colors"
              title="Modifier"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteToy(toy.id); }}
              className="text-muted-foreground hover:text-destructive transition-colors"
              title="Supprimer"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start">
             <h3 className="font-bold text-xl text-foreground mb-1">{toy.nom}</h3>
             <div className="flex gap-2">
                {toy.is_exposed && <span className="w-2 h-2 rounded-full bg-green-500" title="Exposé"></span>}
                {toy.is_soon && <span className="w-2 h-2 rounded-full bg-purple-500" title="Wishlist"></span>}
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
             {toy.studio && <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{toy.studio}</span>}
             {toy.categorie && <span className="text-sm text-muted-foreground/70">• {toy.categorie}</span>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {toy.nb_pieces && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FontAwesomeIcon icon={faPuzzlePiece} className="text-primary w-4" />
                      <span>{toy.nb_pieces} p.</span>
                  </div>
              )}
              {toy.release_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500 w-4" />
                      <span>{toy.release_date}</span>
                  </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-y-2 gap-x-4 mb-auto">
              {toy.taille && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FontAwesomeIcon icon={faRulerVertical} className="text-purple-500 w-4" />
                      <span>{toy.taille}</span>
                  </div>
              )}
            </div>
          </div>

          {isFromDifferentTheme && toy.theme_name && (
            <button
              onClick={handleThemeClick}
              className="self-end text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 mt-2"
            >
              Voir le thème {toy.theme_name} <span className="text-xs">↗</span>
            </button>
          )}
        </div>
      </div>
    </li>
  )
}