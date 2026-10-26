import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, getRoleDashboard } from "@/lib/auth";

const publicPaths = [
  "/login",
  "/signup",
  "/api/auth",
  "/problems",
  "/solutions",
  "/partnerships",
];

const rolePathMap: Record<string, string[]> = {
  CITIZEN: ["/citizen"],
  UNIVERSITY: ["/university"],
  INDUSTRY: [
    "/industry/dashboard",
    "/industry/my-partnerships",
    "/industry/solutions",
  ],
  ADMIN: ["/admin"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isPublicIndustryProfile =
    pathname.startsWith("/industry/") &&
    !pathname.startsWith("/industry/dashboard") &&
    !pathname.startsWith("/industry/my-partnerships") &&
    !pathname.startsWith("/industry/solutions");

  // Allow public paths, static files, and public GET APIs
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    isPublicIndustryProfile ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/" ||
    (method === "GET" && (
      pathname.startsWith("/api/problems") ||
      pathname.startsWith("/api/solutions") ||
      pathname.startsWith("/api/partnerships") ||
      pathname.startsWith("/api/industry/")
    ))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  const session = await verifyJWT(token);
  if (!session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("token");
    return response;
  }

  // All authenticated users can submit a civic problem
  if (pathname === "/citizen/problems/new") {
    return NextResponse.next();
  }

  // Check role-path access (Admins have access to all dashboards and routes)
  for (const [role, paths] of Object.entries(rolePathMap)) {
    if (paths.some((p) => pathname.startsWith(p))) {
      if (session.role === "ADMIN") {
        continue;
      }
      if (session.role !== role) {
        return NextResponse.redirect(
          new URL(getRoleDashboard(session.role), request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
