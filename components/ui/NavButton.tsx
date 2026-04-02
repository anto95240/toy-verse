import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface NavButtonProps {
  icon: IconDefinition;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  href?: string;
}

export default function NavButton({
  icon,
  label,
  isActive,
  onClick,
  href,
}: NavButtonProps) {
  const content = (
    <>
      <FontAwesomeIcon icon={icon} className="text-xl mb-1.5 transition-all duration-300" />
      <span className="text-[10px] font-semibold">{label}</span>
    </>
  );

  const className = `flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
    isActive 
      ? "text-primary scale-110" 
      : "text-muted-foreground hover:text-foreground hover:scale-105"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}
