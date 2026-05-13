import { NextResponse, type NextRequest } from "next/server";
import { logout } from "@/app/auth/actions";

/**
 * POST /auth/signout — delegates to the audited server action so every
 * sign-out is recorded in audit.auth_events. logout() calls redirect()
 * internally; the catch keeps Next happy if we ever bypass that.
 */
export async function POST(request: NextRequest) {
  try {
    await logout();
  } catch {
    // NEXT_REDIRECT is expected; fall through to a hard redirect otherwise.
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
