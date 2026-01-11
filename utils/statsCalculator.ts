import type { Toy, Theme } from "@/types/theme";

export function calculateProfileStats(toys: Toy[], themes: Theme[]) {
  const themeMap = new Map(themes.map((t) => [t.id, t.name]));

  const totalToys = toys.length;
  const wishlistCount = toys.filter((t) => t.is_soon).length;
  const exposedCount = toys.filter((t) => t.is_exposed).length;
  const exposedPercentage =
    totalToys > 0 ? Math.round((exposedCount / totalToys) * 100) : 0;
  const totalPieces = toys.reduce((acc, t) => acc + (t.nb_pieces || 0), 0);

  const getTop = (key: keyof Toy | "theme_id", map?: Map<string, string>) => {
    const counts: Record<string, number> = {};
    toys.forEach((t) => {
      const rawVal =
        key === "theme_id"
          ? map?.get(t.theme_id) || "Inconnu"
          : t[key as keyof Toy];

      const val = String(rawVal || "");

      if (val && val !== "null") counts[val] = (counts[val] || 0) + 1;
    });
    const entry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { name: entry?.[0] || "Aucun", count: entry?.[1] || 0 };
  };

  const topTheme = getTop("theme_id", themeMap).name;
  const favoriteBrand = getTop("studio");
  const topCategory = getTop("categorie").name;

  const sortedToys = [...toys].sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  );
  const lastToy = sortedToys[0];

  const releaseYears = toys
    .map((t) => t.release_date)
    .filter((d): d is number => typeof d === "number" && d > 1900);
  const oldestYear = releaseYears.length ? Math.min(...releaseYears) : null;
  const currentYear = new Date().getFullYear();
  const recentAdditions = toys.filter(
    (t) => t.created_at && new Date(t.created_at).getFullYear() === currentYear
  ).length;

  return {
    totalToys,
    wishlistCount,
    exposedCount,
    exposedPercentage,
    totalPieces,
    topTheme,
    topCategory,
    favoriteBrand,
    lastToy: {
      name: lastToy?.nom || "-",
      theme: lastToy ? themeMap.get(lastToy.theme_id) || "" : "",
    },
    oldestYear,
    recentAdditions,
  };
}
