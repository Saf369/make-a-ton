import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do NOT remove this
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  const role = (user?.user_metadata?.role as string) || 'customer';

  // Redirect unauthenticated users to login (exclude /api routes)
  if (!user && !isPublicRoute && pathname !== '/' && !pathname.startsWith('/api')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages or root based on role priority
  if (user && (isPublicRoute || pathname === '/')) {
    const url = request.nextUrl.clone();
    // Low Priority (Customer) -> Customer Portal
    // Med Priority (Staff) & High Priority (Admin) -> Executive Dashboard
    url.pathname = role === 'customer' ? '/customer-portal' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Role Access Guard:
  // Low priority customers are strictly isolated to customer-portal and profile
  if (user && role === 'customer') {
    const customerAllowedRoutes = ['/customer-portal', '/profile'];
    const isAllowed = customerAllowedRoutes.some((r) => pathname.startsWith(r)) || pathname.startsWith('/api');
    if (!isAllowed) {
      const url = request.nextUrl.clone();
      url.pathname = '/customer-portal';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
