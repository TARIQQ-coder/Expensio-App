import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update user profile (e.g., displayName)
  const updateUserProfile = async ({ displayName }) => {
    if (!user) throw new Error("No user is signed in");
    try {
      await updateProfile(user, { displayName });
      setUser({ ...user, displayName });
    } catch (error) {
      console.error("🔥 Error updating profile:", error);
      throw error;
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email) => {
    if (!email) throw new Error("Email is required");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("🔥 Error sending password reset email:", error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("🔥 Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        updateUserProfile,
        sendPasswordReset,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);