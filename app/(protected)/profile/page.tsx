import { createSupabaseServerClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { 
  faBox, faBuilding, faEye, faStar, faPuzzlePiece, 
  faLayerGroup, faHistory, faCartPlus, faTrophy, faCalendarCheck 
} from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"
import ProfileSettings from "@/components/profile/ProfileSettings"
import { calculateProfileStats } from "@/utils/statsCalculator"
import type { Toy, Theme } from "@/types/theme"
import StatCard from "@/components/profile/StatCard"

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  // Récupération Données
  const { data: rawToys } = await supabase.from('toys').select('*').eq('user_id', user.id)
  const { data: rawThemes } = await supabase.from('themes').select('id, name')
  
  const toys = (rawToys || []) as unknown as Toy[]
  const themes = (rawThemes || []) as unknown as Theme[]

  // Calculs via l'utilitaire
  const stats = calculateProfileStats(toys, themes)
  
  const userStats = user.user_metadata?.stats_preferences || [
    'total_collection', 'top_theme', 'favorite_brand', 'last_toy'
  ]

  const renderStat = (id: string) => {
    switch(id) {
        case 'total_collection': 
            return <StatCard title="Total Collection" value={stats.totalToys} icon={faBox} color="bg-blue-500" />
        case 'total_pieces': 
            return <StatCard title="Total Pièces" value={stats.totalPieces.toLocaleString()} icon={faPuzzlePiece} color="bg-indigo-500" />
        case 'top_theme': 
            return <StatCard title="Thème Favori" value={stats.topTheme} icon={faTrophy} color="bg-yellow-500" />
        case 'last_toy': 
            return <StatCard title="Dernier Ajout" value={stats.lastToy.name} subtext={stats.lastToy.theme} icon={faCalendarCheck} color="bg-teal-500" />
        case 'top_category':
            return <StatCard title="Top Catégorie" value={stats.topCategory} icon={faLayerGroup} color="bg-pink-500" />
        case 'favorite_brand':
            return <StatCard title="Marque Favorite" value={stats.favoriteBrand.name} subtext={`${stats.favoriteBrand.count} jouets`} icon={faBuilding} color="bg-purple-500" />
        case 'exposed_count':
            return <StatCard title="Exposés" value={stats.exposedCount} subtext={`${stats.exposedPercentage}% de la collection`} icon={faEye} color="bg-emerald-500" />
        case 'oldest_toy':
            return <StatCard title="Le + Vintage" value={stats.oldestYear || "-"} subtext="Année de sortie" icon={faHistory} color="bg-amber-600" />
        case 'recent_additions':
            return <StatCard title="Nouveautés" value={stats.recentAdditions} subtext="Cette année" icon={faCartPlus} color="bg-lime-500" />
        case 'wishlist_count':
            return <StatCard title="Wishlist" value={stats.wishlistCount} icon={faStar} color="bg-orange-500" />
        default: 
            return null
    }
  }

  return (
    <>
      <Navbar prenom={user.user_metadata?.first_name} />
      
      <main className="max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-12 space-y-8 animate-in fade-in duration-500">
        
        <div className="bg-gradient-to-br from-primary to-purple-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold font-title">{user.user_metadata?.first_name || "Collectionneur"}</h1>
                <p className="opacity-90">{user.email}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Compte Actif
                </div>
            </div>
            {/* Décoration background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold">Statistiques</h3>
          </div>
          
          {userStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4">
                {userStats.map((id: string) => <div key={id}>{renderStat(id)}</div>)}
            </div>
          ) : (
            <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground italic">
               Aucune statistique sélectionnée.
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">Paramètres</h3>
          <ProfileSettings user={user} />
        </section>

      </main>
    </>
  )
}