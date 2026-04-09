"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Rocket, Wallet, Loader2, MapPin, Globe, Briefcase, DollarSign, User, ShieldCheck, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
    const router = useRouter();
    const { user, setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isImproving, setIsImproving] = useState(false);

    // Initial form state based on the user's role
    const [formData, setFormData] = useState<any>({
        // Common
        location: "",
        bio: "",

        // Startup specific
        startupName: "",
        industry: "",
        stage: "",
        fundingRequired: "",
        description: "",

        // Investor specific
        investorName: "",
        firmName: "",
        investorType: "",
        checkSize: "",
        preferredIndustries: [] as string[],
        currency: "USD",
    });

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }
        if (user.onboardingCompleted) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const improveWithAi = async () => {
        const text = user?.role === 'startup' ? formData.description : formData.bio;
        if (!text || text.length < 10) {
            alert("Please enter at least 10 characters before asking for AI help!");
            return;
        }

        setIsImproving(true);
        console.log("Requesting AI improvement for:", text);
        try {
            const response = await apiFetch("/api/ai/improve-text", {
                method: "POST",
                body: JSON.stringify({
                    text,
                    type: user?.role === 'startup' ? 'startup_vision' : 'investor_thesis'
                }),
            });

            const data = await response.json();
            if (response.ok && data.improvedText && data.improvedText !== text) {
                console.log("AI Improvement Success:", data.improvedText);
                setFormData({
                    ...formData,
                    [user?.role === 'startup' ? "description" : "bio"]: data.improvedText
                });
            } else {
                console.warn("AI Improvement returned no changes or failed:", data);
                alert("AI transformation complete (no significant changes required).");
            }
        } catch (err) {
            console.error("AI improvement failed", err);
            alert("Auto-Write is down. Try again later.");
        } finally {
            setIsImproving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData({ ...formData, [id]: value });
    };

    const handleIndustryToggle = (industry: string) => {
        const current = formData.preferredIndustries;
        if (current.includes(industry)) {
            setFormData({ ...formData, preferredIndustries: current.filter((i: string) => i !== industry) });
        } else {
            setFormData({ ...formData, preferredIndustries: [...current, industry] });
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const role = user?.role;
            const endpoint = role === 'startup' ? '/api/startup/create' : '/api/investor/create';
            const payload = role === 'startup' ? {
                startupName: formData.startupName,
                industry: formData.industry,
                stage: formData.stage.toLowerCase() === 'idea' ? 'idea' : (formData.stage === 'MVP' ? 'MVP' : 'growth'),
                fundingRequired: parseFloat(formData.fundingRequired) || 0,
                currency: formData.currency,
                location: formData.location || "Remote",
                description: formData.description || formData.bio || "No description provided."
            } : {
                investorName: formData.investorName,
                firmName: formData.firmName,
                investorType: formData.investorType || "VC",
                checkSizeMin: parseFloat(formData.checkSize) * 0.5 || 10000,
                checkSizeMax: parseFloat(formData.checkSize) * 2 || 1000000,
                currency: formData.currency,
                preferredIndustries: formData.preferredIndustries,
                location: formData.location || "Remote",
                bio: formData.bio || "Professional Investor profile."
            };

            const response = await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to complete onboarding");
            }

            // After creating profile, update user state
            const userResponse = await apiFetch("/api/auth/me");
            if (userResponse.ok) {
                const userData = await userResponse.json();

                // Get current auth tokens from storage
                const storageData = localStorage.getItem('auth-storage');
                const authState = storageData
                    ? JSON.parse(storageData).state
                    : { token: '', refreshToken: '' };

                // Ensure we pass the user object, not the wrapper response
                if (userData.user) {
                    setAuth(userData.user, authState.token, authState.refreshToken);

                    const targetRole = userData.user.role || role;
                    const targetPath = targetRole === 'startup' ? '/startup/dashboard' : '/investor/dashboard';

                    console.log("[Onboarding] Submission success. Redirecting to:", targetPath);

                    setTimeout(() => {
                        router.push(targetPath);
                        setTimeout(() => {
                            if (window.location.pathname === '/onboarding') {
                                window.location.href = targetPath;
                            }
                        }, 1200);
                    }, 100);
                }
            }
        } catch (err: any) {
            setIsLoading(false);
            console.error("Onboarding submission failed:", err);
            setError(err.message || "Something went wrong.");
            alert("Error: " + (err.message || "Could not save."));
        }
    };

    const industries = ["SaaS", "Fintech", "AI/ML", "Healthtech", "Cleantech", "Crypto/Web3", "E-commerce"];
    const stages = ["Idea", "MVP", "Seed", "Series A", "Series B", "Growth"];
    const investorTypes = ["Angel", "VC", "Private Equity", "Family Office", "Corporate"];
    const currencies = [
        { code: "USD", symbol: "$", name: "USD" },
        { code: "EUR", symbol: "€", name: "EUR" },
        { code: "GBP", symbol: "£", name: "GBP" },
        { code: "INR", symbol: "₹", name: "INR" },
    ];

    const progressValue = (step / 3) * 100;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col transition-colors duration-500">
            <header className="px-8 py-6 flex justify-between items-center glass border-b border-border fixed top-0 w-full z-50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-float">
                        <Rocket className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-foreground uppercase italic px-1">Setup</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Signed in</p>
                        <p className="text-xs font-bold italic text-foreground">{user?.name || 'User'}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic shadow-inner">
                        {user?.name?.[0] || 'U'}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pt-32 sm:p-12 sm:pt-40 bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-from)_0%,_transparent_50%)] from-primary/5">
                <div className="w-full max-w-2xl">
                    <div className="mb-12 px-2">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[4px] text-muted-foreground italic mb-1">
                                    Step {step} of 3
                                </h2>
                                <p className="text-xl font-black italic tracking-tighter text-foreground uppercase">
                                    {step === 1 ? 'About You' : step === 2 ? 'Business' : 'Vision'}
                                </p>
                            </div>
                            <span className="text-sm font-black text-primary italic uppercase tracking-widest">{Math.round(progressValue)}% DONE</span>
                        </div>
                        <Progress value={progressValue} className="h-2 rounded-full bg-secondary shadow-inner" />
                    </div>

                    <div className="glass rounded-[40px] shadow-2xl shadow-primary/5 border border-border p-8 sm:p-12 relative overflow-hidden hover:shadow-primary/10 transition-shadow">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <Sparkles size={300} className="text-primary animate-pulse" />
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-10 p-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center gap-4 text-sm italic font-black uppercase tracking-tight"
                            >
                                <ShieldCheck className="h-6 w-6 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">
                                            {user.role === 'startup' ? 'Your Company Name' : 'Full Name'}
                                        </Label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2.5 glass rounded-xl text-primary transition-transform group-focus-within:scale-110">
                                                {user.role === 'startup' ? <Rocket size={20} /> : <User size={20} />}
                                            </div>
                                            <Input
                                                id={user.role === 'startup' ? "startupName" : "investorName"}
                                                placeholder={user.role === 'startup' ? "Ex: Tech Flow Inc" : "Ex: John Doe"}
                                                value={user.role === 'startup' ? formData.startupName : formData.investorName}
                                                onChange={handleInputChange}
                                                className="h-16 pl-20 rounded-[24px] border-border bg-secondary/20 focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all text-lg font-bold italic"
                                            />
                                        </div>
                                    </div>

                                    {user.role === 'investor' && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">Your Firm</Label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2.5 glass rounded-xl text-primary transition-transform group-focus-within:scale-110">
                                                    <Briefcase size={20} />
                                                </div>
                                                <Input
                                                    id="firmName"
                                                    placeholder="Ex: Vision Capital"
                                                    value={formData.firmName}
                                                    onChange={handleInputChange}
                                                    className="h-16 pl-20 rounded-[24px] border-border bg-secondary/20 focus:bg-background text-lg font-bold italic"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">Location</Label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2.5 glass rounded-xl text-primary transition-transform group-focus-within:scale-110">
                                                <MapPin size={20} />
                                            </div>
                                            <Input
                                                id="location"
                                                placeholder="Ex: San Francisco, Remote"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="h-16 pl-20 rounded-[24px] border-border bg-secondary/20 focus:bg-background text-lg font-bold italic"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">{user?.role === 'startup' ? 'Industry' : 'Investor Type'}</Label>
                                            <Select
                                                onValueChange={(val: string) => handleSelectChange(user?.role === 'startup' ? "industry" : "investorType", val)}
                                                value={user?.role === 'startup' ? formData.industry : formData.investorType}
                                            >
                                                <SelectTrigger className="h-16 rounded-[24px] border-border bg-secondary/20 font-black italic text-left px-6 focus:ring-4 focus:ring-primary/5">
                                                    <SelectValue placeholder="Pick one..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border glass shadow-2xl">
                                                    {(user?.role === 'startup' ? industries : investorTypes).map(item => (
                                                        <SelectItem key={item} value={item} className="h-12 font-black italic tracking-tight">{item}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">{user?.role === 'startup' ? 'Stage' : 'Typical Investment'}</Label>
                                            {user?.role === 'startup' ? (
                                                <Select onValueChange={(val: string) => handleSelectChange("stage", val)} value={formData.stage}>
                                                    <SelectTrigger className="h-16 rounded-[24px] border-border bg-secondary/20 font-black italic px-6 focus:ring-4 focus:ring-primary/5">
                                                        <SelectValue placeholder="Pick stage..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-border glass shadow-2xl">
                                                        {stages.map(item => (
                                                            <SelectItem key={item} value={item} className="h-12 font-black italic">{item}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <Select value={formData.currency} onValueChange={(val) => handleSelectChange('currency', val)}>
                                                        <SelectTrigger className="h-16 w-32 rounded-[24px] border-border bg-secondary/20 font-black italic px-4 focus:ring-4 focus:ring-primary/5">
                                                            <SelectValue placeholder="USD" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-2xl border-border glass">
                                                            {currencies.map(curr => (
                                                                <SelectItem key={curr.code} value={curr.code} className="h-12 font-black italic">
                                                                    {curr.symbol} {curr.code}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        id="checkSize"
                                                        placeholder="Ex: 500k"
                                                        value={formData.checkSize}
                                                        onChange={handleInputChange}
                                                        className="h-16 flex-1 rounded-[24px] border-border bg-secondary/20 font-black italic px-6 focus:ring-4 focus:ring-primary/5"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {user.role === 'startup' ? (
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-2">How much do you need?</Label>
                                            <div className="flex gap-3">
                                                <Select value={formData.currency} onValueChange={(val) => handleSelectChange('currency', val)}>
                                                    <SelectTrigger className="h-16 w-32 rounded-[24px] border-border bg-secondary/20 font-black italic px-4">
                                                        <SelectValue placeholder="USD" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-border glass">
                                                        {currencies.map(curr => (
                                                            <SelectItem key={curr.code} value={curr.code} className="h-12 font-black italic">
                                                                {curr.symbol} {curr.code}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <div className="relative flex-1 group">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2.5 glass rounded-xl text-primary group-focus-within:scale-110 transition-transform">
                                                        <DollarSign size={20} />
                                                    </div>
                                                    <Input
                                                        id="fundingRequired"
                                                        type="number"
                                                        placeholder="Ex: 1000000"
                                                        value={formData.fundingRequired}
                                                        onChange={handleInputChange}
                                                        className="h-16 pl-20 rounded-[24px] border-border bg-secondary/20 text-lg font-black italic"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic block mb-2 text-center">Interests</Label>
                                            <div className="flex flex-wrap gap-3 justify-center">
                                                {industries.map(ind => (
                                                    <button
                                                        key={ind}
                                                        type="button"
                                                        onClick={() => handleIndustryToggle(ind)}
                                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black italic tracking-widest transition-all border-2 
                                                        ${formData.preferredIndustries.includes(ind)
                                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                                                : 'bg-secondary/20 text-muted-foreground border-border hover:border-primary/30'}`}
                                                    >
                                                        {ind}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1 block">Your Story</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={improveWithAi}
                                                disabled={isImproving || !(user.role === 'startup' ? formData.description : formData.bio)}
                                                className="h-10 rounded-2xl bg-primary/10 hover:bg-primary hover:text-white text-primary font-black italic text-[10px] tracking-[2px] uppercase shadow-sm flex items-center gap-3 group border border-primary/20 transition-all px-6"
                                            >
                                                {isImproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />}
                                                Auto-Write
                                            </Button>
                                        </div>
                                        <Textarea
                                            id={user.role === 'startup' ? "description" : "bio"}
                                            placeholder={user.role === 'startup' ? "Share your big vision. What are you building?" : "Tell us about your investment history and mission."}
                                            className="min-h-[200px] rounded-[32px] border-border bg-secondary/10 focus:bg-background p-8 text-lg font-bold leading-relaxed italic placeholder:text-muted-foreground/30 shadow-inner"
                                            value={user.role === 'startup' ? formData.description : formData.bio}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center justify-between p-6 rounded-[32px] bg-secondary/10 border border-border transition-all hover:bg-secondary/20 hover:border-primary/20 group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                                    <Globe className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-foreground uppercase italic tracking-tight">Public Profile Visibility</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">Allow verified users to discover you</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                                                className={`w-14 h-8 rounded-full transition-all relative p-1 ${formData.isPublic ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted'}`}
                                            >
                                                <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${formData.isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-primary/5 border border-primary/10 rounded-3xl flex items-center gap-4 animate-lift">
                                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-tight text-primary italic">This helps us find you the best matches instantly.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-14 flex gap-4 pt-10 border-t border-border">
                            <Button
                                variant="outline"
                                disabled={step === 1 || isLoading}
                                onClick={() => setStep(step - 1)}
                                className="h-16 rounded-[24px] px-10 border-border bg-secondary/10 font-black italic uppercase tracking-widest hover-lift"
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> BACK
                            </Button>

                            {step < 3 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    className="h-16 flex-1 rounded-[24px] bg-foreground text-white font-black italic tracking-widest uppercase shadow-2xl group hover-lift"
                                >
                                    NEXT <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="h-16 flex-1 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black italic tracking-widest uppercase shadow-2xl animate-lift shadow-primary/20"
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                    FINISH
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-10 flex justify-center border-t border-border glass mt-20">
                <p className="text-[10px] font-black uppercase tracking-[6px] text-muted-foreground/40 italic">Startup Connect / Simple. Fast. Powerful.</p>
            </footer>
        </div>
    );
}
