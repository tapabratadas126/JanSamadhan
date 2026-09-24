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
  INDUSTRY: ["/industry"],
  ADMIN: ["/admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Allow public paths, static files, and public GET APIs
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/" ||
    (method === "GET" && (
      pathname.startsWith("/api/problems") ||
      pathname.startsWith("/api/solutions") ||
      pathname.startsWith("/api/partnerships")
    ))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifyJWT(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // Check role-path access
  for (const [role, paths] of Object.entries(rolePathMap)) {
    if (paths.some((p) => pathname.startsWith(p))) {
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
