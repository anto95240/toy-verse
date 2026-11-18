/**
 * app/(protected)/admin/referential/layout.tsx
 *
 * Layout du back-office de gestion des référentiels.
 * Navigation latérale vers chaque entité.
 */

import React from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/referential/category",  label: "Catégories",  icon: "🏷️",  description: "Arborescence des catégories" },
  { href: "/admin/referential/studio",    label: "Studios",     icon: "🏢",  description: "Studios de production" },
  { href: "/admin/referential/license",   label: "Licences",    icon: "⚖️",  description: "Licences officielles" },
  { href: "/admin/referential/franchise", label: "Franchises",  icon: "🎬",  description: "Univers et franchises" },
  { href: "/admin/referential/character", label: "Personnages", icon: "🧑",  description: "Personnages de la collection" },
  { href: "/admin/referential/location",  label: "Lieux",       icon: "📍",  description: "Lieux d'achat (souvenirs)" },
  { href: "/admin/migration",             label: "Migration",   icon: "🔄",  description: "Migrer les données legacy" },
] as const;

export default async function ReferentialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-64 min-h-screen border-r border-white/10 bg-gray-900/50 p-4 space-y-1 shrink-0">
          <div className="mb-6">
            <Link
              href="/home"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Retour à la collection
            </Link>
          </div>

          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-3">
            Référentiels
          </h2>

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all group"
            >
              <span className="text-base shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400 truncate">
                  {item.description}
                </div>
              </div>
            </Link>
          ))}
        </aside>

        {/* ── Contenu ─────────────────────────────────────────────────────── */}
        <main className="flex-1 p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
