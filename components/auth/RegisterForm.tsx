"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { FormInput } from "@/components/ui/FormInput";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function RegisterForm() {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  const update = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { first_name: form.prenom, last_name: form.nom } },
      });
      if (error) throw error;
      if (data.session) window.location.href = "/home";
      else alert("Inscription réussie ! Connectez-vous.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur d'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-6 max-w-md mx-auto p-4"
    >
      <div className="flex gap-4">
        <FormInput
          id="prenom"
          label="Prénom"
          value={form.prenom}
          onChange={(v) => update("prenom", v)}
          disabled={loading}
          required
        />
        <FormInput
          id="nom"
          label="Nom"
          value={form.nom}
          onChange={(v) => update("nom", v)}
          disabled={loading}
          required
        />
      </div>
      <FormInput
        id="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => update("email", v)}
        disabled={loading}
        required
      />
      <PasswordInput
        id="password"
        label="Mot de passe"
        value={form.password}
        onChange={(v) => update("password", v)}
        disabled={loading}
        required
      />

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:opacity-50 font-semibold shadow-sm"
      >
        {loading ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
