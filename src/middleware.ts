import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/explore",
  "/opportunities",
  "/documents",
  "/profile",
  "/applications",
  "/saved",
  "/notifications",
  "/settings",
  "/onboarding",
];

const SESSION_COOKIE = "oos_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!needsAuth) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/explore/:path*",
    "/opportunities/:path*",
    "/documents/:path*",
    "/profile/:path*",
    "/applications/:path*",
    "/saved/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
