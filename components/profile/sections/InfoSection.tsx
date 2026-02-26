"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPen, faCheck, faInfoCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FormInput } from "@/components/ui/FormInput";
import SectionWrapper from "./SectionWrapper";

interface InfoSectionProps {
  user: User;
  expanded: string | null;
  toggle: (id: string) => void;
  form: any;
  updateForm: (field: string, value: string) => void;
  validations: any;
  loading: boolean;
  updateProfile: () => Promise<void>;
}

export default function InfoSection({ user, expanded, toggle, form, updateForm, validations, loading, updateProfile }: InfoSectionProps) {
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      await updateProfile();
      if (user.email !== form.email) {
        setProfileMessage({ text: "Profil mis à jour ! Un lien de confirmation a été envoyé à votre nouvelle adresse.", type: "info" });
      } else {
        setProfileMessage({ text: "Vos informations ont été enregistrées avec succès.", type: "success" });
      }
    } catch (error: any) {
      setProfileMessage({ text: error.message, type: "info" });
    }
  };

  return (
    <SectionWrapper id="info" icon={faUserPen} title="Mes informations" expanded={expanded} toggle={toggle}>
      <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4">
        {profileMessage && (
          <div className={`p-3 text-sm rounded-lg border flex items-center gap-2 ${profileMessage.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-blue-500/10 border-blue-500/20 text-blue-600"}`}>
            <FontAwesomeIcon icon={profileMessage.type === "success" ? faCheck : faInfoCircle} />
            {profileMessage.text}
          </div>
        )}
        <div className="flex gap-4">
          <FormInput id="firstname" label="Prénom" value={form.firstName} onChange={(v) => updateForm("firstName", v)} />
          <FormInput id="lastname" label="Nom" value={form.lastName} onChange={(v) => updateForm("lastName", v)} />
        </div>
        <div className="p-4 bg-background/50 rounded-xl border border-border/50 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
            <div className="text-[10px] font-bold flex gap-2">
              {!validations.emailsMatch && form.confirmEmail && <span className="text-destructive"><FontAwesomeIcon icon={faExclamationCircle} /> Différents</span>}
              {form.email && !validations.isValidDomain && <span className="text-orange-500"><FontAwesomeIcon icon={faExclamationCircle} /> Domaine invalide</span>}
            </div>
          </div>
          <FormInput id="email" label="Email" type="email" value={form.email} onChange={(v) => updateForm("email", v)} />
          <FormInput id="confirmEmail" label="Confirmer Email" type="email" value={form.confirmEmail} onChange={(v) => updateForm("confirmEmail", v)} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="submit" disabled={loading || !validations.emailsMatch || !validations.isValidDomain} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50">
            Enregistrer
          </button>
        </div>
      </form>
    </SectionWrapper>
  );
}