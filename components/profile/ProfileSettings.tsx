"use client"

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUserPen, faLock, faSignOutAlt, faChevronDown, faChevronUp, faSave, faChartPie, faCheck, faExclamationCircle } from "@fortawesome/free-solid-svg-icons"
import { useProfileLogic } from "@/hooks/useProfileLogic"
import { FormInput } from "@/components/ui/FormInput"
import { PasswordInput } from "@/components/ui/PasswordInput"

const AVAILABLE_STATS = [
  { id: 'total_collection', label: 'Total Collection' }, { id: 'total_pieces', label: 'Total Pièces' },
  { id: 'top_theme', label: 'Thème Favori' }, { id: 'last_toy', label: 'Dernier Ajout' },
  { id: 'favorite_brand', label: 'Marque Favorite' }, { id: 'top_category', label: 'Catégorie Favorite' },
  { id: 'oldest_toy', label: 'Le + Vintage' }, { id: 'recent_additions', label: 'Acquis cette année' },
  { id: 'exposed_count', label: 'Jouets Exposés' }, { id: 'wishlist_count', label: 'Wishlist' },
]

export default function ProfileSettings({ user }: { user: any }) {
  const { form, updateForm, pass, updatePass, selectedStats, toggleStat, saveStats, loading, updateProfile, updatePassword, validations } = useProfileLogic(user)
  const [expanded, setExpanded] = useState<'info' | 'pass' | 'stats' | null>(null)
  const toggle = (s: 'info' | 'pass' | 'stats') => setExpanded(expanded === s ? null : s)

  const Section = ({ id, icon, title, children }: any) => (
    <div className={`transition-colors duration-300 ${expanded === id ? 'bg-secondary/30' : ''}`}>
      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-colors text-left">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${expanded === id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}><FontAwesomeIcon icon={icon} /></div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <FontAwesomeIcon icon={expanded === id ? faChevronUp : faChevronDown} className="text-muted-foreground text-sm" />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${expanded === id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>{children}</div>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
      <Section id="info" icon={faUserPen} title="Mes informations">
        <form onSubmit={(e) => { e.preventDefault(); updateProfile() }} className="p-5 pt-0 space-y-4">
          <div className="flex gap-4">
             <FormInput id="firstname" label="Prénom" value={form.firstName} onChange={v => updateForm('firstName', v)} />
             <FormInput id="lastname" label="Nom" value={form.lastName} onChange={v => updateForm('lastName', v)} />
          </div>
          <div className="p-4 bg-background/50 rounded-xl border border-border/50 space-y-3">
             <div className="flex justify-between items-center"><label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                <div className="text-[10px] font-bold flex gap-2">
                   {!validations.emailsMatch && form.confirmEmail && <span className="text-destructive"><FontAwesomeIcon icon={faExclamationCircle}/> Différents</span>}
                   {form.email && !validations.isValidDomain && <span className="text-orange-500"><FontAwesomeIcon icon={faExclamationCircle}/> Domaine invalide</span>}
                </div>
             </div>
             <FormInput id="email" label="Email" type="email" value={form.email} onChange={v => updateForm('email', v)} />
             <FormInput id="confirmEmail" label="Confirmer Email" type="email" value={form.confirmEmail} onChange={v => updateForm('confirmEmail', v)} />
          </div>
          <div className="flex justify-end gap-2"><button type="submit" disabled={loading || !validations.emailsMatch || !validations.isValidDomain} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50">Enregistrer</button></div>
        </form>
      </Section>

      <Section id="stats" icon={faChartPie} title="Statistiques">
        <div className="p-5 pt-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVAILABLE_STATS.map(s => (
              <button key={s.id} onClick={() => toggleStat(s.id)} className={`flex justify-between p-3 rounded-xl border transition-all ${selectedStats.includes(s.id) ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:border-primary/50'}`}>
                <span className="font-medium text-sm">{s.label}</span>{selectedStats.includes(s.id) && <FontAwesomeIcon icon={faCheck} />}
              </button>
            ))}
          </div>
          <div className="flex justify-end"><button onClick={saveStats} disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold">Enregistrer</button></div>
        </div>
      </Section>

      <Section id="pass" icon={faLock} title="Mot de passe">
        <form onSubmit={(e) => { e.preventDefault(); updatePassword() }} className="p-5 pt-0 space-y-4">
           <PasswordInput id="pass1" label="Nouveau" value={pass.new} onChange={v => updatePass('new', v)} />
           <PasswordInput id="pass2" label="Confirmer" value={pass.confirm} onChange={v => updatePass('confirm', v)} />
           <div className="flex justify-end"><button type="submit" disabled={loading || !validations.passwordsMatch} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50">Mettre à jour</button></div>
        </form>
      </Section>

      <button onClick={() => window.location.href='/auth'} className="w-full p-5 text-destructive hover:bg-destructive/10 text-left flex items-center gap-4 font-medium transition-colors">
         <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><FontAwesomeIcon icon={faSignOutAlt} /></div> Se déconnecter
      </button>
    </div>
  )
}