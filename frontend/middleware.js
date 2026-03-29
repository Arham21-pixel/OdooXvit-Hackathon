import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const publicPaths = ['/', '/login', '/signup', '/demo'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/'));

  // Redirect unauthenticated users to /login (but not the landing page)
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from /login and /signup (but NOT from '/')
  const isAuthPage = ['/login', '/signup'].some(path => request.nextUrl.pathname.startsWith(path));
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next endpoints, and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
