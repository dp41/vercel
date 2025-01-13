// components/ProtectedRoute.js
import { useEffect } from 'react';
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [router, user]);

    if (!user) {
        return null; // Optionally show a loading spinner
    }

    return <>{children}</>;
};

export default ProtectedRoute;
