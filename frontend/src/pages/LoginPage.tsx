import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Quote } from 'lucide-react';
import { toast } from "sonner";
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/loader';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [redirectPath, setRedirectPath] = useState('/dashboard');

    useEffect(() => {
        const savedPath = localStorage.getItem('authRedirectPath');
        if (savedPath) {
            setRedirectPath(savedPath);
            localStorage.removeItem('authRedirectPath');
        }
    }, []);

    useEffect(() => {
        if (user) {
            navigate(redirectPath);
        }
    }, [user, navigate, redirectPath]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password.");
            return;
        }
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);

            toast.success("Login successful! Redirecting...");
            navigate('/dashboard');

        } catch (error: any) {
            console.error("Login Error:", error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
                toast.error("Invalid email or password.");
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <Loader fullScreen />}
            <div className="min-h-screen flex">
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                    <div className="w-full max-w-md space-y-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-theme-darkSlate">Welcome Back!</h1>
                        <p className="text-muted-foreground">
                            Log in to access your dashboard, manage resumes, and discover job opportunities tailored for you.
                        </p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="login-email">Email</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="example@mail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="login-password">Password</Label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full text-lg py-3 bg-theme-blue hover:bg-theme-blue/90 text-white mt-6"
                                disabled={isLoading}
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                Sign In
                            </Button>
                            <div className="flex flex-col items-center mt-4">
                                <span className="text-gray-500 mb-2">or</span>
                                <Button
                                    type="button"
                                    className="w-full text-lg py-3 border border-gray-300 flex items-center justify-center bg-white text-gray-800 hover:bg-gray-100"
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
                                            const provider = new GoogleAuthProvider();
                                            await signInWithPopup(auth, provider);
                                            toast.success("Google login successful! Redirecting...");
                                            navigate('/dashboard');
                                        } catch (error: any) {
                                            toast.error("Google login failed. Please try again.");
                                            console.error("Google Login Error:", error);
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    disabled={isLoading}
                                >
                                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.36 30.77 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.98 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.93 0-10.29l-7.98-6.2C.7 16.18 0 19.01 0 22c0 2.99.7 5.82 1.96 8.2l8.71-6.91z"/><path fill="#EA4335" d="M24 44c6.48 0 11.93-2.15 15.9-5.85l-7.19-5.6c-2.01 1.35-4.59 2.15-8.71 2.15-6.43 0-11.87-4.48-13.33-10.29l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/></g></svg>
                                    Login with Google
                                </Button>
                                <div className="mt-4">
                                    <span className="text-gray-600">Don't have an account? </span>
                                    <Link to="/signup" className="text-theme-blue hover:underline font-semibold">Sign Up</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-theme-blue to-theme-purple items-center justify-center p-12 text-white flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-opacity-10 bg-white backdrop-blur-sm"></div>
                    <div className="relative z-10 text-center space-y-6">
                        <Quote className="h-12 w-12 text-cyan-300 mx-auto" strokeWidth={1.5} />
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            Craft Your Future.
                        </h2>
                        <p className="text-xl font-light text-blue-100 max-w-md mx-auto">
                            "Leverage AI to build a resume that stands out and matches you with the perfect job."
                        </p>
                        <div className="pt-4">
                            <p className="font-semibold">ResumeXpert pro</p>
                            <p className="text-sm text-blue-200">Your Career Advancement Partner</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage; 