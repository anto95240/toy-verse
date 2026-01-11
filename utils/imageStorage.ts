import { getSupabaseClient } from "../lib/supabase/client";
import { convertToWebP } from "./imageConverter";

export async function migrateUserImages(userId: string) {
  const supabase = getSupabaseClient();

  try {
    const { data: files, error: listError } = await supabase.storage
      .from("toys-images")
      .list("", { limit: 1000 });

    if (listError) throw listError;

    const allFiles = [];
    if (files) {
      allFiles.push(...files);

      const { data: toyFiles } = await supabase.storage
        .from("toys-images")
        .list("toys", { limit: 1000 });
      if (toyFiles) {
        toyFiles.forEach((file) =>
          allFiles.push({ ...file, name: `toys/${file.name}` })
        );
      }

      const { data: themeFiles } = await supabase.storage
        .from("toys-images")
        .list("themes", { limit: 1000 });
      if (themeFiles) {
        themeFiles.forEach((file) =>
          allFiles.push({ ...file, name: `themes/${file.name}` })
        );
      }
    }

    const userFiles = allFiles.filter(
      (file) =>
        file.name.startsWith(`${userId}-`) ||
        file.name.includes(`/${userId}-`) ||
        file.name.startsWith(`toys/${userId}-`) ||
        file.name.startsWith(`themes/${userId}-`)
    );

    console.log(
      `Trouvé ${userFiles.length} fichiers à migrer pour l'utilisateur ${userId}`
    );

    for (const file of userFiles) {
      let newPath = "";

      if (
        file.name.includes("themes") ||
        file.name.startsWith(`${userId}-themes`)
      ) {
        const fileName = file.name.split("/").pop() || file.name;
        newPath = `themes/${userId}/${fileName}`;
      } else {
        const fileName = file.name.split("/").pop() || file.name;
        newPath = `toys/${userId}/${fileName}`;
      }

      if (newPath && newPath !== file.name) {
        const { error: copyError } = await supabase.storage
          .from("toys-images")
          .copy(file.name, newPath);

        if (copyError) {
          console.error(`Erreur copie ${file.name} -> ${newPath}:`, copyError);
          continue;
        }

        const { error: deleteError } = await supabase.storage
          .from("toys-images")
          .remove([file.name]);

        if (deleteError) {
          console.error(`Erreur suppression ${file.name}:`, deleteError);
        }

        console.log(`Migré: ${file.name} -> ${newPath}`);
      }
    }

    console.log("Migration terminée avec succès");
    return { success: true, migratedCount: userFiles.length };
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    return { success: false, error };
  }
}

export async function uploadImage(
  userId: string,
  type: "toys" | "themes",
  file: File
): Promise<{ path: string | null; error: string | null }> {
  const supabase = getSupabaseClient();

  try {
    console.log("🚀 Début upload image:");
    console.log("   UserId:", userId);
    console.log("   Type:", type);
    console.log("   Fichier original:", file.name, file.size, file.type);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log("   User connecté:", user?.id);

    if (authError || !user) {
      return { path: null, error: "Utilisateur non authentifié" };
    }

    if (user.id !== userId) {
      return { path: null, error: "Utilisateur incorrect" };
    }

    console.log("🔄 Conversion WebP...");
    const webpFile = await convertToWebP(file);
    console.log(
      "   WebP converti:",
      webpFile.name,
      webpFile.size,
      webpFile.type
    );

    const timestamp = Date.now();
    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.[^/.]+$/, "");

    const imagePath = `${type}/${userId}/${timestamp}-${cleanFileName}.webp`;
    console.log("   Chemin généré:", imagePath);

    const cleanWebpFile = new File(
      [webpFile],
      `${timestamp}-${cleanFileName}.webp`,
      {
        type: "image/webp",
      }
    );

    console.log("📤 Tentative upload vers bucket toys-images...");
    const { data, error } = await supabase.storage
      .from("toys-images")
      .upload(imagePath, cleanWebpFile, { upsert: true });

    console.log("   Résultat upload:");
    console.log("   Data:", data);
    console.log("   Error:", error);

    if (error) {
      console.error("❌ Erreur détaillée:", {
        message: error.message,
        details: error,
      });
      return { path: null, error: error.message };
    }

    console.log("✅ Upload réussi vers:", imagePath);
    return { path: imagePath, error: null };
  } catch (err) {
    console.error("💥 Exception lors de l'upload:", err);
    return {
      path: null,
      error: `Erreur: ${
        err instanceof Error ? err.message : "Erreur inconnue"
      }`,
    };
  }
}

export function getImagePath(
  userId: string,
  type: "toys" | "themes",
  fileName: string
): string {
  const timestamp = Date.now();
  return `${type}/${userId}/${timestamp}.webp`;
}

export function generateImagePath(
  userId: string,
  type: "toys" | "themes"
): string {
  const timestamp = Date.now();
  const filename = `${timestamp}.webp`;
  return `${type}/${userId}/${filename}`;
}
