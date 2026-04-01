"use client";

import { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faSpinner,
  faChevronRight,
  faCube,
  faCalendar,
  faHashtag,
  faHistory,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSearchWithHistory } from "@/hooks/useSearchWithHistory";
import { createSlug } from "@/utils/slugUtils";
import SearchSuggestionImage from "./SearchSuggestionImage";
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };

export default function SearchBar({
  onResults,
  placeholder = "Rechercher...",
  className = "",
}: {
  onResults?: (r: ToyWithTheme[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  
  const handleSearchResults = useCallback((results: ToyWithTheme[]) => {
    if (onResults) onResults(results);
  }, [onResults]);

  const {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading,
    showDropdown,
    setShowDropdown,
    showHistory,
    setShowHistory,
    inputRef,
    dropdownRef,
    viewAll,
    clear,
    searchHistory,
    searchFromHistory,
    handleFocus,
    removeFromHistory,
    clearAllHistory,
  } = useSearchWithHistory(handleSearchResults);

  // ✅ Naviguer vers un jouet spécifique avec son ID
  const handleSelectToy = (toy: ToyWithTheme) => {
    const themeSlug = createSlug(toy.theme_name);
    const toyId = toy.id;
    
    // Réinitialiser complètement la recherche
    setShowDropdown(false);
    setShowHistory(false);
    clear();
    
    // Naviguer vers le jouet
    router.push(`/${themeSlug}?selectedToyId=${toyId}`);
  };

  return (
    <div className={`relative w-full ${className} z-50`}>
      <div
        className={`relative flex items-center w-full bg-background border-2 rounded-xl transition-all ${
          showDropdown
            ? "border-primary shadow-lg"
            : "border-border hover:border-primary/50"
        }`}
      >
        <div
          className={`pl-4 ${
            isLoading ? "text-primary animate-spin" : "text-muted-foreground"
          }`}
        >
          <FontAwesomeIcon icon={isLoading ? faSpinner : faSearch} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        {query && (
          <button
            onClick={clear}
            aria-label="réinitialise la recherche"
            className="pr-4 text-muted-foreground hover:text-primary"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          {/* ✅ Afficher les résultats de recherche */}
          {suggestions.length > 0 ? (
            <>
              <div className="px-4 py-2 bg-secondary/30 text-[10px] font-bold uppercase text-muted-foreground">
                Résultats ({suggestions.length}) - Cliquez pour voir le jouet
              </div>
              <div className="divide-y divide-border/50 max-h-[70vh] overflow-y-auto">
                {suggestions.map((toy) => (
                  <div
                    key={toy.id}
                    onClick={() => handleSelectToy(toy)}
                    className="group flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-all duration-200"
                  >
                    {/* ✅ Image du jouet - utilise SearchSuggestionImage pour générer l'URL signée Supabase */}
                    <SearchSuggestionImage toy={toy} />
                    
                    {/* ✅ Infos du jouet */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {toy.nom}
                      </h4>
                      
                      {/* Infos dynamiques */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 flex-wrap">
                        {toy.numero && (
                          <span className="bg-secondary px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                            <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                            {toy.numero}
                          </span>
                        )}
                        {toy.release_date && (
                          <span className="bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                            {new Date(toy.release_date).getFullYear()}
                          </span>
                        )}
                      </div>
                      
                      {/* Thème badge */}
                      <div className="text-xs text-muted-foreground/70 mt-1 truncate">
                        📦 {toy.theme_name}
                      </div>
                    </div>
                    
                    {/* ✅ Arrow indicator */}
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-xs text-muted-foreground/30 group-hover:text-primary/70 flex-shrink-0 transition-colors"
                    />
                  </div>
                ))}
              </div>
              
              {/* ✅ View all button */}
              <button
                onClick={viewAll}
                className="w-full p-3 bg-secondary/50 hover:bg-primary/20 text-primary text-sm font-medium flex items-center justify-center gap-2 border-t border-border transition-colors"
              >
                <FontAwesomeIcon icon={faSearch} className="text-xs" /> 
                Voir tous les résultats pour &quot;{query}&quot;
              </button>
            </>
          ) : showHistory && query.trim().length === 0 && searchHistory.length > 0 ? (
            // ✅ Afficher l'historique si le champ est vide
            <>
              <div className="px-4 py-2 bg-secondary/30 text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between">
                <span>
                  <FontAwesomeIcon icon={faHistory} className="mr-2" />
                  Recherches récentes ({searchHistory.length})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllHistory();
                  }}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                  title="Supprimer tout l'historique"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <div className="divide-y divide-border/50 max-h-[70vh] overflow-y-auto">
                {searchHistory.map((item, index) => (
                  <div
                    key={`${item.query}-${index}`}
                    className="group flex items-center gap-3 p-3 hover:bg-primary/10 transition-all duration-200"
                  >
                    <FontAwesomeIcon
                      icon={faHistory}
                      className="text-xs text-muted-foreground/50 group-hover:text-primary/70 flex-shrink-0"
                    />
                    <span 
                      onClick={() => searchFromHistory(item.query)}
                      className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.query}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.query);
                      }}
                      className="text-xs text-muted-foreground/50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Supprimer cette entrée"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : showHistory && query.trim().length === 0 && searchHistory.length === 0 ? (
            // ✅ Message "Pas d'historique" quand champ vide et pas d'historique
            <div className="px-4 py-8 text-center">
              <FontAwesomeIcon
                icon={faHistory}
                className="text-4xl text-muted-foreground/30 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Aucune recherche récente
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Tapez au moins 2 caractères pour chercher
              </p>
            </div>
          ) : query.trim().length >= 2 && suggestions.length === 0 && !isLoading ? (
            // ✅ Afficher "Aucun résultat" quand il n'y a pas de résultats
            <div className="px-4 py-8 text-center">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-4xl text-muted-foreground/30 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Aucun résultat trouvé pour &quot;{query}&quot;
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
