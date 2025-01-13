// components/ProtectedRoute.js

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true); // Track loading state

    useEffect(() => {
        if (user === null) {
            // Wait until user is defined (null means Firebase is still checking auth state)
            return;
        }

        if (!user) {
            router.push('/login');
        } else {
            setLoading(false); // User is logged in, no need to wait anymore
        }
    }, [router, user]);

    if (loading) {
        return null; // Optionally show a loading spinner here
    }

    return <>{children}</>;
};

export default ProtectedRoute;
