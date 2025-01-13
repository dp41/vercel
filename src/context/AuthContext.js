// context/AuthContext.js
'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import {auth} from "@/lib/firebase";
import {onAuthStateChanged} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    return (
        <AuthContext.Provider value={{ user , setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
