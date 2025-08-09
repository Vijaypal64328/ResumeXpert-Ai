import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR0XY_4Jr6TLdaUciMcspyaDXkXRlAh38",
  authDomain: "resumexpert-ai.firebaseapp.com",
  projectId: "resumexpert-ai",
  storageBucket: "resumexpert-ai.appspot.com",  // ✅ Corrected domain here if needed
  messagingSenderId: "929613780540",
  appId: "1:929613780540:web:a95b352ca42845f6485539",
  measurementId: "G-BVKTLMD92T",
  databaseURL: "https://resumexpert-ai-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);

// 🔐 Auth + Google Login
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ☁️ Firestore Database
export const db = getFirestore(app);

// 🖼️ Firebase Storage (for profile images or resumes if needed)
export const storage = getStorage(app);
