"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { profileSchema } from "@/lib/validations";

export async function updateUserProfile(formData: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  const parsedData = profileSchema.safeParse(formData);
  
  if (!parsedData.success) {
    return { success: false, error: parsedData.error.issues[0]?.message || "Données invalides" };
  }

  const { firstName, lastName, email } = parsedData.data;
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: "Utilisateur non connecté" };

  const { error: metaError } = await supabase.auth.updateUser({
    data: { first_name: firstName, last_name: lastName },
  });

  if (metaError) return { success: false, error: metaError.message };

  let emailConfirmationSent = false;
  if (user.email !== email) {
    const { error: emailError } = await supabase.auth.updateUser({ email: email });
    if (emailError) return { success: false, error: emailError.message };
    emailConfirmationSent = true;
  }

  revalidatePath("/profile");
  return { success: true, emailConfirmationSent };
}

export async function deleteUserAccount() {
  const supabase = await createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdmin();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: "Utilisateur non authentifié." };

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) return { success: false, error: deleteError.message };

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Impossible de supprimer le compte." };
  }
}