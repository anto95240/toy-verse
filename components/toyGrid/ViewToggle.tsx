import React from "react";
import { faBoxOpen, faStar } from "@fortawesome/free-solid-svg-icons";
import ToggleButton from "@/components/ui/ToggleButton";

interface ViewToggleProps {
  view: "collection" | "wishlist";
  setView: (view: "collection" | "wishlist") => void;
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="bg-muted/50 p-1 rounded-xl inline-flex w-full md:w-auto">
      <ToggleButton
        isActive={view === "collection"}
        onClick={() => setView("collection")}
        icon={faBoxOpen}
        label="Collection"
        activeColorClass="text-primary"
      />
      <ToggleButton
        isActive={view === "wishlist"}
        onClick={() => setView("wishlist")}
        icon={faStar}
        label="Wishlist"
        activeColorClass="text-purple-600"
      />
    </div>
  );
}
