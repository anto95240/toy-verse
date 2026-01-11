import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Theme } from "@/types/theme";

export function useNavbarLogic() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [themes, setThemes] = useState<Theme[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileThemesOpen, setIsMobileThemesOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("themes")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setThemes(data);
      });
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return {
    themes,
    isDropdownOpen,
    setIsDropdownOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isMobileThemesOpen,
    setIsMobileThemesOpen,
    handleLogout,
    dropdownRef,
  };
}
