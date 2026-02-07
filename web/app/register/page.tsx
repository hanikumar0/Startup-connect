"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Loader2, User, Building2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState("startup");
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [otp, setOtp] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        countryCode: "+91",
        phone: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const fullPhone = `${formData.countryCode}${formData.phone}`;
            const response = await apiFetch("/api/auth/send-otp", {
                method: "POST",
                body: JSON.stringify({ email: formData.email, phone: fullPhone }),
            });

            if (!response.ok) throw new Error("Failed to send OTP");

            setStep(2); // Move to OTP step
            setResendTimer(30); // Set 30s cooldown
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Real API call to verify OTP
            const verifyRes = await apiFetch("/api/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email: formData.email, otp }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || "Invalid OTP");

            // If OTP is correct, proceed with registration
            const response = await apiFetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    phone: `${formData.countryCode}${formData.phone}`,
                    role: role.toUpperCase(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Registration failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-xl border-none shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                            <Rocket className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
                    <CardDescription>
                        Join the vetted community of founders and investors
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    {step === 1 ? (
                        <>
                            <Tabs defaultValue="startup" onValueChange={setRole} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 p-1 bg-zinc-100 h-12">
                                    <TabsTrigger value="startup" className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        <Building2 className="mr-2 h-4 w-4" /> Startup
                                    </TabsTrigger>
                                    <TabsTrigger value="investor" className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        <User className="mr-2 h-4 w-4" /> Investor
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            required
                                            className="h-11 border-zinc-200"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="flex gap-2">
                                            <select
                                                id="countryCode"
                                                className="w-[90px] h-11 border-zinc-200 rounded-md bg-zinc-50 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={formData.countryCode}
                                                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                            >
                                                <option value="+91">+91 (IN)</option>
                                                <option value="+1">+1 (US)</option>
                                                <option value="+44">+44 (UK)</option>
                                                <option value="+971">+971 (UAE)</option>
                                                <option value="+65">+65 (SG)</option>
                                            </select>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="9876543210"
                                                required
                                                className="flex-1 h-11 border-zinc-200"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@company.com"
                                        required
                                        className="h-11 border-zinc-200"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Create Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        className="h-11 border-zinc-200"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button className="h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all mt-2" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Send Verification OTP
                                </Button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="grid gap-6 py-4">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-bold">Verify your identity</h3>
                                <p className="text-sm text-zinc-500">We've sent a 4-digit OTP to {formData.email}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="otp">Enter 4-Digit OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="0 0 0 0"
                                    maxLength={4}
                                    className="h-14 text-center text-3xl tracking-[12px] font-bold border-indigo-100"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button className="h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Verify & Create Account
                            </Button>

                            <div className="text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-xs text-zinc-500">Resend OTP in <span className="font-bold text-indigo-600">{resendTimer}s</span></p>
                                ) : (
                                    <button
                                        type="button"
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-500 underline"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <Button type="button" variant="ghost" className="text-xs text-zinc-500" onClick={() => setStep(1)}>
                                Back to details
                            </Button>
                        </form>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-zinc-500">Or register with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-11 border-zinc-200"
                            disabled={isLoading}
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
                        >
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 border-zinc-200"
                            disabled={isLoading}
                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/linkedin`}
                        >
                            LinkedIn
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-center gap-1 text-sm text-zinc-600 border-t border-zinc-50 pt-6">
                    <span>Already have an account?</span>
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Login here
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
