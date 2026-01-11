import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faSearch,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface MultiSelectFilterProps {
  title: string;
  colorScheme: "blue" | "green" | "purple" | "indigo" | "orange" | "red";
  items: string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  filterCounts: Record<string, number>;
  searchable?: boolean;
  maxDisplayed?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  icon: IconDefinition;
}

const colorClasses = {
  blue: {
    header: "bg-blue-50 border-blue-200",
    headerText: "text-blue-800",
    item: "",
    selected: "",
    count: "text-blue-600",
  },
  green: {
    header: "bg-green-50 border-green-200",
    headerText: "text-green-800",
    item: "",
    selected: "",
    count: "text-green-600",
  },
  purple: {
    header: "bg-purple-50 border-purple-200",
    headerText: "text-purple-800",
    item: "",
    selected: "",
    count: "text-purple-600",
  },
  indigo: {
    header: "bg-indigo-50 border-indigo-200",
    headerText: "text-indigo-800",
    item: "",
    selected: "",
    count: "text-indigo-600",
  },
  orange: {
    header: "bg-orange-50 border-orange-200",
    headerText: "text-orange-800",
    item: "",
    selected: "",
    count: "text-orange-600",
  },
  red: {
    header: "bg-red-50 border-red-200",
    headerText: "text-red-800",
    item: "",
    selected: "",
    count: "text-red-600",
  },
};

export default function MultiSelectFilter({
  title,
  colorScheme,
  items,
  selectedItems,
  onToggleItem,
  filterCounts,
  searchable = false,
  maxDisplayed = 5,
  isCollapsed,
  onToggleCollapse,
  icon,
}: MultiSelectFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(maxDisplayed);

  const colors = colorClasses[colorScheme];

  const filteredItems = searchable
    ? items.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const displayedItems = filteredItems.slice(0, limit);
  const remainingCount = filteredItems.length - limit;

  const handleShowMore = () => {
    setLimit((prev) => prev + 5);
  };

  const handleShowLess = () => {
    setLimit(maxDisplayed);
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-card">
      <button
        onClick={onToggleCollapse}
        className={`w-full px-4 py-3 flex items-center justify-between ${colors.header} ${colors.headerText} font-semibold text-sm hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
          <span>{title}</span>
          {selectedItems.length > 0 && (
            <span
              className={`px-2 py-1 bg-bg-second rounded-full text-xs ${colors.count}`}
            >
              {selectedItems.length}
            </span>
          )}
        </div>
        <FontAwesomeIcon
          icon={isCollapsed ? faChevronDown : faChevronUp}
          className="w-3 h-3"
        />
      </button>

      {!isCollapsed && (
        <div className="p-4 bg-bg-second">
          {searchable && (
            <div className="relative mb-3">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2d3748] w-4 h-4"
              />
              <input
                type="text"
                placeholder={`Rechercher dans ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-[#2d3748] border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="space-y-2">
            {displayedItems.map((item) => {
              const isSelected = selectedItems.includes(item);
              const count = filterCounts[item] || 0;

              return (
                <label
                  key={item}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? `${colors.selected} border`
                      : `${colors.item} border border-transparent hover:bg-black/5`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleItem(item)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-text-prim">
                      {item}
                    </span>
                  </div>
                  {count > 0 && (
                    <span
                      className={`text-xs ${colors.count} font-medium px-2 py-1 bg-gray-100 rounded-full`}
                    >
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <div className="flex gap-2 mt-3">
            {remainingCount > 0 && (
              <button
                onClick={handleShowMore}
                className="flex-1 px-3 py-2 text-sm text-text-prim border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                Voir 5 de plus ({remainingCount})
              </button>
            )}

            {limit > maxDisplayed && (
              <button
                onClick={handleShowLess}
                className="px-3 py-2 text-sm text-text-prim border border-gray-200 rounded-lg transition-colors"
                title="Réduire"
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
