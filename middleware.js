import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-env'
);

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // 1. Allow public routes
    if (
        pathname.startsWith('/api/auth') ||
        pathname === '/login' ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // 2. Check for token
    const token = req.cookies.get('token')?.value;

    if (!token) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        // Verify token
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.next();
    } catch (error) {
        // Redirect to login if token is invalid
        console.error('Middleware JWT Error:', error.message);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes) -> we actually want to protect some APIs, but auth ones are allowed above
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
