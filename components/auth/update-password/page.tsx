"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }
    if (password.length < 6) {
      return setError("Le mot de passe doit faire au moins 6 caractères.");
    }

    setLoading(true);
    try {
      // Met à jour le mot de passe de l'utilisateur (il a été connecté automatiquement grâce au lien de l'email)
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      // Une fois mis à jour, on le renvoie vers l'accueil
      window.location.href = "/home";
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Nouveau mot de passe
        </h2>
        <p className="text-muted-foreground text-sm">
          Saisissez votre nouveau mot de passe ci-dessous.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <PasswordInput
          id="new-password"
          label="Nouveau mot de passe"
          value={password}
          onChange={setPassword}
          disabled={loading}
          required
        />
        <PasswordInput
          id="confirm-password"
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={loading}
          required
        />

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 font-semibold shadow-sm"
        >
          {loading ? "Mise à jour..." : "Mettre à jour mon mot de passe"}
        </button>
      </form>
    </div>
  );
}