"use client"

import React, { useState } from "react"
import { getSupabaseClient } from "@/utils/supabase/client"
import { updateUserProfile } from "@/app/(protected)/profile/actions" // Import de l'action
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faUserPen, faLock, faSignOutAlt, faChevronDown, faChevronUp,
  faSave, faChartPie, faCheck, faEnvelope
} from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"

// ... (AVAILABLE_STATS reste identique) ...
const AVAILABLE_STATS = [
  { id: 'total_collection', label: 'Total Collection' },
  { id: 'total_pieces', label: 'Total Pièces' },
  { id: 'top_theme', label: 'Thème Favori' },
  { id: 'last_toy', label: 'Dernier Ajout' },
  { id: 'favorite_brand', label: 'Marque Favorite' },
  { id: 'top_category', label: 'Catégorie Favorite' },
  { id: 'oldest_toy', label: 'Le + Vintage' },
  { id: 'recent_additions', label: 'Acquis cette année' },
  { id: 'exposed_count', label: 'Jouets Exposés' },
  { id: 'wishlist_count', label: 'Wishlist' },
]

export default function ProfileSettings({ user }: { user: any }) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  
  const [expandedSection, setExpandedSection] = useState<'info' | 'password' | 'stats' | null>(null)
  
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || "")
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || "")
  const [email, setEmail] = useState(user?.email || "")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedStats, setSelectedStats] = useState<string[]>(
    user?.user_metadata?.stats_preferences || AVAILABLE_STATS.map(s => s.id)
  )
  const [loading, setLoading] = useState(false)

  const toggleSection = (section: 'info' | 'password' | 'stats') => {
    setExpandedSection(expandedSection === section ? null : section)
    if (section !== 'password') { setPassword(""); setConfirmPassword("") }
  }

  // --- STATS ---
  const toggleStat = (statId: string) => {
    setSelectedStats(prev => prev.includes(statId) ? prev.filter(id => id !== statId) : [...prev, statId])
  }

  const handleUpdateStats = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { stats_preferences: selectedStats } })
    if (!error) { setExpandedSection(null); router.refresh() } 
    else { alert("Erreur : " + error.message) }
    setLoading(false)
  }

  // --- INFOS (VIA SERVER ACTION) ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Appel de la Server Action pour mise à jour immédiate
      await updateUserProfile({
        firstName,
        lastName,
        email: email.trim()
      })
      
      alert("Profil mis à jour avec succès (Email changé immédiatement).")
      setExpandedSection(null)
      router.refresh()
    } catch (error: any) {
      alert("Erreur : " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ... (Le reste : handleUpdatePassword, handleLogout et le JSX restent identiques) ...
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) return alert("Les mots de passe ne correspondent pas.")
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: password })
    if (!error) { alert("Mot de passe mis à jour."); setExpandedSection(null); setPassword(""); setConfirmPassword(""); router.refresh() } 
    else { alert("Erreur : " + error.message) }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut(); router.push("/auth")
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
      
      {/* SECTION INFOS */}
      <div className={`transition-colors duration-300 ${expandedSection === 'info' ? 'bg-secondary/30' : ''}`}>
        <button onClick={() => toggleSection('info')} className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${expandedSection === 'info' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              <FontAwesomeIcon icon={faUserPen} />
            </div>
            <span className="font-medium text-foreground">Modifier mes informations</span>
          </div>
          <FontAwesomeIcon icon={expandedSection === 'info' ? faChevronUp : faChevronDown} className="text-muted-foreground text-sm" />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === 'info' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleUpdateProfile} className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prénom</label>
                <input aria-label="prénom" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</label>
                <input aria-label="nom" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                <div className="relative">
                    <input aria-label="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary outline-none" />
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setExpandedSection(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary">Annuler</button>
              <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2">
                <FontAwesomeIcon icon={faSave} /> Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ... Les autres sections (STATS, PASSWORD, LOGOUT) restent inchangées ... */}
       {/* SECTION STATS */}
      <div className={`transition-colors duration-300 ${expandedSection === 'stats' ? 'bg-secondary/30' : ''}`}>
        <button onClick={() => toggleSection('stats')} className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${expandedSection === 'stats' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              <FontAwesomeIcon icon={faChartPie} />
            </div>
            <span className="font-medium text-foreground">Personnaliser les statistiques</span>
          </div>
          <FontAwesomeIcon icon={expandedSection === 'stats' ? faChevronUp : faChevronDown} className="text-muted-foreground text-sm" />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === 'stats' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 pt-0 space-y-4">
            <p className="text-sm text-muted-foreground">Sélectionnez les indicateurs clés à afficher sur votre profil :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_STATS.map(stat => (
                <button
                  key={stat.id}
                  onClick={() => toggleStat(stat.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedStats.includes(stat.id) ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  <span className="font-medium text-sm">{stat.label}</span>
                  {selectedStats.includes(stat.id) && <FontAwesomeIcon icon={faCheck} />}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setExpandedSection(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary">Annuler</button>
              <button onClick={handleUpdateStats} disabled={loading} className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2">
                <FontAwesomeIcon icon={faSave} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

       {/* SECTION PASSWORD */}
      <div className={`transition-colors duration-300 ${expandedSection === 'password' ? 'bg-secondary/30' : ''}`}>
        <button onClick={() => toggleSection('password')} className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors text-left">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${expandedSection === 'password' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              <FontAwesomeIcon icon={faLock} />
            </div>
            <span className="font-medium text-foreground">Changer de mot de passe</span>
          </div>
          <FontAwesomeIcon icon={expandedSection === 'password' ? faChevronUp : faChevronDown} className="text-muted-foreground text-sm" />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === 'password' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <form onSubmit={handleUpdatePassword} className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nouveau mot de passe</label>
                <input aria-label="mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirmer</label>
                <input aria-label="confirmation du mot de passe" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setExpandedSection(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary">Annuler</button>
              <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2">
                <FontAwesomeIcon icon={faSave} /> Mettre à jour
              </button>
            </div>
          </form>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 hover:bg-destructive/10 text-destructive transition-colors text-left group">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive group-hover:bg-destructive/20 transition-colors">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>
          <span className="font-medium">Se déconnecter</span>
        </div>
      </button>

    </div>
  )
}