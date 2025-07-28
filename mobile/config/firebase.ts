// Firebase configuration for CocoShield
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase configuration for CocoShield
export const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyCrqrXBvnm1IU7QfvxMBOWxRDcA0zse3To",
  authDomain: "cocoshield.firebaseapp.com",
  projectId: "cocoshield",
  storageBucket: "cocoshield.firebasestorage.app",
  messagingSenderId: "662719214117",
  appId: "1:662719214117:web:0ed32e03a19e079a0445cc",
  measurementId: "G-JXW9VLMRNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// User roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// User interface
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  emailVerified: boolean;
}

// Admin credentials (for demo purposes)
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin@123'
};

// Export Firebase app instance
export default app; 