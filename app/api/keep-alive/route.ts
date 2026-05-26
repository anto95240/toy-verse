import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
    if (error) throw error;

    console.log(`[${new Date().toISOString()}] Keep-alive successful`);
    return NextResponse.json({ success: true, message: "Ping Supabase réussi" });
  } catch (error: unknown) {
    console.error(`[${new Date().toISOString()}] Keep-alive error:`, error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Erreur" }, { status: 500 });
  }
}