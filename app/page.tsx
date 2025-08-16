// app/page.tsx
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/utils/supabase/server"

export default async function RootPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/home")
  } 
  else {
    redirect("/auth")
  }
}
