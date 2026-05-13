// Firebase configuration and initialization
'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase only on client side with proper error handling
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  try {
    // Check if config is valid - all required fields must be present
    const hasValidConfig = 
      firebaseConfig.apiKey && 
      firebaseConfig.authDomain && 
      firebaseConfig.projectId && 
      firebaseConfig.storageBucket && 
      firebaseConfig.messagingSenderId && 
      firebaseConfig.appId;

    if (!hasValidConfig) {
      console.warn('Firebase configuration is missing. Please set environment variables in .env.local file.');
      console.warn('See .env.local.example for reference.');
    } else {
      // Only initialize if not already initialized
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export { db, auth, storage, app };
export default app;
