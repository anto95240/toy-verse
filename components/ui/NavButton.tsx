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
      <FontAwesomeIcon icon={icon} className="text-xl mb-1" />
      <span className="text-[10px] font-medium">{label}</span>
    </>
  );

  const className = `flex flex-col items-center justify-center w-full h-full transition-colors ${
    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
