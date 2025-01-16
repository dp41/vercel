import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value;

    // Exclude specific paths like '/dashboard/booking' from the login check
    if (!isLoggedIn && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
