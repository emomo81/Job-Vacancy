import { NextRequest, NextResponse } from 'next/server';

const AUTH_PATH = '/auth';

const recruiterOnlyPrefixes = [
  '/dashboard',
  '/candidates',
  '/screening',
  '/results',
  '/settings',
  '/profile',
];

const candidateOnlyPrefix = '/candidate';

function readRoleFromToken(token?: string): string {
  if (!token) return '';

  try {
    const parts = token.split('.');
    if (parts.length < 2) return '';

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    const payload = JSON.parse(json) as { role?: unknown };
    return typeof payload.role === 'string' ? payload.role : '';
  } catch {
    return '';
  }
}

function isRecruiterPath(pathname: string): boolean {
  return recruiterOnlyPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isCandidatePath(pathname: string): boolean {
  return pathname === candidateOnlyPrefix || pathname.startsWith(`${candidateOnlyPrefix}/`);
}

function redirectForRole(req: NextRequest, role: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = role === 'candidate' ? '/candidate/jobs' : '/dashboard';
  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('rankr_token')?.value;
  const cookieRole = req.cookies.get('rankr_role')?.value || '';
  const tokenRole = readRoleFromToken(token);
  const role = tokenRole || cookieRole;
  const isAuthenticated = Boolean(token);

  if (pathname === AUTH_PATH && isAuthenticated) {
    return redirectForRole(req, role || 'recruiter');
  }

  const needsAuth = isCandidatePath(pathname) || isRecruiterPath(pathname);
  if (needsAuth && !isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = AUTH_PATH;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isCandidatePath(pathname) && isAuthenticated) {
    if (role !== 'candidate' && role !== 'admin') {
      return redirectForRole(req, role || 'recruiter');
    }
  }

  // Recruiter pages remain backend-protected by token role checks.
  // Avoid client-side hard redirects here because stale role cookies can
  // incorrectly block valid recruiter sessions.

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth', '/dashboard/:path*', '/candidates/:path*', '/screening/:path*', '/results/:path*', '/settings/:path*', '/profile/:path*', '/candidate/:path*'],
};
