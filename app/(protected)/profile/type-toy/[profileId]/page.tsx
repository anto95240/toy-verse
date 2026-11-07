"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch, faTimes, faBox, faTag } from "@fortawesome/free-solid-svg-icons";

type ToyItem = {
  id: string;
  nom: string;
  photo_url: string | null;
  theme_id: string;
  theme_name: string;
  categorie: string | null;
  studio: string | null;
  category_ids: string[] | null;
  is_exposed: boolean;
  is_soon: boolean;
};

type ThemeItem = { id: string; name: string };

export default function ProfileTypeToyDetailPage() {
  const params = useParams<{ profileId: string }>();
  const router = useRouter();
  const profileId = params?.profileId ?? "";

  const [toys, setToys]           = useState<ToyItem[]>([]);
  const [themes, setThemes]       = useState<ThemeItem[]>([]);
  const [profileLabel, setProfileLabel] = useState<string>("");
  const [profileEmoji, setProfileEmoji] = useState<string>("🧸");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");

  useEffect(() => {
    if (!profileId) return;

    async function loadData() {
      setLoading(true);
      try {
        // Charger les jouets
        const toysRes = await fetch(`/api/profile/type-toy/${profileId}/toys`);
        if (!toysRes.ok) throw new Error("Impossible de charger les jouets");
        const toysData = await toysRes.json() as { toys: ToyItem[]; themes: ThemeItem[] };
        setToys(toysData.toys ?? []);
        setThemes(toysData.themes ?? []);

        // Charger le profil pour le label
        const profileRes = await fetch(`/api/profile/type-toy/${profileId}/info`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfileLabel(profileData.label ?? "Type de jouet");
          setProfileEmoji(profileData.emoji ?? "🧸");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [profileId]);

  const filteredToys = toys.filter((toy) => {
    const matchSearch = !search ||
      toy.nom.toLowerCase().includes(search.toLowerCase()) ||
      (toy.theme_name && toy.theme_name.toLowerCase().includes(search.toLowerCase()));
    const matchTheme = selectedTheme === "all" || toy.theme_id === selectedTheme;
    return matchSearch && matchTheme;
  });

  const isMigrated = (toy: ToyItem) => (toy.category_ids ?? []).filter(Boolean).length > 0;

  return (
    <>
      <Navbar isGlobal={true} />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Fil d&apos;Ariane */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/profile" className="hover:text-foreground transition-colors">Mon profil</Link>
          <span>/</span>
          <Link href="/profile/type-toy" className="hover:text-foreground transition-colors">Types de jouets</Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {profileEmoji} {profileLabel || "Chargement..."}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <span className="text-3xl">{profileEmoji}</span>
              {profileLabel || "..."}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Chargement..." : `${toys.length} jouet(s) assigné(s) dans ${themes.length} thème(s)`}
            </p>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Filtres */}
        {!loading && toys.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un jouet..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-sm" />
                </button>
              )}
            </div>

            {/* Filtre par thème */}
            {themes.length > 1 && (
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all sm:w-52"
              >
                <option value="all">Tous les thèmes ({toys.length})</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({toys.filter(toy => toy.theme_id === t.id).length})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Chargement des jouets...</p>
          </div>
        )}

        {/* Grille de jouets */}
        {!loading && !error && (
          <>
            {filteredToys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl gap-4 text-muted-foreground">
                <div className="text-5xl opacity-30">🧸</div>
                {toys.length === 0 ? (
                  <>
                    <p className="font-medium text-foreground">Aucun jouet assigné à ce type</p>
                    <p className="text-sm text-center max-w-xs">
                      Pour assigner des jouets à ce type, associez ce profil à un thème dans les paramètres de thème.
                    </p>
                  </>
                ) : (
                  <p className="font-medium">Aucun résultat pour cette recherche</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {filteredToys.length} jouet(s) affiché(s)
                  {(search || selectedTheme !== "all") && ` sur ${toys.length}`}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredToys.map((toy) => (
                    <ToyCard key={toy.id} toy={toy} isMigrated={isMigrated(toy)} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}

function ToyCard({ toy, isMigrated }: { toy: ToyItem; isMigrated: boolean }) {
  return (
    <div className="group flex flex-col gap-2 rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-secondary/30">
        {toy.photo_url ? (
          <Image
            src={toy.photo_url}
            alt={toy.nom}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">
            🧸
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {toy.is_soon && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/90 text-white">
              Bientôt
            </span>
          )}
          {isMigrated && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/90 text-white" title="Migré V2">
              V2
            </span>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="px-3 pb-3 space-y-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{toy.nom}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FontAwesomeIcon icon={faTag} className="text-[10px]" />
          <span className="truncate">{toy.theme_name}</span>
        </div>
        {toy.categorie && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FontAwesomeIcon icon={faBox} className="text-[10px]" />
            <span className="truncate">{toy.categorie}</span>
          </div>
        )}
      </div>
    </div>
  );
}