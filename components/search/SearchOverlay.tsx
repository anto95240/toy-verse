"use client";

import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/home?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm animate-in fade-in duration-200 p-4 safe-top flex flex-col">
      <div className="flex justify-end pt-4 mb-8">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
          aria-label="Fermer"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
      </div>

      <form
        onSubmit={search}
        className="flex flex-col gap-6 mt-10 w-full max-w-lg mx-auto"
      >
        <h2 className="text-3xl font-bold text-center font-title">
          Que cherchez-vous ?
        </h2>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Lego Star Wars..."
          className="w-full bg-transparent border-b-2 border-primary/50 py-4 text-2xl text-center focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="mx-auto mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          Rechercher <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </form>
    </div>
  );
}
