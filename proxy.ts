import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Optimistic route protection for the admin area.
 *
 * This only checks whether a valid Supabase Auth session cookie exists. The
 * real authorization — "is this auth user actually an active admin?" — happens
 * in `lib/supabase/dal.ts` on every admin data request. Proxy is the fast
 * gate; the DAL is the lock.
 *
 * The matcher below never touches public routes, api routes or static assets.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/login';

  // Logged-in user hitting /login -> send them to the dashboard.
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // No session on an admin route -> login.
  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  // Admin and login routes only; everything else is skipped.
  matcher: ['/admin/:path*', '/login'],
};
