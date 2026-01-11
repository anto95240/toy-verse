import { useState, useEffect } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Theme } from "@/types/theme";

export function useBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const supabase = getSupabaseClient();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemesOpen, setIsThemesOpen] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (isThemesOpen && themes.length === 0) {
      supabase
        .from("themes")
        .select("*")
        .order("name")
        .then(({ data }) => {
          if (data) setThemes(data);
        });
    }
  }, [isThemesOpen, themes.length, supabase]);

  const handleAddClick = () => {
    if (params?.themeSlug) {
      router.push(
        `${pathname}${window.location.search}${
          window.location.search ? "&" : "?"
        }action=add`,
        { scroll: false }
      );
    } else if (pathname === "/home" || pathname === "/") {
      router.push(
        `${pathname}${window.location.search}${
          window.location.search ? "&" : "?"
        }action=add`,
        { scroll: false }
      );
    } else {
      alert(
        "Allez sur l'Accueil pour ajouter un Thème, ou dans une Collection pour ajouter un Jouet."
      );
    }
  };

  return {
    isSearchOpen,
    setIsSearchOpen,
    isThemesOpen,
    setIsThemesOpen,
    themes,
    handleAddClick,
    isActive,
  };
}
