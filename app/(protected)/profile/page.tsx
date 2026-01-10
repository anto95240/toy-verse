import { createSupabaseServerClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faBox, 
  faBuilding, 
  faEye, 
  faStar,
  faPuzzlePiece,
  faLayerGroup,
  faHistory,
  faCartPlus,
  faTrophy,
  faCalendarCheck
} from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"
import ProfileSettings from "@/components/profile/ProfileSettings"
import type { Toy, Theme } from "@/types/theme" // CORRECTION : Theme ajouté

const StatCard = ({ title, value, subtext, icon, colorClass }: { title: string, value: string | number, subtext?: string, icon: any, colorClass: string }) => (
  <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group h-full">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
      <FontAwesomeIcon icon={icon} className="text-2xl" />
    </div>
    <div>
      <p className="text-muted-foreground text-sm font-medium mb-0.5">{title}</p>
      <p className="text-xl font-semibold text-foreground font-title truncate max-w-[180px]">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
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

  // 1. Récupération des jouets
  const { data: rawToys } = await supabase
    .from('toys')
    .select('id, nom, categorie, studio, theme_id, is_exposed, is_soon, nb_pieces, release_date, created_at')
    .eq('user_id', user.id)

  // 2. Récupération des thèmes
  const { data: rawThemes } = await supabase
    .from('themes')
    .select('id, name')

  const toys = (rawToys || []) as unknown as Toy[]
  const themes = (rawThemes || []) as unknown as Theme[]
  const themeMap = new Map(themes.map(t => [t.id, t.name]))

  // --- CALCULS STATISTIQUES ---
  const totalToys = toys.length
  const wishlistCount = toys.filter(t => t.is_soon).length
  
  const exposedCount = toys.filter(t => t.is_exposed).length
  const exposedPercentage = totalToys > 0 ? Math.round((exposedCount / totalToys) * 100) : 0

  const totalPieces = toys.reduce((acc, t) => acc + (t.nb_pieces || 0), 0)

  // Top Thème
  const themeCounts: Record<string, number> = {}
  toys.forEach(t => { 
      const tName = themeMap.get(t.theme_id) || "Inconnu"
      themeCounts[tName] = (themeCounts[tName] || 0) + 1 
  })
  const topThemeEntry = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0]
  const topTheme = topThemeEntry ? topThemeEntry[0] : "-"

  // Dernier Ajout (Jouet + Thème)
  const sortedByDate = [...toys].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const lastToy = sortedByDate.length > 0 ? sortedByDate[0] : null
  const lastToyName = lastToy ? lastToy.nom : "-"
  const lastToyTheme = lastToy ? (themeMap.get(lastToy.theme_id) || "") : ""
  
  // Top Marque
  const studioCounts: Record<string, number> = {}
  toys.forEach(t => { if(t.studio) studioCounts[t.studio] = (studioCounts[t.studio] || 0) + 1 })
  const topStudioEntry = Object.entries(studioCounts).sort((a, b) => b[1] - a[1])[0]
  const favoriteBrand = topStudioEntry ? topStudioEntry[0] : "Aucune"
  const favoriteBrandCount = topStudioEntry ? topStudioEntry[1] : 0

  // Top Categorie
  const catCounts: Record<string, number> = {}
  toys.forEach(t => { if(t.categorie) catCounts[t.categorie] = (catCounts[t.categorie] || 0) + 1 })
  const topCatEntry = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]
  const topCategory = topCatEntry ? topCatEntry[0] : "Aucune"

  // Vintage
  const releaseYears = toys
    .map(t => t.release_date)
    .filter((d): d is number => typeof d === 'number' && d > 1900 && d < 2100)
  const oldestYear = releaseYears.length > 0 ? Math.min(...releaseYears) : null

  // Récents
  const currentYear = new Date().getFullYear()
  const recentAdditions = toys.filter(t => t.created_at && new Date(t.created_at).getFullYear() === currentYear).length

  // --- PRÉFÉRENCES ---
  const defaultStats = ['total_collection', 'top_theme', 'favorite_brand', 'last_toy']
  const userStats = user.user_metadata?.stats_preferences || defaultStats

  const renderStat = (statId: string) => {
    switch(statId) {
        case 'total_collection':
            return <StatCard key={statId} title="Total Collection" value={totalToys} icon={faBox} colorClass="bg-blue-500" />
        case 'total_pieces':
            return <StatCard key={statId} title="Total Pièces" value={totalPieces.toLocaleString()} icon={faPuzzlePiece} colorClass="bg-indigo-500" />
        case 'top_theme':
            return <StatCard key={statId} title="Thème Favori" value={topTheme} icon={faTrophy} colorClass="bg-yellow-500" />
        case 'last_toy':
            // CORRECTION : Thème affiché ici en sous-texte
            return <StatCard key={statId} title="Dernier Ajout" value={lastToyName} subtext={lastToyTheme ? `Thème : ${lastToyTheme}` : undefined} icon={faCalendarCheck} colorClass="bg-teal-500" />
        case 'top_category':
            return <StatCard key={statId} title="Top Catégorie" value={topCategory} icon={faLayerGroup} colorClass="bg-pink-500" />
        case 'favorite_brand':
            return <StatCard key={statId} title="Marque Favorite" value={favoriteBrand} subtext={favoriteBrand !== "Aucune" ? `${favoriteBrandCount} jouets` : undefined} icon={faBuilding} colorClass="bg-purple-500" />
        case 'exposed_count':
            return <StatCard key={statId} title="Exposés" value={`${exposedCount}`} subtext={`${exposedPercentage}% de la collection`} icon={faEye} colorClass="bg-emerald-500" />
        case 'oldest_toy':
            return <StatCard key={statId} title="Le + Vintage" value={oldestYear || "-"} subtext="Année de sortie" icon={faHistory} colorClass="bg-amber-600" />
        case 'recent_additions':
            return <StatCard key={statId} title="Nouveautés" value={recentAdditions} subtext={`Ajoutés en ${currentYear}`} icon={faCartPlus} colorClass="bg-lime-500" />
        case 'wishlist_count':
            return <StatCard key={statId} title="Wishlist" value={wishlistCount} icon={faStar} colorClass="bg-orange-500" />
        default:
            return null
    }
  }

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

        {/* Section Statistiques Dynamique */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Statistiques de collection</h3>
          </div>
          
          {userStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                {userStats.map((statId: string) => renderStat(statId))}
            </div>
          ) : (
            <div className="p-8 text-center bg-card border border-border rounded-xl">
               <p className="text-muted-foreground italic">Aucune statistique sélectionnée. Allez dans les paramètres ci-dessous pour configurer votre tableau de bord.</p>
            </div>
          )}
        </section>

        {/* Section Paramètres */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-4">Paramètres du compte</h3>
          <ProfileSettings user={user} />
        </section>

      </main>
    </>
  )
}