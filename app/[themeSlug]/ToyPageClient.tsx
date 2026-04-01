"use client";

import { Session } from "@supabase/supabase-js";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Toy } from "@/types/theme";

import Navbar from "@/components/layout/Navbar";
import ScrollToTop from "@/components/common/ScrollToTop";

import { useToyFilters } from "@/hooks/toys/useToyFilters";
import { useToyImages } from "@/hooks/toys/useToyImages";
import { useToast } from "@/context/ToastContext";
import { useFab } from "@/context/FabContext";

import ToyPageContent from "./ToyPageContent";
import ToyPageActions from "./ToyPageActions";

interface Props {
  theme: {
    themeId: string;
    themeName: string;
    image_url: string | null;
    toysCount: number;
    userId: string;
  };
}

export default function ToyPageClient({ theme }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { showToast } = useToast();
  const { registerAction } = useFab();

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toyToEdit, setToyToEdit] = useState<Toy | null>(null);
  const [toyToDeleteId, setToyToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data hooks (from useHomeLogic refactoring)
  const {
    toys,
    setToys,
    categories,
    studios,
    releaseYears,
    filters,
    filterCounts,
    totalToys,
    toggleCategory,
    toggleStudio,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    resetFilters,
    refreshCounts,
    updateCountsOptimistically,
  } = useToyFilters(theme.themeId, !!session);

  const { toyImageUrls, removeToyImageUrl } = useToyImages(toys, currentUserId);

  // Initialize auth
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/auth");
      } else {
        setSession(data.session);
        setCurrentUserId(data.session.user.id);
        setLoading(false);
      }
    };
    init();
  }, [router, supabase]);

  // Register FAB action
  useEffect(() => {
    registerAction(() => {
      setToyToEdit(null);
      setIsModalOpen(true);
    });
  }, [registerAction]);

  // Handle save toy
  const handleSaveToy = useCallback(
    (savedToy: Toy) => {
      updateCountsOptimistically(toyToEdit, savedToy);
      setToys((prev) => {
        const exists = prev.find((t) => t.id === savedToy.id);
        if (exists) {
          return prev.map((t) =>
            t.id === savedToy.id ? savedToy : t
          );
        }
        return [savedToy, ...prev];
      });
      if (savedToy.photo_url) {
        removeToyImageUrl(savedToy.id);
      }
      refreshCounts();
    },
    [toyToEdit, setToys, updateCountsOptimistically, removeToyImageUrl, refreshCounts]
  );

  // Handle delete toy
  const handleConfirmDelete = useCallback(async () => {
    if (!toyToDeleteId) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("toys")
      .delete()
      .eq("id", toyToDeleteId);

    if (!error) {
      setToys((prev) => prev.filter((t) => t.id !== toyToDeleteId));
      removeToyImageUrl(toyToDeleteId);
      refreshCounts();
      showToast("Jouet supprimé", "success");
    } else {
      showToast("Erreur lors de la suppression", "error");
    }
    setIsDeleting(false);
    setToyToDeleteId(null);
  }, [toyToDeleteId, supabase, setToys, removeToyImageUrl, refreshCounts, showToast]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar
        prenom={session.user.user_metadata?.first_name}
        isGlobal={true}
      />
      <ScrollToTop />

      <ToyPageContent
        theme={theme}
        toys={toys}
        categories={categories}
        studios={studios}
        releaseYears={releaseYears}
        filters={filters}
        filterCounts={filterCounts}
        totalToys={totalToys}
        toyImageUrls={toyImageUrls}
        currentUserId={currentUserId}
        onToggleCategory={toggleCategory}
        onToggleStudio={toggleStudio}
        onNbPiecesChange={handleNbPiecesChange}
        onExposedChange={handleExposedChange}
        onSoonChange={handleSoonChange}
        onReleaseYearChange={handleReleaseYearChange}
        onResetFilters={resetFilters}
        onEditToy={(toy: Toy) => {
          setToyToEdit(toy);
          setIsModalOpen(true);
        }}
        onDeleteToy={(toyId: string) => {
          setToyToDeleteId(toyId);
        }}
      />

      <ToyPageActions
        isOpen={isModalOpen}
        themeId={theme.themeId}
        userId={theme.userId}
        toyToEdit={toyToEdit}
        toyToDeleteId={toyToDeleteId}
        isDeleting={isDeleting}
        toys={toys}
        searchResults={[]}
        onCloseModal={() => {
          setIsModalOpen(false);
          setToyToEdit(null);
        }}
        onSaveToy={handleSaveToy}
        onConfirmDelete={handleConfirmDelete}
        onCloseDeleteModal={() => {
          setToyToDeleteId(null);
        }}
      />
    </>
  );
}