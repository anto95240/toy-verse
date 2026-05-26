import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_request: Request) {
  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    // Ping Supabase pour mantenir la connexion active
    const { error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1 });
    
    if (error) {
      throw new Error(`Supabase error: ${error.message || JSON.stringify(error)}`);
    }

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Keep-alive successful`);
    
    return NextResponse.json(
      { success: true, message: "Ping Supabase réussi", timestamp },
      { status: 200 }
    );
  } catch (error: unknown) {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`[${timestamp}] Keep-alive error:`, errorMessage);
    
    return NextResponse.json(
      { success: false, error: errorMessage, timestamp },
      { status: 500 }
    );
  }
}