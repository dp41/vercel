'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { auth } from "@/lib/firebase";
import { AuthProvider } from "@/lib/AuthContext"; // Adjust path as needed

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true); // Show loader while checking authentication
            const user = auth.currentUser;

            if (user) {
                // If user is logged in, redirect to dashboard
                router.push("/dashboard");
            } else {
                // If no user, redirect to login
                router.push("/login");
            }
            setIsLoading(false); // Hide loader after redirection
        };

        checkAuth();
    }, [router]);

    return (
        <AuthProvider>
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                {isLoading && (
                    <Loader message="Checking authentication... Please wait." />
                )}
            </main>
        </AuthProvider>
    );
}
