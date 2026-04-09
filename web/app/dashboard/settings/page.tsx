"use client";

import { useState, useEffect } from "react";
import {
    User,
    Bell,
    Shield,
    Lock,
    CreditCard,
    Globe,
    LogOut,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    FileText,
    FileUp,
    AlertCircle,
    Building2,
    LockIcon,
    ArrowUpRight,
    Globe2,
    Clock,
    Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user: globalUser, updateUser } = useAuthStore();
    const [user, setUser] = useState<any>(globalUser || {});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    
    // Use URL search param for tab, default to Profile
    const activeTab = searchParams.get("tab") || "Profile";
    const setActiveTab = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`?${params.toString()}`);
    };

    // Verification State
    const [verifyData, setVerifyData] = useState({
        aadhaarLast4: "",
        panNumber: "",
        gstNumber: "",
        udyamNumber: "",
        dpiitNumber: ""
    });
    const [verifyStep, setVerifyStep] = useState(1);
    const [verifyLoading, setVerifyLoading] = useState(false);

    // Pitch Deck State
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (globalUser) {
            setUser((prev: any) => ({ ...prev, ...globalUser }));
        }
    }, [globalUser]);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            updateUser(user);
            setIsLoading(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        }, 1000);
    };

    const handleVerifySubmit = async () => {
        setVerifyLoading(true);
        try {
            const response = await apiFetch("/api/users/verify", {
                method: "POST",
                body: JSON.stringify(verifyData),
            });
            const data = await response.json();
            if (data.success) {
                setVerifyStep(3);
                const updatedUser = { ...user, verificationStatus: "PENDING" };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Verification error:", error);
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            const uploadedUrl = "https://example.com/pitch-deck.pdf";
            const response = await apiFetch("/api/users/pitch-deck", {
                method: "PUT",
                body: JSON.stringify({ pitchDeckUrl: uploadedUrl }),
            });
            const data = await response.json();
            if (data.success) {
                setUploadStatus('success');
            } else {
                setUploadStatus('error');
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus('error');
        } finally {
            setIsUploading(false);
        }
    };

    if (!user) return null;

    const isStartup = user.role === "STARTUP";

    const sidebarItems = [
        { label: "Profile", icon: User },
        { label: "Public Profile", icon: Globe },
        { label: "Verification", icon: ShieldCheck },
        ...(isStartup ? [{ label: "Pitch Deck", icon: FileText }] : []),
        { label: "Security", icon: Shield },
        { label: "Notifications", icon: Bell },
        { label: "Privacy", icon: Lock },
        { label: "Billing", icon: CreditCard },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account preferences and secure your profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="px-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 italic">My Account</h3>
                        </div>
                        <div className="space-y-1">
                            {[
                                { label: "Profile", icon: User },
                                { label: "Public Profile", icon: Globe },
                                { label: "Verification", icon: ShieldCheck },
                                ...(isStartup ? [{ label: "Pitch Deck", icon: FileText }] : []),
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setActiveTab(item.label)}
                                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.label
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <item.icon className={`h-4 w-4 ${activeTab === item.label ? "text-white" : "text-slate-400"}`} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="px-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 italic">Preference & Privacy</h3>
                        </div>
                        <div className="space-y-1">
                            {[
                                { label: "Security", icon: Shield },
                                { label: "Notifications", icon: Bell },
                                { label: "Privacy", icon: Lock },
                                { label: "Billing", icon: CreditCard },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setActiveTab(item.label)}
                                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.label
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <item.icon className={`h-4 w-4 ${activeTab === item.label ? "text-white" : "text-slate-400"}`} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="md:col-span-3 space-y-6">
                    {activeTab === "Profile" && (
                        <>
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Personal Information</CardTitle>
                                            <CardDescription>Update your personal details and public profile info.</CardDescription>
                                        </div>
                                        {user.verificationStatus === "VERIFIED" && (
                                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold uppercase tracking-widest text-[10px]">
                                                <ShieldCheck className="h-3 w-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex flex-col sm:flex-row items-center gap-8">
                                        <div className="relative group">
                                            <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-indigo-100 transition-transform group-hover:scale-105 duration-300">
                                                {user.name?.charAt(0)}
                                            </div>
                                            <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white border border-slate-100 shadow-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors">
                                                <FileUp className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="space-y-2 text-center sm:text-left">
                                            <h4 className="text-2xl font-bold text-slate-900">{user.name}</h4>
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none">
                                                    {user.role}
                                                </Badge>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-sm font-medium text-slate-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" value={user.name || ''} onChange={(e) => setUser({ ...user, name: e.target.value })} className="h-12 border-slate-200 focus:ring-indigo-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" value={user.email || ''} disabled className="h-12 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" value={user.phone || ''} onChange={(e) => setUser({ ...user, phone: e.target.value })} className="h-12 border-slate-200 focus:ring-indigo-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Primary Location</Label>
                                            <Input id="location" value={user.location || ''} onChange={(e) => setUser({ ...user, location: e.target.value })} placeholder="e.g. Mumbai, India" className="h-12 border-slate-200 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                                    <Button variant="ghost">Cancel</Button>
                                    <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSaved ? "Saved!" : "Save Profile")}
                                    </Button>
                                </div>
                            </Card>
                        </>
                    )}

                    {activeTab === "Verification" && (
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white p-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldCheck className="h-6 w-6 text-indigo-400" />
                                    <CardTitle className="text-xl">Identity Verification</CardTitle>
                                </div>
                                <CardDescription className="text-slate-400">
                                    Trusted members receive higher visibility and priority matching.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                {user.verificationStatus === "VERIFIED" ? (
                                    <div className="py-12 text-center space-y-6">
                                        <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-bold text-slate-900">Your Identity is Vetted</h4>
                                            <p className="text-slate-500 max-w-sm mx-auto">Thank you for maintaining a trusted profile on Startup Connect.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                <p className="font-bold text-emerald-600">Active</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Level</p>
                                                <p className="font-bold text-slate-900">Premium Vetted</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : verifyStep === 3 ? (
                                    <div className="py-12 text-center animate-in zoom-in-95 duration-500">
                                        <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Clock className="h-10 w-10 text-indigo-600 animate-pulse" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Currently Under Review</h3>
                                        <p className="text-slate-500 mt-2">Our team is validating your documents with the government database.</p>
                                        <div className="mt-8 p-4 bg-indigo-50 rounded-xl inline-block">
                                            <p className="text-sm font-semibold text-indigo-700">Estimated turnaround: 4-6 hours</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Aadhaar Number (Last 4 Digits)</Label>
                                                <Input
                                                    placeholder="XXXX"
                                                    maxLength={4}
                                                    className="h-12 text-center text-lg tracking-[0.5em]"
                                                    value={verifyData.aadhaarLast4}
                                                    onChange={(e) => setVerifyData({ ...verifyData, aadhaarLast4: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Permanent Account Number (PAN)</Label>
                                                <Input
                                                    placeholder="ABCDE1234F"
                                                    className="h-12 uppercase font-mono"
                                                    value={verifyData.panNumber}
                                                    onChange={(e) => setVerifyData({ ...verifyData, panNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {isStartup && (
                                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                                <h5 className="font-bold text-slate-900 flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-indigo-600" />
                                                    Business Identification
                                                </h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>GSTIN</Label>
                                                        <Input
                                                            placeholder="GST Number"
                                                            className="h-11 uppercase"
                                                            value={verifyData.gstNumber}
                                                            onChange={(e) => setVerifyData({ ...verifyData, gstNumber: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Udyam (MSME)</Label>
                                                        <Input
                                                            placeholder="Udyam ID"
                                                            className="h-11 uppercase"
                                                            value={verifyData.udyamNumber}
                                                            onChange={(e) => setVerifyData({ ...verifyData, udyamNumber: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>DPIIT Number</Label>
                                                        <Input
                                                            placeholder="DPIIT ID"
                                                            className="h-11 uppercase"
                                                            value={verifyData.dpiitNumber}
                                                            onChange={(e) => setVerifyData({ ...verifyData, dpiitNumber: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 mt-6">
                                            <LockIcon className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-amber-900">Privacy First Verification</p>
                                                <p className="text-xs text-amber-800/80 leading-relaxed">
                                                    Documents are processed via AES-256 encrypted channels. We do not store full government identifiers in our primary database.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                setVerifyLoading(true);
                                                setTimeout(handleVerifySubmit, 2000);
                                            }}
                                            disabled={verifyLoading || !verifyData.panNumber}
                                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-xl shadow-indigo-100"
                                        >
                                            {verifyLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirm & Send for Vetting"}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "Pitch Deck" && isStartup && (
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-indigo-600 text-white p-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="h-6 w-6 text-indigo-100" />
                                    <CardTitle className="text-xl">Pitch Deck Repository</CardTitle>
                                </div>
                                <CardDescription className="text-indigo-100">
                                    Control how investors view your business vision.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        accept=".pdf,.pptx"
                                    />
                                    <div className="h-20 w-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <FileUp className="h-10 w-10" />
                                    </div>
                                    <h5 className="text-lg font-bold text-slate-900">{file ? file.name : "Select Pitch Deck"}</h5>
                                    <p className="text-sm text-slate-500 mt-1">Founders usually upload a 10-15 slide PDF (Max 20MB)</p>
                                    {file && <Badge className="mt-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">Ready for upload</Badge>}
                                </div>

                                {uploadStatus === 'success' && (
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-emerald-900">Successfully Uploaded</p>
                                            <p className="text-xs text-emerald-800">Your pitch deck is now visible to verified investors in "View Only" mode.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                <LockIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">View-Only Enforcement</p>
                                                <p className="text-xs text-slate-500">Hides browser toolbars and prevents direct downloads.</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-700 border-none">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                <Globe2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">Global Visibility</p>
                                                <p className="text-xs text-slate-500">Enable visibility for all verified investors.</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-indigo-600" />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || isUploading}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-xl shadow-indigo-100"
                                >
                                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Update Shared Pitch Deck"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "Security" && (
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white p-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="h-6 w-6 text-indigo-400" />
                                    <CardTitle className="text-xl">Security Preferences</CardTitle>
                                </div>
                                <CardDescription className="text-slate-400">
                                    Enhance your account security with advanced protection layers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <h5 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-indigo-600" />
                                        Update Password
                                    </h5>
                                    <div className="grid grid-cols-1 gap-4 max-w-md">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <Input id="currentPassword" type="password" className="h-11" placeholder="••••••••" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input id="newPassword" type="password" className="h-11" placeholder="••••••••" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <Input id="confirmPassword" type="password" className="h-11" placeholder="••••••••" />
                                        </div>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 w-fit px-8 mt-2">Update Password</Button>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h5 className="font-bold text-slate-900">Two-Factor Authentication (2FA)</h5>
                                            <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                                        </div>
                                        <div className="flex items-center h-6">
                                            <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-4">
                                        <ShieldCheck className="h-6 w-6 text-indigo-600 shrink-0 mt-1" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-indigo-900">Recommended</p>
                                            <p className="text-xs text-indigo-800/80 leading-relaxed">
                                                Accounts with 2FA enabled are 99% less likely to be compromised. We support Authenticator apps and SMS.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 space-y-6">
                                    <h5 className="font-bold text-slate-900">Active Sessions</h5>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                                                    <Globe className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Windows • Chrome 120.0</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">BENGALURU, INDIA • CURRENT SESSION</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-700 border-none">Active</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold p-0">
                                        Logout from all other devices
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "Public Profile" && (
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Public Profile</CardTitle>
                                        <CardDescription>Manage how others see your profile on the platform.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Globe className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">Public Profile Visibility</p>
                                            <p className="text-xs text-slate-500 italic font-medium">Allow other users to find and view your profile.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Private</span>
                                        <button 
                                            onClick={() => {
                                                const newValue = !user.isPublic;
                                                setUser({ ...user, isPublic: newValue });
                                                updateUser({ isPublic: newValue }); // Instant auto-update
                                            }}
                                            className={`w-12 h-6 rounded-full transition-all relative ${user.isPublic ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${user.isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Public</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Profile Preview</Label>
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-indigo-100 text-indigo-600 italic">Live Preview</Badge>
                                    </div>
                                    
                                    <div className="p-12 rounded-[40px] bg-slate-50/50 border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(79,70,229,0.03)_0%,_transparent_50%)]" />
                                        
                                        {/* The Card from Screenshot */}
                                        <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-slate-200/60 border border-white flex items-center gap-5 min-w-[340px] relative z-10 transition-transform group-hover:scale-105 duration-500">
                                            <div className="h-20 w-20 rounded-[24px] bg-[#0F172A] flex items-center justify-center text-white text-2xl font-black italic shadow-xl shadow-slate-900/20">
                                                {user.name?.split(' ').map((n: string) => n[0]).join('').toLowerCase() || 'hk'}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-[#0F172A] text-xl uppercase italic tracking-tighter mb-1 leading-none">{user.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] italic">{user.role}</span>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
                                                <Zap className="h-5 w-5 fill-amber-500" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4">
                                        <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0" />
                                        <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                                            When enabled, your profile will be indexed and searchable by potential verified partners. You can revert this at any time.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                                <Button variant="ghost">Reset</Button>
                                <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px] shadow-lg shadow-indigo-100">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSaved ? "Saved!" : "Update Public Profile")}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {(activeTab !== "Profile" && activeTab !== "Public Profile" && activeTab !== "Verification" && activeTab !== "Pitch Deck" && activeTab !== "Security") && (
                        <Card className="border-none shadow-sm h-[400px] flex items-center justify-center text-center p-8">
                            <div className="space-y-4">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                    <Shield className="h-10 w-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{activeTab} coming soon</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">We're building more granular controls for your {activeTab.toLowerCase()} experience.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
