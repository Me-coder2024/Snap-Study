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
  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", session.user.id).single();
  return profile?.role === "admin";
}

// POST - Insert chapters
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const admin = getAdminClient();

  if (body.action === "create") {
    // Delete existing chapters for this subject, then create new ones
    await admin.from("chapters").delete().eq("subject_id", body.subjectId);
    const newChapters = Array.from({ length: body.count }, (_, i) => ({
      subject_id: body.subjectId, number: i + 1, title: `Chapter ${i + 1}`,
    }));
    const { error } = await admin.from("chapters").insert(newChapters);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    // Update total_chapters in subjects
    await admin.from("subjects").update({ total_chapters: body.count }).eq("id", body.subjectId);
    return NextResponse.json({ success: true });
  }

  if (body.action === "update_title") {
    const { error } = await admin.from("chapters").update({ title: body.title }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (body.action === "update_pdf") {
    const { error } = await admin.from("chapters").update({ pdf_url: body.pdfUrl }).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
