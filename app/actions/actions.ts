"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// Schéma de validation Zod
const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit faire au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
});

export async function updateUserProfile(formData: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  // 1. Validation des données avec Zod
  const parsedData = profileSchema.safeParse(formData);
  if (!parsedData.success) {
    // CORRECTION : Utilisation de "issues" à la place de "errors"
    throw new Error(parsedData.error.issues[0]?.message || "Données invalides");
  }

  const { firstName, lastName, email } = parsedData.data;

  // 2. Utilisation du client serveur classique (sécurisé via RLS)
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Utilisateur non connecté");

  // 3. Mise à jour des métadonnées (nom, prénom)
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (metaError) throw new Error(metaError.message);

  let emailConfirmationSent = false;

  // 4. Mise à jour de l'email UNIQUEMENT s'il a changé
  if (user.email !== email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: email,
    });

    if (emailError) throw new Error(emailError.message);
    emailConfirmationSent = true;
  }

  revalidatePath("/profile");
  return { success: true, emailConfirmationSent };
}

export async function deleteUserAccount() {
  const supabase = await createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdmin();

  try {
    // 1. Vérifier qui fait la demande
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Utilisateur non authentifié.");
    }

    // 2. Supprimer l'utilisateur via l'API Admin de Supabase
    // Cela supprimera l'auth, et si tes clés étrangères sont en "CASCADE", 
    // ça supprimera aussi toutes ses données (jouets, thèmes, etc.)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Impossible de supprimer le compte." };
  }
}