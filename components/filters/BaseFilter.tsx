"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type { BaseFilterProps } from "@/types/filters";

interface BaseFilterWrapperProps extends BaseFilterProps {
  children: React.ReactNode;
}

const colorSchemes = {
  blue: {
    dot: "bg-blue-500",
    text: "text-blue-600 hover:text-blue-600",
    selected: "text-blue-600 font-semibold",
    badge: "bg-blue-100 text-blue-700",
    badgeDefault: "bg-bg-second text-text-prim",
  },
  green: {
    dot: "bg-green-500",
    hover: "hover:bg-green-50 hover:border-green-200",
    text: "text-green-600 hover:text-green-600",
    selected: "text-green-600 font-semibold",
    badge: "bg-green-100 text-green-700",
    badgeDefault: "bg-bg-second text-text-prim",
  },
  purple: {
    dot: "bg-purple-500",
    hover: "hover:bg-purple-50 hover:border-purple-200",
    text: "text-purple-600 hover:text-purple-600",
    selected: "text-purple-600 font-semibold",
    badge: "bg-purple-100 text-purple-700",
    badgeDefault: "bg-bg-second text-text-prim",
  },
  orange: {
    dot: "bg-orange-500",
    hover: "hover:bg-orange-50 hover:border-orange-200",
    text: "text-orange-600 hover:text-orange-600",
    selected: "text-orange-600 font-semibold",
    badge: "bg-orange-100 text-orange-700",
    badgeDefault: "bg-bg-second text-text-prim",
  },
  red: {
    dot: "bg-red-500",
    hover: "hover:bg-red-50 hover:border-red-200",
    text: "text-red-600 hover:text-red-600",
    selected: "text-red-600 font-semibold",
    badge: "bg-red-100 text-red-700",
    badgeDefault: "bg-bg-second text-text-prim",
  },
  indigo: {
    dot: "bg-indigo-500",
    hover: "hover:bg-indigo-50 hover:border-indigo-200",
    text: "text-indigo-600 hover:text-indigo-600",
    selected: "text-indigo-600 font-semibold",
    badge: "bg-indigo-100 text-indigo-700",
    badgeDefault: "bg-bg-second text-text-prim",
  },
};

export default function BaseFilter({
  title,
  colorScheme,
  isCollapsed = true,
  onToggleCollapse,
  children,
}: BaseFilterWrapperProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <div className="pb-6">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <h3 className="font-semibold text-text-prim flex items-center">
          <span className={`w-2 h-2 ${colors.dot} rounded-full mr-2`}></span>
          {title}
        </h3>
        {onToggleCollapse && (
          <button
            className={`text-text-prim ${colors.text} transition-colors p-1`}
            aria-label={isCollapsed ? `Fermer ${title}` : `Ouvrir ${title}`}
          >
            <FontAwesomeIcon
              icon={isCollapsed ? faChevronDown : faChevronUp}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>

      {!isCollapsed && <div className="space-y-2">{children}</div>}
    </div>
  );
}

export { colorSchemes };
