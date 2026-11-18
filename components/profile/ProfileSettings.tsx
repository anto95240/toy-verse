"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faPaperPlane, faPuzzlePiece } from "@fortawesome/free-solid-svg-icons";
import { useProfileLogic } from "@/hooks/profile/useProfileLogic";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

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
    window.location.href = "/";
  };

  return (
    <div className="space-y-8">
      {/* --- GROUPE 1: Collection & Préférences --- */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Collection & Préférences
        </h4>
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-elevation-3 divide-y divide-border/50">
          <Link
            href="/profile/type-toy"
            className="w-full p-5 text-foreground hover:bg-primary/10 text-left flex items-center gap-4 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <FontAwesomeIcon icon={faPuzzlePiece} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Mes types de jouets</p>
              <p className="text-xs text-muted-foreground mt-1">Personnaliser les profils &amp; champs du formulaire</p>
            </div>
          </Link>
          <StatsSection
            expanded={expanded}
            toggle={toggle}
            selectedStats={profileLogic.selectedStats}
            toggleStat={profileLogic.toggleStat}
            saveStats={profileLogic.saveStats}
            loading={profileLogic.loading}
          />
        </div>
      </div>

      {/* --- GROUPE 2: Compte & Sécurité --- */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Compte & Sécurité
        </h4>
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-elevation-3 divide-y divide-border/50">
          <InfoSection
            user={user}
            expanded={expanded}
            toggle={toggle}
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
        </div>
      </div>

      {/* --- GROUPE 3: Support & Actions --- */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Support & Connexion
        </h4>
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-elevation-3 divide-y divide-border/50">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="w-full p-5 text-muted-foreground hover:bg-primary/10 hover:text-primary text-left flex items-center gap-4 font-semibold transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary transition-all duration-300 shrink-0">
              <FontAwesomeIcon icon={faPaperPlane} />
            </div>
            Idée ou Signalement de bug
          </button>
          <button
            onClick={handleSignOut}
            className="w-full p-5 text-muted-foreground hover:bg-secondary/50 text-left flex items-center gap-4 font-medium transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* --- GROUPE 4: Zone de Danger --- */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-destructive/80 uppercase tracking-wider px-2">
          Zone Critique
        </h4>
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-elevation-3">
          <DangerZone
            expanded={expanded}
            toggle={toggle}
          />
        </div>
      </div>

      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </div>
  );
}