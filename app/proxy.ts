import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.AUTH_SECRET!;
const key = new TextEncoder().encode(SECRET);

const protectedPaths = ["/dashboard", "/assignments", "/cgpa", "/schedules", "/about"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("bh_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, key);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/assignments/:path*", "/cgpa/:path*", "/schedules/:path*", "/about/:path*"],
};
