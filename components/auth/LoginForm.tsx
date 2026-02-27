"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { FormInput } from "@/components/ui/FormInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // NOUVEAU : Un état pour basculer entre Connexion et Mot de passe oublié
  const [isResetMode, setIsResetMode] = useState(false);
  
  const supabase = getSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isResetMode) {
      // MODE : MOT DE PASSE OUBLIÉ
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // L'URL vers laquelle Supabase renverra l'utilisateur après le clic dans l'email
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) throw error;
        setMessage("Un email de réinitialisation vous a été envoyé.");
      } catch {
        setError("Erreur lors de l'envoi de l'email.");
      } finally {
        setLoading(false);
      }
    } else {
      // MODE : CONNEXION CLASSIQUE
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) window.location.href = "/home";
      } catch {
        setError("Erreur de connexion. Vérifiez vos identifiants.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      <FormInput
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        disabled={loading}
        required
      />
      
      {/* On cache le mot de passe si on est en mode réinitialisation */}
      {!isResetMode && (
        <PasswordInput
          id="login-password"
          label="Mot de passe"
          value={password}
          onChange={setPassword}
          disabled={loading}
          required
        />
      )}

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 font-semibold shadow-sm"
      >
        {loading 
          ? "Chargement..." 
          : isResetMode 
          ? "Envoyer le lien" 
          : "Se connecter"}
      </button>

      {/* NOUVEAU : Bouton pour basculer de mode */}
      <button
        type="button"
        onClick={() => {
          setIsResetMode(!isResetMode);
          setError("");
          setMessage("");
        }}
        className="text-sm text-blue-500 hover:underline self-center"
      >
        {isResetMode ? "Retour à la connexion" : "Mot de passe oublié ?"}
      </button>
    </form>
  );
}