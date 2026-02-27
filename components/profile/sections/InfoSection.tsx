"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPen, faCheck, faInfoCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SectionWrapper from "./SectionWrapper";
import { useToast } from "@/context/ToastContext";

import { updateUserProfile } from "@/app/actions/actions";
import { profileSchema } from "@/lib/validations"; 

const clientProfileSchema = profileSchema.extend({
  confirmEmail: z.string().email("Format d'email invalide"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Les emails ne correspondent pas",
  path: ["confirmEmail"],
});

type ProfileFormData = z.infer<typeof clientProfileSchema>;

interface InfoSectionProps {
  user: User;
  expanded: string | null;
  toggle: (id: string) => void;
}

export default function InfoSection({ user, expanded, toggle }: InfoSectionProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      firstName: user.user_metadata?.first_name || "",
      lastName: user.user_metadata?.last_name || "",
      email: user.email || "",
      confirmEmail: user.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setProfileMessage(null);
    
    const res = await updateUserProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    });

    if (res.success) {
      setProfileMessage({ 
        text: res.emailConfirmationSent ? "Lien de confirmation envoyé à votre nouvel email." : "Informations enregistrées avec succès.", 
        type: res.emailConfirmationSent ? "info" : "success" 
      });
      showToast("Profil mis à jour !", "success");
    } else {
      setProfileMessage({ text: res.error || "Une erreur est survenue.", type: "info" });
      showToast(res.error || "Erreur", "error");
    }
    setLoading(false);
  };

  return (
    <SectionWrapper id="info" icon={faUserPen} title="Mes informations" expanded={expanded} toggle={toggle}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 pt-0 space-y-4">
        {profileMessage && (
          <div className={`p-3 text-sm rounded-lg border flex items-center gap-2 ${profileMessage.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-blue-500/10 border-blue-500/20 text-blue-600"}`}>
            <FontAwesomeIcon icon={profileMessage.type === "success" ? faCheck : faInfoCircle} />
            {profileMessage.text}
          </div>
        )}
        
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Prénom</label>
            <input {...register("firstName")} className="w-full p-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
            {errors.firstName && <span className="text-xs text-destructive font-medium">{errors.firstName.message}</span>}
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Nom</label>
            <input {...register("lastName")} className="w-full p-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
            {errors.lastName && <span className="text-xs text-destructive font-medium">{errors.lastName.message}</span>}
          </div>
        </div>

        <div className="p-4 bg-background/50 rounded-xl border border-border/50 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
            <input {...register("email")} type="email" className="w-full p-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
            {errors.email && <span className="text-xs text-destructive font-medium">{errors.email.message}</span>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Confirmer Email</label>
            <input {...register("confirmEmail")} type="email" className="w-full p-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
            {errors.confirmEmail && <span className="text-xs text-destructive font-medium flex items-center gap-1 mt-1"><FontAwesomeIcon icon={faExclamationCircle}/> {errors.confirmEmail.message}</span>}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50 transition-colors">
            {loading ? "Chargement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </SectionWrapper>
  );
}