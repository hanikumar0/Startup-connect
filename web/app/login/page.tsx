"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Loader2, AlertCircle, Quote, Github, Linkedin, Mail, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { motion } from "framer-motion";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle OAuth callbacks
    useEffect(() => {
        const token = searchParams.get("token");
        const userDataStr = searchParams.get("user");

        if (token && userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                setAuth(userData, token, ""); 
                redirectUser(userData);
            } catch (err) {
                console.error("Failed to parse user data from URL", err);
            }
        }
    }, [searchParams, setAuth]);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError(null);
    };

    const redirectUser = (user: any) => {
        if (!user.onboardingCompleted) {
            router.push("/onboarding");
            return;
        }

        switch (user.role) {
            case "startup":
                router.push("/startup/dashboard");
                break;
            case "investor":
                router.push("/investor/dashboard");
                break;
            case "admin":
                router.push("/admin/dashboard");
                break;
            default:
                router.push("/dashboard");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            setAuth(data.user, data.token, data.refreshToken);
            redirectUser(data.user);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Column: Form Section */}
            <div className="flex w-full flex-col justify-center lg:w-[40%] bg-white dark:bg-zinc-950 px-8 py-12 sm:px-12 xl:px-24 relative z-10 transition-colors duration-700">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mx-auto w-full max-w-sm"
                >
                    <div className="flex items-center gap-3 mb-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary text-white shadow-2xl shadow-primary/30">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Startup Connect</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Hi Again.</h1>
                        <p className="mt-4 text-lg font-bold text-muted-foreground italic">
                            Connect with startups and investors instantly.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 flex items-center gap-3 p-5 text-[11px] font-black uppercase italic tracking-widest text-red-500 glass border border-red-500/20 rounded-2xl animate-shake">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Button 
                            variant="outline" 
                            className="h-14 rounded-2xl border-border bg-secondary/20 hover:bg-secondary/40 transition-all font-black italic text-[11px] uppercase tracking-[3px] text-foreground hover-lift"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
                        >
                            Google
                        </Button>
                        <Button 
                            variant="outline" 
                            className="h-14 rounded-2xl border-border bg-secondary/20 hover:bg-secondary/40 transition-all font-black italic text-[11px] uppercase tracking-[3px] text-foreground hover-lift"
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/linkedin`}
                        >
                            LinkedIn
                        </Button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-[9px] uppercase tracking-[5px] font-black text-muted-foreground italic opacity-40">
                            <span className="bg-white dark:bg-zinc-950 px-6 transition-colors duration-700">Or use email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground italic ml-2">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                className="h-14 rounded-2xl border-border bg-secondary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold italic px-6 text-lg"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground italic">Password</Label>
                                <Link href="/forgot-password" title="forgot-password" className="text-[10px] font-black text-primary hover:underline italic uppercase tracking-widest">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="h-14 rounded-2xl border-border bg-secondary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold italic px-6 pr-14 text-lg"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <Button 
                            className="h-16 w-full rounded-2xl bg-foreground text-white font-black italic tracking-[5px] shadow-2xl hover-lift transition-all uppercase text-xs"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            ) : null}
                            Login
                        </Button>
                    </form>

                    <p className="mt-12 text-center text-sm font-bold italic text-muted-foreground">
                        No account?{" "}
                        <Link href="/register" className="font-black text-primary hover:text-primary/80 transition-all uppercase tracking-widest underline decoration-2 underline-offset-4 decoration-primary ml-1">
                            Join Us
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Column: Visual Section */}
            <div className="hidden w-full lg:flex lg:w-[60%] bg-foreground relative overflow-hidden transition-colors duration-700">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(99,102,241,0.2)_0%,_transparent_100%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-200 contrast-150" />
                
                <div className="relative z-10 flex flex-col items-center justify-center w-full px-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="p-16 backdrop-blur-3xl glass border-white/5 rounded-[60px] shadow-2xl relative overflow-hidden group max-w-2xl"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Quote size={200} className="text-white fill-white" />
                        </div>
                        
                        <div className="flex gap-2 mb-10">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-1.5 w-10 bg-primary/40 rounded-full" />
                            ))}
                        </div>

                        <h2 className="text-5xl font-black text-white mb-12 leading-[1.1] italic tracking-tighter">
                            "This is the best way to find great companies and grow together."
                        </h2>
                        
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-white font-black italic text-xl shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                JD
                            </div>
                            <div>
                                <p className="text-white font-black tracking-[4px] text-xs uppercase italic">Jameson Daltry</p>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px] italic">Managing Partner, Alpha Stream Capital</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Subtle platform stat badges floating */}
                    <div className="absolute top-40 right-28 animate-float">
                        <div className="glass border-white/10 backdrop-blur-3xl px-8 py-4 rounded-3xl flex items-center gap-3 shadow-2xl">
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <span className="text-[11px] font-black text-white tracking-[4px] uppercase italic">$4.2B Raised</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end border-t border-white/5 pt-10">
                    <p className="text-[10px] text-white/20 font-black tracking-[6px] uppercase italic">Startup Connect</p>
                    <div className="flex items-center gap-6">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <p className="text-[10px] text-white/60 font-black tracking-[4px] uppercase italic">Secure</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-12 w-12 rounded-2xl bg-primary animate-pulse shadow-2xl shadow-primary/20" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
