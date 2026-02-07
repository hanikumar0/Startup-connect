"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Loader2, AlertCircle } from "lucide-react";
import { Card as UICard, CardHeader as UICardHeader, CardTitle as UICardTitle, CardDescription as UICardDescription, CardContent as UICardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

export default function StartupOnboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        companyName: "",
        ownerName: "",
        teamSize: "1",
        yearFounded: new Date().getFullYear().toString(),
        industry: "FINTECH",
        fundingStage: "SEED",
        fundingRequired: "",
        description: "",
        history: "",
        website: "",
    });

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(user);
        const userRole = (parsedUser.role || "").trim().toUpperCase();

        // Only redirect IF explicitly completed
        if (parsedUser.isProfileCompleted === true || parsedUser.isProfileCompleted === "true") {
            router.push("/dashboard");
            return;
        }

        // Only redirect if role mismatch
        if (userRole !== "STARTUP") {
            router.push("/dashboard");
            return;
        }
    }, [router]);

    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiFetch("/api/users/startup-profile", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save profile");
            }

            // Update local storage user object
            const userStore = JSON.parse(localStorage.getItem("user") || "{}");
            userStore.isProfileCompleted = true;
            localStorage.setItem("user", JSON.stringify(userStore));

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4">
            <UICard className="w-full max-w-2xl border-none shadow-xl">
                <UICardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                            <Rocket className="h-6 w-6" />
                        </div>
                    </div>
                    <UICardTitle className="text-2xl">Complete Startup Profile</UICardTitle>
                    <UICardDescription>This information will be used by our AI to match you with relevant investors.</UICardDescription>
                </UICardHeader>
                <UICardContent>
                    {error && (
                        <div className="mb-6 flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    placeholder="Unicorn Inc."
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ownerName">Founder / Owner Name</Label>
                                <Input
                                    id="ownerName"
                                    placeholder="Enter full name"
                                    required
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="teamSize">Team Size</Label>
                                <Input
                                    id="teamSize"
                                    type="number"
                                    placeholder="1"
                                    required
                                    value={formData.teamSize}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="yearFounded">Year Founded</Label>
                                <Input
                                    id="yearFounded"
                                    type="number"
                                    placeholder="2024"
                                    required
                                    value={formData.yearFounded}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="industry">Industry</Label>
                                <select
                                    id="industry"
                                    className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                >
                                    <option value="FINTECH">Fintech</option>
                                    <option value="EDTECH">Edtech</option>
                                    <option value="HEALTHTECH">Healthtech</option>
                                    <option value="SAAS">SaaS</option>
                                    <option value="AI">AI/ML</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fundingStage">Funding Stage</Label>
                                <select
                                    id="fundingStage"
                                    className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.fundingStage}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                >
                                    <option value="PRE-SEED">Pre-Seed</option>
                                    <option value="SEED">Seed</option>
                                    <option value="SERIES-A">Series A</option>
                                    <option value="SERIES-B">Series B</option>
                                    <option value="LATE-STAGE">Late Stage</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fundingRequired">Funding Required (USD)</Label>
                                <Input
                                    id="fundingRequired"
                                    type="number"
                                    placeholder="500000"
                                    required
                                    value={formData.fundingRequired}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="website">Company Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    placeholder="https://yourstartup.com"
                                    value={formData.website}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Short Description (Elevator Pitch)</Label>
                            <textarea
                                id="description"
                                rows={3}
                                className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Briefly describe what your startup does..."
                                required
                                value={formData.description}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="history">Company History</Label>
                            <textarea
                                id="history"
                                rows={3}
                                className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Tell us about how you started..."
                                required
                                value={formData.history}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : "Save Profile & Start Matching"}
                        </Button>
                    </form>
                </UICardContent>
            </UICard>
        </div>
    );
}
