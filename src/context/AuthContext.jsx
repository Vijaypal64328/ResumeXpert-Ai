// /src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    if (auth.currentUser) {
      setUser({ ...auth.currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Authentication actions
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const updateEmail = async (email) => {
    await firebaseUpdateEmail(auth.currentUser, email);
    refreshUser();
  };

  const updatePassword = async (password) => {
    await firebaseUpdatePassword(auth.currentUser, password);
    refreshUser();
  };

  const updateUserProfile = async (profile) => {
    await firebaseUpdateProfile(auth.currentUser, profile);
    refreshUser(); // refresh the user state with new profile
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        signup,
        login,
        logout,
        updateEmail,
        updatePassword,
        updateUserProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
