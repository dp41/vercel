import { NextResponse } from "next/server";
import {initializeApp, getApps, getApp, applicationDefault} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK only once
const app = !getApps().length
    ? initializeApp({
        credential: applicationDefault(),
    })
    : getApp();

// Get Auth instance from Firebase Admin
const adminAuth = getAuth(app);

export async function middleware(request) {
    const token = request.cookies.get("token");
    const url = request.nextUrl.clone();

    if (!token) {
        // Redirect unauthenticated users from protected routes to login
        if (url.pathname.startsWith("/dashboard")) {
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    try {
        // Verify the token with Firebase Admin SDK
        await adminAuth.verifyIdToken(token);
        return NextResponse.next();
    } catch (error) {
        console.error("Token verification failed:", error);
        // If token is invalid or expired, redirect to login
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }
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
        '/dashboard/tracking',
    ],
};
