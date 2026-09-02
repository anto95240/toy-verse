/**
 * scripts/migrate-legacy-profiles.ts
 *
 * Migre les profils codés en dur vers la table theme_profiles en DB.
 * Exécuter une seule fois : npx tsx scripts/migrate-legacy-profiles.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { ALL_PROFILES } from "../lib/themeProfile";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Variables d'environnement manquantes. Vérifiez .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  // 1. Récupérer tous les utilisateurs (on migre les profils pour chacun)
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError || !users) {
    console.error("❌  Impossible de lister les utilisateurs :", usersError?.message);
    process.exit(1);
  }

  console.log(`👥  ${users.users.length} utilisateur(s) trouvé(s).`);

  for (const user of users.users) {
    console.log(`\n🔄  Migration pour ${user.email} (${user.id})`);

    // Vérifier si l'utilisateur a déjà des profils en DB
    const { data: existing } = await supabase
      .from("theme_profiles")
      .select("id")
      .eq("user_id", user.id);

    if (existing && existing.length > 0) {
      console.log(`   ⏭️  Déjà ${existing.length} profil(s) en DB — on saute.`);
      continue;
    }

    // Insérer tous les profils legacy
    const profilesToInsert = ALL_PROFILES.map((p) => ({
      user_id: user.id,
      label: p.label,
      emoji: p.emoji,
      primary_fields: p.primaryFields,
      details_first_fields: p.detailsFirstFields,
      hidden_fields: p.hiddenFields,
      field_labels: p.fieldLabels ?? {},
      field_placeholders: p.fieldPlaceholders ?? {},
      suggested_category_names: p.suggestedCategoryNames ?? [],
      hint: p.hint ?? null,
      auto_open_details: p.autoOpenDetails,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("theme_profiles")
      .insert(profilesToInsert)
      .select("id, label");

    if (insertError) {
      console.error(`   ❌  Erreur d'insertion :`, insertError.message);
      continue;
    }

    console.log(`   ✅  ${inserted?.length} profils insérés.`);

    // Mettre à jour les thèmes existants de cet utilisateur
    // pour pointer vers les nouveaux UUIDs en DB
    if (inserted && inserted.length > 0) {
      const { data: themes } = await supabase
        .from("themes")
        .select("id, name, profile_id")
        .eq("user_id", user.id);

      if (themes && themes.length > 0) {
        console.log(`   🔗  Mise à jour de ${themes.length} thème(s)...`);

        // Construire un mapping label → id DB
        const labelToId: Record<string, string> = {};
        for (const row of inserted as { id: string; label: string }[]) {
          labelToId[row.label] = row.id;
        }

        // Mapping des anciens IDs legacy (ex: "lego") vers les labels
        const legacyIdToLabel: Record<string, string> = {
          lego: "Lego",
          puzzle: "Puzzle",
          puzzle3d: "Puzzle 3D",
          pop: "Funko Pop",
          figurine: "Figurine",
          peluche: "Peluche",
          playmobil: "Playmobil",
          meccano: "Jeux de construction",
          vehicule: "Véhicule / Modèle réduit",
          souvenir: "Souvenir / Voyage",
          default: "Par défaut",
        };

        for (const theme of themes) {
          const legacyId = theme.profile_id as string | null;
          if (!legacyId) continue;

          // Si c'est déjà un UUID, on ne touche pas
          if (legacyId.includes("-") && legacyId.length > 20) continue;

          const label = legacyIdToLabel[legacyId];
          const newId = label ? labelToId[label] : null;

          if (newId) {
            await supabase
              .from("themes")
              .update({ profile_id: newId })
              .eq("id", theme.id);
            console.log(`      → Thème "${theme.name}": ${legacyId} → ${newId.slice(0, 8)}...`);
          }
        }
      }
    }
  }

  console.log("\n🎉  Migration terminée !");
}

main().catch((e) => { console.error(e); process.exit(1); });
