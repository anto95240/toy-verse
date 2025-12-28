import { createSupabaseServerClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBox, faPuzzlePiece, faLayerGroup, faSignOutAlt } from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"

// Composant pour une carte de statistique
const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${color}`}>
      <FontAwesomeIcon icon={icon} className="text-xl" />
    </div>
    <div>
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  </div>
)

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()
  
  // 1. Vérifier la session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth")
  }

  // 2. Récupérer les données utilisateur (metadata)
  const firstName = user.user_metadata?.first_name || "Collectionneur"
  const email = user.email

  // 3. Récupérer les statistiques depuis la DB
  // Nombre total de jouets
  const { count: totalToys } = await supabase
    .from('toys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Nombre de jouets "Bientôt" (Wishlist)
  const { count: wishlistCount } = await supabase
    .from('toys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_soon', true)

  // Calcul du nombre de pièces total (nécessite de récupérer les données)
  const { data: toysData } = await supabase
    .from('toys')
    .select('nb_pieces, categorie')
    .eq('user_id', user.id)

  const totalPieces = toysData?.reduce((acc, toy) => acc + (toy.nb_pieces || 0), 0) || 0
  
  // Nombre de thèmes/catégories uniques
  const categories = new Set(toysData?.map(t => t.categorie).filter(Boolean)).size

  return (
    <>
      <Navbar prenom={firstName} />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
        <h1 className="text-3xl font-bold font-title mb-2">Mon Profil</h1>
        <p className="text-muted-foreground mb-8">Gérez votre compte et visualisez vos statistiques.</p>

        {/* Section Info Utilisateur */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-6 md:p-10 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30 backdrop-blur-md">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{firstName}</h2>
              <p className="text-blue-100">{email}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium border border-white/10">
                 Membre depuis 2024
              </div>
            </div>
          </div>
        </div>

        {/* Grille de Statistiques */}
        <h3 className="text-xl font-bold mb-4">Statistiques de collection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard 
            title="Total Jouets" 
            value={totalToys || 0} 
            icon={faBox} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Total Pièces" 
            value={totalPieces.toLocaleString()} 
            icon={faPuzzlePiece} 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Catégories" 
            value={categories} 
            icon={faLayerGroup} 
            color="bg-pink-500" 
          />
          <StatCard 
            title="Dans la Wishlist" 
            value={wishlistCount || 0} 
            icon={faBox} 
            color="bg-orange-500 opacity-80" 
          />
        </div>

        {/* Actions du compte */}
        <h3 className="text-xl font-bold mb-4">Paramètres</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left">
            <span>Modifier le profil</span>
            <span className="text-muted-foreground">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-left">
            <span>Changer de mot de passe</span>
            <span className="text-muted-foreground">→</span>
          </button>
          
          {/* Le bouton déconnexion est ici aussi pour le mobile */}
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors text-left font-medium">
              <span>Se déconnecter</span>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </form>
        </div>
      </main>
    </>
  )
}