import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  // On utilise .trim() pour nettoyer les espaces invisibles reçus
  const authHeader = request.headers.get('authorization')?.trim();
  
  // On utilise .trim() pour nettoyer le mot de passe du fichier .env
  const expectedToken = `Bearer ${process.env.CRON_SECRET?.trim()}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Accès refusé. Tentative de piratage bloquée.' }, { status: 401 });
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Ping de maintien Supabase réussi." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}