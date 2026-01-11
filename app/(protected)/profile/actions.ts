"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  const supabase = await createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdmin();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Utilisateur non connecté");

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email: formData.email,
    user_metadata: {
      first_name: formData.firstName,
      last_name: formData.lastName,
    },
    email_confirm: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/profile");
  return { success: true };
}
