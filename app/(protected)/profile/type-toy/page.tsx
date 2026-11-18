import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserThemeProfiles } from "@/app/actions/themeProfiles";
import Navbar from "@/components/layout/Navbar";
import ThemeProfilesManager from "@/components/profile/ThemeProfilesManager";

export const metadata = { title: "Mes types de jouets — ToyVerse" };

export default async function ProfilesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { profiles } = await getUserThemeProfiles();

  return (
    <>
      <Navbar prenom={user.user_metadata?.first_name} isGlobal={true} />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Fil d'Ariane */}
        <nav className="text-sm text-muted-foreground">
          <Link href="/profile" className="hover:text-foreground transition-colors">Mon profil</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Types de jouets</span>
        </nav>

        <ThemeProfilesManager initialProfiles={profiles} />
      </main>
    </>
  );
}
