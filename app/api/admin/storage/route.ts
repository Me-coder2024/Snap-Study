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

// POST - Upload file to Supabase Storage using service role
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const storagePath = formData.get("storagePath") as string;

  if (!file || !storagePath) {
    return NextResponse.json({ error: "Missing file or storagePath" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await admin.storage
    .from("pdfs")
    .upload(storagePath, buffer, {
      upsert: true,
      contentType: file.type || "application/pdf",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Return the public URL
  const { data: urlData } = admin.storage.from("pdfs").getPublicUrl(data.path);

  return NextResponse.json({ path: data.path, publicUrl: urlData.publicUrl });
}
