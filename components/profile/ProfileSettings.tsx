"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useProfileLogic } from "@/hooks/profile/useProfileLogic";
import { getSupabaseClient } from "@/lib/supabase/client";

// Imports des composants UI et des sections
import ReportModal from "@/components/ui/ReportModal";
import InfoSection from "./sections/InfoSection";
import StatsSection from "./sections/StatsSection";
import PasswordSection from "./sections/PasswordSection";
import DangerZone from "./sections/DangerZone";

export default function ProfileSettings({ user }: { user: User }) {
  // Le hook gère toute la logique de données (sauf DangerZone qui a la sienne)
  const profileLogic = useProfileLogic(user);

  // États locaux pour le chef d'orchestre
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fonction pour basculer l'accordéon
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  // Fonction de déconnexion
  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
        
        <InfoSection 
          user={user} 
          expanded={expanded} 
          toggle={toggle} 
        />

        <StatsSection 
          expanded={expanded} 
          toggle={toggle} 
          selectedStats={profileLogic.selectedStats}
          toggleStat={profileLogic.toggleStat}
          saveStats={profileLogic.saveStats}
          loading={profileLogic.loading}
        />

        <PasswordSection 
          expanded={expanded} 
          toggle={toggle} 
          pass={profileLogic.pass}
          updatePass={profileLogic.updatePass}
          updatePassword={profileLogic.updatePassword}
          validations={profileLogic.validations}
          loading={profileLogic.loading}
        />

        <DangerZone 
          expanded={expanded} 
          toggle={toggle} 
        />

        {/* BOUTON SIGNALEMENT */}
        <button 
          onClick={() => setIsReportModalOpen(true)} 
          className="w-full p-5 text-muted-foreground hover:bg-primary/5 hover:text-primary text-left flex items-center gap-4 font-medium transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-current transition-colors">
            <FontAwesomeIcon icon={faPaperPlane} />
          </div> 
          Idée ou Signalement de bug
        </button>

        {/* BOUTON DÉCONNEXION */}
        <button 
          onClick={handleSignOut} 
          className="w-full p-5 text-muted-foreground hover:bg-secondary/50 text-left flex items-center gap-4 font-medium transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div> 
          Se déconnecter
        </button>
      </div>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </>
  );
}