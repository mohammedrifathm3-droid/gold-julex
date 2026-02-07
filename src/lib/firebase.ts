// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBD8rFYEYM3rJV9eXD67I4GYAvHKVJZ1zM",
    authDomain: "julex-609b8.firebaseapp.com",
    projectId: "julex-609b8",
    storageBucket: "julex-609b8.firebasestorage.app",
    messagingSenderId: "816479328743",
    appId: "1:816479328743:web:200ad7832752ad673b0542",
    measurementId: "G-WHFCV4PGJY"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Initialize Analytics conditionally (only in browser)
if (typeof window !== "undefined") {
    isSupported().then(yes => yes && getAnalytics(app));
}


