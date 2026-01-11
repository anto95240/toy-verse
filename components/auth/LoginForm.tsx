"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { FormInput } from "@/components/ui/FormInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
      <PasswordInput
        id="login-password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        disabled={loading}
        required
      />

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 font-semibold shadow-sm"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
