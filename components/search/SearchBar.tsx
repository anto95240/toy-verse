"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faSpinner,
  faChevronRight,
  faCube,
} from "@fortawesome/free-solid-svg-icons";
import { useSearch } from "@/hooks/useSearch";
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };

export default function SearchBar({
  onResults,
  placeholder = "Rechercher...",
  className = "",
}: {
  onResults: (r: ToyWithTheme[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    showDropdown,
    inputRef,
    dropdownRef,
    selectToy,
    viewAll,
    clear,
  } = useSearch(onResults);

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

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="px-4 py-2 bg-secondary/30 text-[10px] font-bold uppercase text-muted-foreground">
            Suggestions
          </div>
          <div className="divide-y divide-border/50">
            {suggestions.map((toy) => (
              <div
                key={toy.id}
                onClick={() => selectToy(toy)}
                className="group flex items-center gap-4 p-3 hover:bg-primary/5 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary">
                  <FontAwesomeIcon icon={faCube} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary">
                    {toy.nom}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {toy.numero && (
                      <span className="bg-secondary px-1.5 rounded font-mono font-bold">
                        #{toy.numero}
                      </span>
                    )}
                    <span className="bg-secondary px-1.5 rounded">
                      {toy.theme_name}
                    </span>
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-xs text-muted-foreground/30 group-hover:text-primary pr-2"
                />
              </div>
            ))}
          </div>
          <button
            onClick={viewAll}
            className="w-full p-3 bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-primary text-sm font-medium flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faSearch} className="text-xs" /> Voir tout
            pour &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
