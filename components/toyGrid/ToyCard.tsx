import React from "react";
import { ToyCardMobile } from "./ToyCardMobile";
import { ToyCardDesktop } from "./ToyCardDesktop";
import type { ToyCardProps } from "@/types/toyGrid";

/**
 * ToyCard Component
 * Responsive toy card that switches between mobile and desktop layouts
 * Delegation to specialized components for cleaner structure
 */
export default function ToyCard(props: ToyCardProps) {
  return (
    <li className="w-full group">
      {/* Mobile view (hidden on sm and above) */}
      <div className="sm:hidden">
        <ToyCardMobile {...props} />
      </div>

      {/* Desktop view (hidden below sm) */}
      <div className="hidden sm:block">
        <ToyCardDesktop {...props} />
      </div>
    </li>
  );
}