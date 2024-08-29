import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/auth/login" ||
    path === "/auth/signup" ||
    path === "/auth/verifyemail";
  
  const token = request.cookies.get("token")?.value || "";

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/auth/profile", request.nextUrl));
  }
}

export const config = {
  matcher: [
    "/auth/profile",
    "/auth/login",
    "/auth/signup",
    "/auth/verifyemail",
    "/dashboard",
    "/dashboard/admin",
    
  ],
};
