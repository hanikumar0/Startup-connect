"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, Loader2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function InvestorOnboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firmName: "",
        investorType: "ANGEL",
        minInvestment: "",
        maxInvestment: "",
        industries: [] as string[],
        bio: "",
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
        if (userRole !== "INVESTOR") {
            router.push("/dashboard");
            return;
        }
    }, [router]);

    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (industry: string) => {
        setFormData(prev => ({
            ...prev,
            industries: prev.industries.includes(industry)
                ? prev.industries.filter(i => i !== industry)
                : [...prev.industries, industry]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiFetch("/api/users/investor-profile", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save profile");
            }

            // Update local storage user object
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            user.isProfileCompleted = true;
            localStorage.setItem("user", JSON.stringify(user));

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4">
            <Card className="w-full max-w-2xl border-none shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                            <User className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Investor Preferences</CardTitle>
                    <CardDescription>Configure your investment thesis to get high-quality startup recommendations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="firmName">Firm/Organization Name (Optional)</Label>
                            <Input
                                id="firmName"
                                placeholder="Sequoia Capital"
                                value={formData.firmName}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="investorType">Investor Type</Label>
                            <select
                                id="investorType"
                                className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.investorType}
                                onChange={handleChange}
                                disabled={isLoading}
                            >
                                <option value="ANGEL">Angel Investor</option>
                                <option value="VC">Venture Capitalist</option>
                                <option value="PE">Private Equity</option>
                                <option value="CORPORATE">Corporate VC</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="minInvestment">Min Investment ($)</Label>
                                <Input
                                    id="minInvestment"
                                    type="number"
                                    placeholder="10000"
                                    required
                                    value={formData.minInvestment}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxInvestment">Max Investment ($)</Label>
                                <Input
                                    id="maxInvestment"
                                    type="number"
                                    placeholder="500000"
                                    required
                                    value={formData.maxInvestment}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Industries of Interest</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                {["FINTECH", "SAAS", "AI", "EDTECH", "HEALTHTECH", "ESTATE"].map(ind => (
                                    <div key={ind} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={ind}
                                            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={formData.industries.includes(ind)}
                                            onChange={() => handleCheckboxChange(ind)}
                                            disabled={isLoading}
                                        />
                                        <label htmlFor={ind} className="text-sm font-medium text-zinc-700">{ind}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Investment Bio / Thesis</Label>
                            <textarea
                                id="bio"
                                rows={4}
                                className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe your investment focus..."
                                required
                                value={formData.bio}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : "Complete Profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
