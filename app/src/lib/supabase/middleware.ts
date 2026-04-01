import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never auth-gate metadata files (PWA manifest must stay JSON; redirect breaks Add to Home Screen)
  if (
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/.well-known/")
  ) {
    return NextResponse.next({ request });
  }

  const publicPaths = ["/login", "/signup", "/auth/callback", "/auth/confirm", "/forgot-password", "/reset-password"];
  const marketingPaths = [
    "/index.html", "/pricing.html", "/features.html", "/how-it-works.html", "/privacy.html", "/terms.html",
    "/pricing", "/features", "/how-it-works", "/privacy", "/terms", "/contact",
  ];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isMarketingPath = marketingPaths.includes(pathname);

  // Skip Supabase for public auth paths and marketing pages
  if (isPublicPath || isMarketingPath) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return supabaseResponse;
  }

  if (!user) {
    // Let the root through — the rewrite in next.config.ts serves the landing page
    if (pathname === "/") return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged-in users at root or marketing pages → send to dashboard
  if (user && (pathname === "/" || isMarketingPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/dashboard")) {
    try {
      const { data: profile } = await supabase
        .from("users")
        .select("subscription_status, trial_start_date")
        .eq("id", user.id)
        .single();

      if (profile) {
        const trialEnd = new Date(profile.trial_start_date);
        trialEnd.setDate(trialEnd.getDate() + 30);
        const isInTrial = new Date() < trialEnd;
        const isActive = profile.subscription_status === "active";

        if (!isInTrial && !isActive && !pathname.startsWith("/dashboard/upgrade")) {
          const url = request.nextUrl.clone();
          url.pathname = "/dashboard/upgrade";
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // Allow through if profile fetch fails
    }
  }

  return supabaseResponse;
}
