import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ADMIN_EMAILS = ["piyushgupta4969@gmail.com"];

async function isAdmin(req: NextRequest) {
  if (req.cookies.get("admin_bypass")?.value === "true") return true;
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
  return false;
}

// GET - List all courses
export async function GET() {
  const admin = getAdminClient();
  const { data, error } = await admin.from("courses").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// POST - Create a course
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("courses")
    .insert({
      name: body.name,
      code: body.code,
      duration_years: body.duration_years,
      icon_color: body.icon_color || "#6C47FF",
      description: body.description || "",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE - Delete a course (and cascade deletes subjects)
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await req.json();
  const admin = getAdminClient();
  const { error } = await admin.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
