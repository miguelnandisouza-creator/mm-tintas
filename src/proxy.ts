import { NextResponse, type NextRequest } from "next/server";

import { refreshSession } from "@/lib/supabase/proxy";

function redirectWithSessionCookies(
  request: NextRequest,
  sessionResponse: NextResponse,
  reason?: "configuration" | "forbidden",
) {
  const loginUrl = new URL("/login", request.url);
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("next", destination);
  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }

  const redirectResponse = NextResponse.redirect(loginUrl);

  for (const cookie of sessionResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }

  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const session = await refreshSession(request);

  if (!session.configured) {
    if (process.env.NODE_ENV !== "production") {
      return session.response;
    }

    return redirectWithSessionCookies(
      request,
      session.response,
      "configuration",
    );
  }

  if (!session.user) {
    return redirectWithSessionCookies(request, session.response);
  }

  if (!session.active || session.roles.length === 0) {
    return redirectWithSessionCookies(request, session.response, "forbidden");
  }

  return session.response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
