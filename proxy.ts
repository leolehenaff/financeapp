import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/api/cron")) return NextResponse.next();
  const ok = await verifyToken(request.cookies.get("auth_token")?.value, process.env.AUTH_SECRET);
  if (ok) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)"] };
