"use client";

import React from "react";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { PasswordInput } from "@/components/ui/PasswordInput";
import SectionWrapper from "./SectionWrapper";

interface PasswordSectionProps {
  expanded: string | null;
  toggle: (id: string) => void;
  pass: { new: string; confirm: string };
  updatePass: (field: string, value: string) => void;
  updatePassword: () => void;
  validations: { passwordsMatch: boolean };
  loading: boolean;
}

export default function PasswordSection({ expanded, toggle, pass, updatePass, updatePassword, validations, loading }: PasswordSectionProps) {
  return (
    <SectionWrapper id="pass" icon={faLock} title="Mot de passe" expanded={expanded} toggle={toggle}>
      <form onSubmit={(e) => { e.preventDefault(); updatePassword(); }} className="p-5 pt-0 space-y-4">
        <PasswordInput id="pass1" label="Nouveau" value={pass.new} onChange={(v) => updatePass("new", v)} />
        <PasswordInput id="pass2" label="Confirmer" value={pass.confirm} onChange={(v) => updatePass("confirm", v)} />
        <div className="flex justify-end">
          <button type="submit" disabled={loading || !validations.passwordsMatch} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50">
            Mettre à jour
          </button>
        </div>
      </form>
    </SectionWrapper>
  );
}