import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get("token");
    const url = request.nextUrl.clone();

    if (!token && url.pathname.startsWith("/dashboard")) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
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
