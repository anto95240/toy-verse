/**
 * Résout une entrée de référentiel par nom exact (ou alias),
 * et la crée si elle n'existe pas. Utilisé pour les studios imposés
 * (Funko, The LEGO Group, Playmobil) et les thèmes LEGO suggérés.
 */

export type ResolvedReferential = {
  id: string;
  name: string;
  slug: string;
};

type SearchHit = {
  id: string;
  name: string;
  slug: string;
  aliases?: string[];
  matchedAlias?: string;
};

function fold(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function pickExact(results: SearchHit[], query: string): SearchHit | null {
  const normalized = fold(query);
  if (!normalized) return null;
  return (
    results.find((hit) => {
      if (fold(hit.name) === normalized) return true;
      if ((hit.aliases ?? []).some((alias) => fold(alias) === normalized)) return true;
      if (hit.matchedAlias && fold(hit.matchedAlias) === normalized) return true;
      return false;
    }) ?? null
  );
}

export async function resolveOrCreateReferential(
  entityType: "studio" | "category",
  candidates: string[],
  parentId?: string | null
): Promise<ResolvedReferential | null> {
  const names = candidates.map((name) => name.trim()).filter(Boolean);
  if (names.length === 0) return null;

  for (const name of names) {
    try {
      const res = await fetch(
        `/api/referential/search?entity=${entityType}&q=${encodeURIComponent(name)}&limit=8`
      );
      if (!res.ok) continue;
      const json = await res.json();
      const exact = pickExact((json.results ?? []) as SearchHit[], name);
      if (exact) return { id: exact.id, name: exact.name, slug: exact.slug };
    } catch {
      // On tente le candidat suivant, puis la création.
    }
  }

  try {
    const res = await fetch("/api/admin/migration/create-entity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType,
        name: names[0],
        parentId: parentId ?? null,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.entity?.id) return null;
    return {
      id: data.entity.id as string,
      name: data.entity.name as string,
      slug: data.entity.slug as string,
    };
  } catch {
    return null;
  }
}
