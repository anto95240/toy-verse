'use server'

import { createSupabaseAdmin } from "@/utils/supabase/admin"
import { createSupabaseServerClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(formData: {
  firstName: string
  lastName: string
  email: string
}) {
  const supabase = await createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdmin()

  // 1. Récupérer l'utilisateur courant pour avoir son ID
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error("Utilisateur non connecté")

  // 2. Mise à jour via Admin (Bypasse la confirmation email)
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email: formData.email,
    user_metadata: {
      first_name: formData.firstName,
      last_name: formData.lastName
    },
    email_confirm: true // FORCE la validation immédiate de l'email
  })

  if (error) throw new Error(error.message)

  revalidatePath('/profile')
  return { success: true }
}