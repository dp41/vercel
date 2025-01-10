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
    matcher: [
        '/dashboard',
        '/dashboard/booking',
        '/dashboard/generate-invoice',
        '/dashboard/generate-invoice/create',
        '/dashboard/generate-invoice/print',
        '/dashboard/clients',
        '/dashboard/clients/add-new-client',
        '/dashboard/agents',
        '/dashboard/agents/add-new-agent',
        '/dashboard/quotation',
        '/dashboard/payment-records',
        '/dashboard/tracking'
    ]
};
