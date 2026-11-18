import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createSupabaseServerClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ profiles: [] }, { status: 401 });

  const { data, error } = await supabase
    .from("theme_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ profiles: [], error: error.message }, { status: 500 });
  return NextResponse.json({ profiles: data ?? [] });
}
