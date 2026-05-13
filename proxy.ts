import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/src/lib/session';

// Middleware'de de başlık eklemek için (next.config.ts ile çakışmaz; her ikisi de uygulanır)
const EXTRA_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function applyHeaders(response: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(EXTRA_HEADERS)) {
    response.headers.set(k, v);
  }
  return response;
}

function redirectToLogin(request: NextRequest, from?: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  if (from) loginUrl.searchParams.set('from', from);
  return applyHeaders(NextResponse.redirect(loginUrl));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isCoachRoute = pathname.startsWith('/coach');

  if (isAdminRoute || isCoachRoute) {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

    if (!sessionToken) {
      return redirectToLogin(request, pathname);
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return redirectToLogin(request, pathname);
    }

    if (isAdminRoute && session.role !== 'Admin') {
      return redirectToLogin(request);
    }

    if (isCoachRoute && session.role !== 'Coach' && session.role !== 'Admin') {
      return redirectToLogin(request);
    }
  }

  return applyHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    // Static varlıkları, session API'sini ve favicon'u hariç tut
    '/((?!_next/static|_next/image|favicon.ico|api/auth/session|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
