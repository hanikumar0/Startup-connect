"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiFetch("/api/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to send reset link");
            }

            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                            <KeyRound className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-900">Forgot Password?</CardTitle>
                    <CardDescription>
                        No worries, we&apos;ll send you reset instructions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSubmitted ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <p className="text-zinc-600">Check your email. We have sent a password recover link to <b>{email}</b>.</p>
                            <Button variant="outline" className="w-full border-zinc-200" onClick={() => setIsSubmitted(false)}>
                                Didn&apos;t receive the email? Try again
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-zinc-700">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="h-11 border-zinc-200"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button className="h-11 w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Send Reset Link
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter>
                    <Link href="/login" className="flex items-center justify-center w-full text-sm font-medium text-zinc-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
