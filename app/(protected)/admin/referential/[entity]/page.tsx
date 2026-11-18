/**
 * app/(protected)/admin/referential/[entity]/page.tsx
 *
 * Page générique de gestion d'un référentiel.
 * Rendue côté serveur — charge les données et délègue au composant client.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { ReferentialEntityKey } from "@/types/theme";
import {
  getCategoriesV2,
  getStudios,
  getLicenses,
  getFranchises,
  getCharacters,
  getLocations,
  buildCategoryTree,
  buildStudioTree,
  buildLocationTree,
} from "@/lib/supabase/referential";
import ReferentialPageClient from "@/app/(protected)/admin/referential/[entity]/ReferentialPageClient";

const VALID_ENTITIES: ReferentialEntityKey[] = [
  "category", "studio", "license", "franchise", "character", "location",
];

const ENTITY_LABELS: Record<ReferentialEntityKey, string> = {
  category:  "Catégories",
  studio:    "Studios",
  license:   "Licences",
  franchise: "Franchises",
  character: "Personnages",
  location:  "Lieux d'achat",
};

export default async function ReferentialEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;

  if (!VALID_ENTITIES.includes(entity as ReferentialEntityKey)) {
    notFound();
  }

  const entityType = entity as ReferentialEntityKey;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Chargement des données selon le type d'entité
  let items: unknown[] = [];
  let tree: unknown[] | null = null;

  switch (entityType) {
    case "category": {
      const cats = await getCategoriesV2(supabase);
      items = cats;
      tree  = buildCategoryTree(cats);
      break;
    }
    case "studio": {
      const studios = await getStudios(supabase);
      items = studios;
      tree  = buildStudioTree(studios);
      break;
    }
    case "license": {
      items = await getLicenses(supabase);
      break;
    }
    case "franchise": {
      items = await getFranchises(supabase);
      break;
    }
    case "character": {
      items = await getCharacters(supabase);
      break;
    }
    case "location": {
      const locs = await getLocations(supabase);
      items = locs;
      tree  = buildLocationTree(locs);
      break;
    }
  }

  return (
    <ReferentialPageClient
      entityType={entityType}
      label={ENTITY_LABELS[entityType]}
      items={items}
      tree={tree}
    />
  );
}
