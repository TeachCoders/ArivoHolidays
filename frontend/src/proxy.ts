import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("connect.sid");



  if (!session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  return NextResponse.next();
}

export const config = {
 matcher: ["/dashboard/:path*",],

  //   matcher: [
  //   "/((?!api?|_next/static|_next/image|favicon.ico).*)",
  // ],
};
