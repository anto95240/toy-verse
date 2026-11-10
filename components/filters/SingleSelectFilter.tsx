import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface SingleSelectFilterProps {
  title: string;
  colorScheme: "blue" | "green" | "purple" | "indigo" | "orange" | "red";
  options: { value: string | number; label: string }[];
  selectedValue: string | number;
  onValueChange: (value: string) => void;
  filterCounts: Record<string, number>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  icon?: IconDefinition;
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

export default function SingleSelectFilter({
  title,
  colorScheme,
  options,
  selectedValue,
  onValueChange,
  filterCounts,
  isCollapsed,
  onToggleCollapse,
  icon,
}: SingleSelectFilterProps) {
  const colors = colorClasses[colorScheme];
  const optionCount = options.filter((option) => String(option.value) !== "").length;
  const selectedLabel = options.find(
    (option) => String(option.value) === String(selectedValue)
  )?.label;
  const hasSelection =
    selectedValue !== "" &&
    selectedValue !== null &&
    selectedValue !== undefined;

  return (
    <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={onToggleCollapse}
        className={`w-full px-4 py-3 flex items-center justify-between ${colors.header} ${colors.headerText} font-semibold text-sm hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <FontAwesomeIcon icon={icon} className="w-4 h-4 shrink-0" />}
          <span className="truncate">{title}</span>
          <span
            className="shrink-0 min-w-[1.5rem] text-center tabular-nums text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-background/80 border border-current/20"
            title={`${optionCount} ${title.toLowerCase()}`}
          >
            {optionCount}
          </span>
          {hasSelection && selectedLabel && (
            <span
              className={`shrink-0 max-w-[9rem] truncate px-1.5 py-0.5 bg-background rounded-full text-[11px] font-bold ${colors.count}`}
              title={selectedLabel}
            >
              {selectedLabel}
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
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected =
                selectedValue.toString() === option.value.toString();

              const countKey = option.value.toString();
              const count = filterCounts[countKey] || 0;

              return (
                <label
                  key={option.value || "null"}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary/40"
                      : "border border-transparent hover:bg-black/5"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="radio"
                      name={`${title}-filter`}
                      checked={isSelected}
                      onChange={() => onValueChange(option.value.toString())}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-text-prim">
                      {option.label}
                    </span>
                  </div>
                  {String(option.value) !== "" && (
                    <span
                      className={`shrink-0 min-w-[1.5rem] text-center text-xs tabular-nums font-semibold px-2 py-0.5 rounded-full border border-border bg-background ${
                        count > 0 ? colors.count : "text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
