import { createSupabaseServerClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faBox, 
  faPuzzlePiece, 
  faLayerGroup, 
  faStar
} from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"
// IMPORT DU NOUVEAU COMPOSANT
import ProfileSettings from "@/components/profile/ProfileSettings"
import type { Toy } from "@/types/theme"

// ... (Le reste du code StatCard, etc. reste inchangé) ...
const StatCard = ({ title, value, icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) => (
  <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
      <FontAwesomeIcon icon={icon} className="text-2xl" />
    </div>
    <div>
      <p className="text-muted-foreground text-sm font-medium mb-0.5">{title}</p>
      <p className="text-2xl md:text-3xl font-bold text-foreground font-title">{value}</p>
    </div>
  </div>
)

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth")
  }

  const firstName = user.user_metadata?.first_name || "Collectionneur"
  const email = user.email

  // ... (Récupération des stats inchangée) ...
  const { count: totalToys } = await supabase
    .from('toys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: wishlistCount } = await supabase
    .from('toys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_soon', true)

  const { data: rawToysData } = await supabase
    .from('toys')
    .select('nb_pieces, categorie')
    .eq('user_id', user.id)

  const toysData = rawToysData as unknown as { nb_pieces: number | null; categorie: string | null }[]
  const totalPieces = toysData?.reduce((acc, toy) => acc + (toy.nb_pieces || 0), 0) || 0
  const categories = new Set(toysData?.map(t => t.categorie).filter(Boolean)).size

  return (
    <>
      <Navbar prenom={firstName} />
      
      <main className="max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-12 space-y-8 animate-in fade-in duration-500">
        
        <div>
          <h1 className="text-3xl font-bold font-title text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground mt-1">Gérez vos informations et suivez votre collection.</p>
        </div>

        {/* Carte Identité */}
        <div className="bg-gradient-to-br from-primary to-purple-700 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30 shadow-inner">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 pt-2">
              <h2 className="text-3xl font-bold mb-1">{firstName}</h2>
              <p className="text-blue-100 font-medium mb-4">{email}</p>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">
                 <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                 Collectionneur Actif
              </div>
            </div>
          </div>
        </div>

        {/* Section Statistiques */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faLayerGroup} className="text-primary" />
            Statistiques
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Jouets" value={totalToys || 0} icon={faBox} colorClass="bg-blue-500" />
            <StatCard title="Total Pièces" value={totalPieces.toLocaleString()} icon={faPuzzlePiece} colorClass="bg-purple-500" />
            <StatCard title="Catégories" value={categories} icon={faLayerGroup} colorClass="bg-pink-500" />
            <StatCard title="Wishlist" value={wishlistCount || 0} icon={faStar} colorClass="bg-orange-500" />
          </div>
        </section>

        {/* Section Paramètres avec le nouveau composant Accordéon */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">Paramètres du compte</h3>
          <ProfileSettings user={user} />
        </section>

      </main>
    </>
  )
}