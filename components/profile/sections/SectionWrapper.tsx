"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface SectionWrapperProps {
  id: string;
  icon: IconDefinition;
  title: string;
  expanded: string | null;
  toggle: (id: string) => void;
  children: React.ReactNode;
}

export default function SectionWrapper({ id, icon, title, expanded, toggle, children }: SectionWrapperProps) {
  const isExpanded = expanded === id;

  return (
    <div className={`transition-colors duration-300 ${isExpanded ? "bg-secondary/30" : ""}`}>
      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(id);
        }}
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-muted-foreground text-sm" />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}