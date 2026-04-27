import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS for admin operations
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ADMIN_EMAILS = ["piyushgupta4969@gmail.com"];

async function isAdmin(req: NextRequest) {
  // Check admin bypass cookie
  if (req.cookies.get("admin_bypass")?.value === "true") return true;

  // Check Supabase session
  const { createServerClient: createSSRClient } = await import("@supabase/ssr");
  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  if (ADMIN_EMAILS.includes(session.user.email || "")) return true;

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
  return profile?.role === "admin";
}

// POST - Create subject
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const admin = getAdminClient();
  const { data, error } = await admin.from("subjects").insert(body).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE - Delete subject
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await req.json();
  const admin = getAdminClient();
  const { error } = await admin.from("subjects").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
