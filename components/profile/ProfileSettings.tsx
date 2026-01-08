"use client"

import React, { useState } from "react"
import { getSupabaseClient } from "@/utils/supabase/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faUserPen, 
  faLock, 
  faSignOutAlt, 
  faChevronDown, 
  faChevronUp,
  faSave,
  faTimes
} from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"

export default function ProfileSettings({ user }: { user: any }) {
  const router = useRouter()
  const [expandedSection, setExpandedSection] = useState<'info' | 'password' | null>(null)
  
  // États pour "Mes Informations"
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || "")
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || "")
  
  // États pour "Mot de passe"
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)

  const supabase = getSupabaseClient()

  const toggleSection = (section: 'info' | 'password') => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
      // On reset les champs de mot de passe quand on change de section pour la sécurité
      setPassword("")
      setConfirmPassword("")
    }
  }

  // --- LOGIQUE MISE À JOUR INFOS ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName
      }
    })

    if (!error) {
      setExpandedSection(null)
      router.refresh()
    } else {
      alert("Erreur : " + error.message)
    }
    setLoading(false)
  }

  // --- LOGIQUE MISE À JOUR MOT DE PASSE ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.")
      return
    }

    if (password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (!error) {
      alert("Mot de passe mis à jour avec succès.")
      setExpandedSection(null)
      setPassword("")
      setConfirmPassword("")
      router.refresh()
    } else {
      alert("Erreur : " + error.message)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
      
      {/* --- SECTION 1 : MODIFIER MES INFORMATIONS --- */}
      <div className={`transition-colors duration-300 ${expandedSection === 'info' ? 'bg-secondary/30' : ''}`}>
        <button 
          aria-label="modifier mes informations"
          onClick={() => toggleSection('info')}
          className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              expandedSection === 'info' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              <FontAwesomeIcon icon={faUserPen} />
            </div>
            <span className="font-medium text-foreground">Modifier mes informations</span>
          </div>
          <FontAwesomeIcon 
            icon={expandedSection === 'info' ? faChevronUp : faChevronDown} 
            className="text-muted-foreground text-sm" 
          />
        </button>

        {/* Formulaire Infos */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expandedSection === 'info' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <form onSubmit={handleUpdateProfile} className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpandedSection(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} /> Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} /> Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- SECTION 2 : MOT DE PASSE --- */}
      <div className={`transition-colors duration-300 ${expandedSection === 'password' ? 'bg-secondary/30' : ''}`}>
        <button 
          onClick={() => toggleSection('password')}
          className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors text-left"
          aria-label="modification du mot de passe"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              expandedSection === 'password' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
              <FontAwesomeIcon icon={faLock} />
            </div>
            <span className="font-medium text-foreground">Changer de mot de passe</span>
          </div>
          <FontAwesomeIcon 
            icon={expandedSection === 'password' ? faChevronUp : faChevronDown} 
            className="text-muted-foreground text-sm" 
          />
        </button>
        
        {/* Formulaire Mot de passe */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expandedSection === 'password' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <form onSubmit={handleUpdatePassword} className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpandedSection(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} /> Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} /> Mettre à jour
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- SECTION 3 : DÉCONNEXION --- */}
      <button 
        onClick={handleLogout}
        type="button"
        className="w-full flex items-center justify-between p-5 hover:bg-destructive/10 text-destructive transition-colors text-left group"
      >
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