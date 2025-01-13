// src/lib/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {auth} from "@/lib/firebase";

// Sign up user
export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Login user
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Logout user
export const logOut = async () => {
    try {
        await signOut(auth);
        document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

    } catch (error) {
        throw new Error(error.message);
    }
};

// Monitor authentication state
export const monitorAuthState = (callback) => {
    onAuthStateChanged(auth, callback);
};
