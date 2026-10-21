import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

function negotiate(request: NextRequest): "ru" | "kz" {
  const cookie = request.cookies.get("qds_locale")?.value;
  if (cookie === "kz" || cookie === "ru") return cookie;

  const header = request.headers.get("accept-language")?.toLowerCase() ?? "";
  // Kazakh first only when explicitly preferred over Russian.
  if (header.includes("kk") || header.includes("kz")) return "kz";
  return "ru";
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/og") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first === "ru" || first === "kz") return NextResponse.next();

  const locale = negotiate(request);
  const target = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const url = request.nextUrl.clone();
  url.pathname = target;
  url.search = search;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
