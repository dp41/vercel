"use client"; // Mark this as a client component
import React, { createContext, useContext, useState, useEffect } from 'react';
import {monitorAuthState} from "@/lib/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        monitorAuthState(setUser);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
