// /src/pages/Auth.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const toggleMode = () => setIsSignup((prev) => !prev);

  const handleEmailAuth = async () => {
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isSignup ? "Sign Up" : "Login"}
        </h2>
        <input
          className="border p-2 mb-4 w-full rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 mb-4 w-full rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleEmailAuth}
          className="w-full bg-blue-600 text-white py-2 rounded mb-2"
        >
          {isSignup ? "Sign Up with Email" : "Login with Email"}
        </button>

        <div className="text-center mb-2">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          Login with Google
        </button>

        <p className="mt-4 text-center text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button className="text-blue-600" onClick={toggleMode}>
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
