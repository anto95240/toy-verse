import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client"; 
import { updateUserProfile } from "@/app/(protected)/profile/actions";
import { useToast } from "@/context/ToastContext";

const ALLOWED_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "outlook.fr",
  "hotmail.com",
  "hotmail.fr",
  "live.fr",
  "live.com",
  "yahoo.com",
  "yahoo.fr",
  "icloud.com",
  "orange.fr",
  "wanadoo.fr",
  "sfr.fr",
  "neuf.fr",
  "free.fr",
  "bouygues.fr",
  "laposte.net",
  "protonmail.com",
  "proton.me",
  "aol.com",
];

export function useProfileLogic(user: any) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.user_metadata?.first_name || "",
    lastName: user?.user_metadata?.last_name || "",
    email: user?.email || "",
    confirmEmail: user?.email || "",
  });

  const [pass, setPass] = useState({ new: "", confirm: "" });

  const [selectedStats, setSelectedStats] = useState<string[]>(
    user?.user_metadata?.stats_preferences || []
  );

  const updateForm = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));
  const updatePass = (k: keyof typeof pass, v: string) =>
    setPass((p) => ({ ...p, [k]: v }));

  const emailsMatch = form.email === form.confirmEmail && form.email !== "";
  const isValidDomain =
    form.email.includes("@") &&
    ALLOWED_DOMAINS.includes(form.email.split("@")[1]?.toLowerCase());
  const passwordsMatch = pass.new === pass.confirm && pass.new !== "";

  const updateProfile = async () => {
    if (!emailsMatch || !isValidDomain) return;
    setLoading(true);
    try {
      await updateUserProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email.trim(),
      });
      showToast("Profil mis à jour !", "success");
      router.refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    }
    setLoading(false);
  };

  const updatePassword = async () => {
    if (!passwordsMatch) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pass.new });
    if (!error) {
      showToast("Mot de passe modifié", "success");
      setPass({ new: "", confirm: "" });
    } else {
      showToast(error.message, "error");
    }
    setLoading(false);
  };

  const toggleStat = (id: string) => {
    setSelectedStats((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const saveStats = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { stats_preferences: selectedStats },
    });
    if (!error) {
      showToast("Préférences sauvegardées", "success");
      router.refresh();
    } else {
      showToast(error.message, "error");
    }
    setLoading(false);
  };

  return {
    form,
    updateForm,
    pass,
    updatePass,
    selectedStats,
    toggleStat,
    saveStats,
    loading,
    updateProfile,
    updatePassword,
    validations: { emailsMatch, isValidDomain, passwordsMatch },
  };
}