'use client'
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import Loader from "@/components/Loader";

export default function Home() {
    const [showLoader, setShowLoader] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoader(false); // Hide loader after a short delay (optional)
            router.push("/login"); // Redirect to the login page
        }, 500); // Delay for the loader to show

        return () => clearTimeout(timer); // Cleanup timeout on unmount
    }, [router]);

  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
          {showLoader && (
              <Loader message="Redirecting to login... Please wait."/> // Custom message
          )}
      </main>
  );
}
