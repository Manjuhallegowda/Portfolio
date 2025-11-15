// src/lib/auth.ts
import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

// Sign in with email and password
export const signIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign up a new user
export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Logout the current user
export const logout = () => {
  return signOut(auth);
};

// Subscribe to authentication changes
export const subscribeToAuthChanges = (
  callback: (user: FirebaseUser | null, token: string | null) => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        callback(user, token);
      } catch (error) {
        console.error('Error getting ID token:', error);
        callback(user, null); // Pass user but no token on error
      }
    } else {
      callback(null, null);
    }
  });
};
