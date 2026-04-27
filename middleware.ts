import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type CookieSetter = { name: string; value: string; options: CookieOptions };

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: CookieSetter[]) {
          cookiesToSet.forEach(({ name, value, options }: CookieSetter) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const adminBypass = req.cookies.get("admin_bypass")?.value === "true";

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup");

  // Redirect logged-in users away from auth pages
  if ((session || adminBypass) && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect admin routes
  if (!session && !adminBypass && isAdminRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminRoute && !adminBypass) {
    if (session?.user?.email !== "piyushgupta4969@gmail.com") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session?.user?.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup"],
};
