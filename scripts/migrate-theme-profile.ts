import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { getThemeProfile } from "../lib/themeProfile.js";

// Charger les variables d'environnement
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erreur: URL ou Service Key Supabase manquants dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateThemeProfiles() {
  console.log("🚀 Début de la migration des profils de thèmes...");

  // 1. Récupérer tous les thèmes
  const { data: themes, error } = await supabase.from("themes").select("id, name, profile_id");

  if (error) {
    console.error("Erreur lors de la récupération des thèmes :", error);
    process.exit(1);
  }

  if (!themes || themes.length === 0) {
    console.log("Aucun thème à migrer.");
    return;
  }

  console.log(`Trouvé ${themes.length} thème(s).`);

  // 2. Parcourir et mettre à jour
  let updatedCount = 0;

  for (const theme of themes) {
    // Ne mettre à jour que si profile_id n'est pas déjà défini
    if (!theme.profile_id) {
      const profile = getThemeProfile(theme.name);
      
      const { error: updateError } = await supabase
        .from("themes")
        .update({ profile_id: profile.id })
        .eq("id", theme.id);

      if (updateError) {
        console.error(`❌ Erreur mise à jour thème "${theme.name}" (${theme.id}):`, updateError);
      } else {
        console.log(`✅ Thème "${theme.name}" -> profil assigné : ${profile.id}`);
        updatedCount++;
      }
    } else {
      console.log(`⏭️ Thème "${theme.name}" a déjà un profil (${theme.profile_id}). Ignoré.`);
    }
  }

  console.log(`🎉 Migration terminée. ${updatedCount} thèmes mis à jour.`);
}

migrateThemeProfiles().catch(console.error);
