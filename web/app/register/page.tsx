"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2, AlertCircle, Building, Wallet, User, ShieldCheck, ChevronRight, Eye, EyeOff, Quote } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        otp: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleRoleSelect = (role: string) => {
        setFormData({ ...formData, role });
        setError(null);
    };

    const handleSendOTP = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch("/api/auth/send-otp", {
                method: "POST",
                body: JSON.stringify({ email: formData.email }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to send OTP");
            }
            setStep(3);
        } catch (err: any) {
            setError(err.message || "Could not send verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (step === 3) {
            setIsLoading(true);
            try {
                const response = await apiFetch("/api/auth/register-verify", {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Verification failed");
                setAuth(data.user, data.token, data.refreshToken);
                router.push("/onboarding");
            } catch (err: any) {
                setError(err.message || "Verification failed.");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!formData.role) {
            setError("Please select your role.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        handleSendOTP();
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Form Section */}
            <div className="flex w-full flex-col justify-center lg:w-1/2 p-12 xl:p-24 bg-white dark:bg-zinc-950 transition-colors duration-700 relative z-10">
                <div className="mx-auto w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
                            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary text-white shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform">
                                <Rocket className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter text-foreground uppercase group-hover:tracking-normal transition-all">Startup Connect</span>
                        </Link>
                        <h1 className="text-5xl font-black italic tracking-tighter text-foreground uppercase">Join Us.</h1>
                        <p className="mt-4 text-lg font-bold text-muted-foreground italic">Connect with startups and investors today.</p>
                    </motion.div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 flex items-center gap-3 p-5 text-[11px] font-black uppercase italic tracking-widest text-red-500 glass border border-red-500/20 rounded-2xl animate-shake"
                        >
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground italic ml-2">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Your name"
                                            required
                                            className="h-14 rounded-2xl border-border bg-secondary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold italic px-6 text-lg"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
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
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground italic ml-2">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                required
                                                className="h-14 rounded-2xl border-border bg-secondary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold italic px-6 pr-14 text-lg"
                                                value={formData.password}
                                                onChange={handleChange}
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
                                    <div className="space-y-3">
                                        <Label htmlFor="confirmPassword" title="confirm password" className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground italic ml-2">Repeat Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                required
                                                className="h-14 rounded-2xl border-border bg-secondary/10 focus:bg-white dark:focus:bg-zinc-900 transition-all font-bold italic px-6 pr-14 text-lg"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="h-16 w-full bg-foreground text-white rounded-2xl font-black italic tracking-[5px] shadow-2xl hover-lift transition-all uppercase text-xs"
                                    >
                                        Next <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </motion.div>
                            ) : step === 2 ? (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect("startup")}
                                            className={cn(
                                                "relative flex flex-col p-8 rounded-[40px] border-2 transition-all text-left group overflow-hidden hover-lift",
                                                formData.role === "startup" 
                                                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" 
                                                    : "border-border bg-secondary/10 hover:border-primary/20"
                                            )}
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-primary/20">
                                                <User className="h-7 w-7" />
                                            </div>
                                            <p className="font-black text-[10px] uppercase tracking-[3px] text-muted-foreground mb-1 italic">Founders</p>
                                            <h3 className="text-2xl font-black tracking-tighter italic text-foreground uppercase">Founder</h3>
                                            <p className="mt-3 text-sm font-bold leading-relaxed text-muted-foreground italic">I want to find investors for my startup.</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRoleSelect("investor")}
                                            className={cn(
                                                "relative flex flex-col p-8 rounded-[40px] border-2 transition-all text-left group overflow-hidden hover-lift",
                                                formData.role === "investor" 
                                                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" 
                                                    : "border-border bg-secondary/10 hover:border-primary/20"
                                            )}
                                        >
                                            <div className="h-14 w-14 rounded-2xl bg-foreground text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-foreground/20">
                                                <Wallet className="h-7 w-7" />
                                            </div>
                                            <p className="font-black text-[10px] uppercase tracking-[3px] text-muted-foreground mb-1 italic">Investors</p>
                                            <h3 className="text-2xl font-black tracking-tighter italic text-foreground uppercase">Investor</h3>
                                            <p className="mt-3 text-sm font-bold leading-relaxed text-muted-foreground italic">I want to find and fund great startups.</p>
                                        </button>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            className="h-16 px-10 rounded-2xl border-border bg-secondary/10 font-black italic uppercase tracking-[3px] hover-lift text-[10px]"
                                            onClick={() => setStep(1)}
                                        >
                                            Back
                                        </Button>
                                        <Button 
                                            className="h-16 flex-1 bg-foreground text-white rounded-2xl font-black italic tracking-[5px] shadow-2xl hover-lift transition-all uppercase text-xs"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
                                            Join
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="text-center space-y-4">
                                        <div className="mx-auto h-20 w-20 bg-primary/10 rounded-[30px] flex items-center justify-center mb-6 shadow-2xl shadow-primary/5">
                                            <ShieldCheck className="h-10 w-10 text-primary animate-pulse" />
                                        </div>
                                        <h3 className="text-3xl font-black tracking-tighter italic text-foreground uppercase">Verify.</h3>
                                        <p className="text-lg font-bold text-muted-foreground italic">We sent a 6-digit code to <br/><span className="text-foreground font-black">{formData.email}</span></p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground italic ml-2">Code</Label>
                                        <Input
                                            id="otp"
                                            placeholder="••••••"
                                            maxLength={6}
                                            required
                                            className="h-20 rounded-[30px] border-border bg-secondary/10 shadow-inner text-center text-4xl font-black tracking-[15px] focus:bg-white dark:focus:bg-zinc-900 transition-all font-mono"
                                            value={formData.otp}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            className="h-16 px-10 rounded-2xl border-border bg-secondary/10 font-black italic uppercase tracking-[3px] hover-lift text-[10px]"
                                            onClick={() => setStep(2)}
                                        >
                                            Back
                                        </Button>
                                        <Button 
                                            className="h-16 flex-1 bg-primary text-white rounded-2xl font-black italic tracking-[5px] shadow-2xl hover-lift transition-all uppercase text-xs"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
                                            Complete
                                        </Button>
                                    </div>
                                    
                                    <button 
                                        type="button"
                                        onClick={handleSendOTP}
                                        className="w-full text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[4px] italic"
                                    >
                                        Resend Code
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <p className="mt-16 text-center text-sm font-bold italic text-muted-foreground">
                        Already in?{" "}
                        <Link href="/login" className="font-black text-primary hover:text-primary/80 transition-all uppercase tracking-widest underline decoration-2 underline-offset-4 decoration-primary ml-1">
                            Login
                        </Link>
                    </p>
                </div>
            </div>

            {/* Sidebar Visual Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-foreground p-24 relative overflow-hidden flex-col justify-between transition-colors duration-700">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(99,102,241,0.2)_0%,_transparent_100%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-200 contrast-150" />
                
                <div>
                    <div className="flex gap-3 items-center mb-16">
                        <ShieldCheck className="text-primary h-6 w-6 animate-pulse" />
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-[5px] italic">Secure</span>
                    </div>
                    <h2 className="text-7xl font-black text-white italic leading-[1] tracking-tighter uppercase whitespace-pre-line">
                        Find your next{"\n"}big deal.
                    </h2>
                </div>

                <div className="space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="p-12 rounded-[60px] glass border-white/5 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Quote size={120} className="text-white fill-white" />
                        </div>
                        <div className="flex gap-2 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10" />
                            ))}
                        </div>
                        <p className="text-white font-black italic text-2xl leading-tight mb-8">
                            "It's so much easier to find investors now. Startup Connect organized everything into a simple pipeline."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="h-1.5 w-16 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                            <p className="text-white/60 font-black uppercase tracking-[3px] text-[10px] italic">Marcus Thorne, CEO of Luminar AI</p>
                        </div>
                    </motion.div>

                    <div className="flex justify-between items-center text-[10px] font-black text-white/10 uppercase tracking-[6px] italic">
                        <span>Startup Connect</span>
                        <div className="flex gap-6">
                            <span className="text-white/20">Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
