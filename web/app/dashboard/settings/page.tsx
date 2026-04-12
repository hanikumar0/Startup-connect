"use client";

import { useState, useEffect } from "react";
import {
    User,
    Bell,
    Shield,
    Lock,
    CreditCard,
    Globe,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    FileText,
    FileUp,
    AlertCircle,
    Building2,
    LockIcon,
    ChevronRight,
    Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";

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
            setTimeout(() => setIsSaved(false), 2000);
        }, 800);
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
            }
        } catch (error) {
            console.error("Verification error:", error);
        } finally {
            setVerifyLoading(false);
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
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Simple Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-50">
               <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                     <span>Settings</span>
                     <ChevronRight size={8} className="text-slate-300" />
                     <span className="text-slate-900/60">{activeTab}</span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Manage {activeTab}
                  </h1>
               </div>
               <div className="flex gap-8 text-right">
                  <div>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Trust Status</p>
                     <p className="text-sm font-bold text-slate-900">Verified</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Compact Sidebar */}
                <div className="md:col-span-3 space-y-4">
                    <nav className="space-y-1">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setActiveTab(item.label)}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-[12px] font-semibold transition-all ${activeTab === item.label
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <item.icon size={15} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-9">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        {activeTab === "Profile" && (
                            <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
                                <CardHeader className="p-6 border-b border-slate-50">
                                    <CardTitle className="text-sm font-bold text-slate-900">Personal Information</CardTitle>
                                    <CardDescription className="text-[11px]">Update your basic account details and contact info.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold border border-slate-100">
                                                {user.name?.charAt(0)}
                                            </div>
                                            <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-indigo-600 shadow-md flex items-center justify-center text-white text-[10px]">
                                                <FileUp size={12} />
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-bold text-slate-900">{user.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-indigo-50 text-indigo-700 border-none font-bold uppercase px-2 py-0.5 rounded text-[8px]">
                                                    {user.role}
                                                </Badge>
                                                <span className="text-[11px] text-slate-400">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Full Name</Label>
                                            <Input value={user.name || ''} onChange={(e) => setUser({ ...user, name: e.target.value })} className="h-10 border-slate-100 rounded-lg px-4 text-xs font-medium" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Email Address</Label>
                                            <Input value={user.email || ''} disabled className="h-10 bg-slate-50 border-slate-50 text-slate-400 text-xs px-4" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Phone</Label>
                                            <Input value={user.phone || ''} onChange={(e) => setUser({ ...user, phone: e.target.value })} className="h-10 border-slate-100 rounded-lg px-4 text-xs font-medium" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Location</Label>
                                            <Input value={user.location || ''} onChange={(e) => setUser({ ...user, location: e.target.value })} className="h-10 border-slate-100 rounded-lg px-4 text-xs font-medium" />
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-end gap-3">
                                    <Button variant="ghost" className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase text-slate-400">Cancel</Button>
                                    <Button onClick={handleSave} disabled={isLoading} className="h-9 px-6 bg-indigo-600 text-white rounded-lg font-bold uppercase text-[10px] tracking-wider">
                                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (isSaved ? "Saved" : "Save Changes")}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {activeTab === "Verification" && (
                            <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
                                <CardHeader className="p-6 border-b border-slate-50">
                                    <CardTitle className="text-sm font-bold text-slate-900">Verification Status</CardTitle>
                                    <CardDescription className="text-[11px]">Verify your identity to unlock all platform features.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {user.verificationStatus === "VERIFIED" ? (
                                        <div className="py-8 text-center space-y-4">
                                            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-bold text-slate-900">Identity Verified</h4>
                                                <p className="text-xs text-slate-400">Your account has been successfully checked.</p>
                                            </div>
                                        </div>
                                    ) : verifyStep === 3 ? (
                                        <div className="py-10 text-center space-y-4">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                                <AlertCircle className="h-8 w-8 text-indigo-600 animate-pulse" />
                                            </div>
                                            <h3 className="text-md font-bold text-slate-900">Checking Documents</h3>
                                            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">This usually takes around 24 hours.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Aadhaar (Last 4)</Label>
                                                    <Input
                                                        maxLength={4}
                                                        className="h-10 text-center text-lg font-bold bg-slate-50 border-slate-100 rounded-lg"
                                                        value={verifyData.aadhaarLast4}
                                                        onChange={(e) => setVerifyData({ ...verifyData, aadhaarLast4: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">PAN Number</Label>
                                                    <Input
                                                        className="h-10 uppercase font-bold text-xs bg-slate-50 border-slate-100 rounded-lg px-4"
                                                        value={verifyData.panNumber}
                                                        onChange={(e) => setVerifyData({ ...verifyData, panNumber: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {isStartup && (
                                                <div className="pt-6 border-t border-slate-50 space-y-4">
                                                    <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Business Details</h5>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <Input placeholder="GST Number" value={verifyData.gstNumber} onChange={(e) => setVerifyData({ ...verifyData, gstNumber: e.target.value })} className="h-9 text-xs bg-slate-50 border-none rounded-lg" />
                                                        <Input placeholder="UDYAM ID" value={verifyData.udyamNumber} onChange={(e) => setVerifyData({ ...verifyData, udyamNumber: e.target.value })} className="h-9 text-xs bg-slate-50 border-none rounded-lg" />
                                                        <Input placeholder="DPIIT ID" value={verifyData.dpiitNumber} onChange={(e) => setVerifyData({ ...verifyData, dpiitNumber: e.target.value })} className="h-9 text-xs bg-slate-50 border-none rounded-lg" />
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                onClick={() => {
                                                    setVerifyLoading(true);
                                                    setTimeout(handleVerifySubmit, 1500);
                                                }}
                                                disabled={verifyLoading || !verifyData.panNumber}
                                                className="w-full h-11 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-sm"
                                            >
                                                {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-white" /> : "Submit for Verification"}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "Public Profile" && (
                            <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
                                <CardHeader className="p-6 border-b border-slate-50">
                                    <CardTitle className="text-sm font-bold text-slate-900">Visibility Settings</CardTitle>
                                    <CardDescription className="text-[11px]">Control who can find and view your profile info.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-indigo-600">
                                                    <Globe size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Public Visibility</p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Search indexing</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newValue = !user.isPublic;
                                                    setUser({ ...user, isPublic: newValue });
                                                    updateUser({ isPublic: newValue });
                                                }}
                                                className={`w-14 h-7 rounded-full transition-all relative ${user.isPublic ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all ${user.isPublic ? 'translate-x-7' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Security Note</p>
                                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-50">
                                            <p className="text-[11px] text-indigo-700 font-medium">
                                                Making your profile public allows other verified users to find you and start a conversation. Your sensitive data remains private.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {(activeTab !== "Profile" && activeTab !== "Public Profile" && activeTab !== "Verification") && (
                            <Card className="border-slate-100 shadow-sm rounded-xl bg-white h-80 flex items-center justify-center text-center p-10">
                                <div className="space-y-4">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-slate-200 border border-slate-100">
                                        <Shield size={20} />
                                    </div>
                                    <div className="space-y-1">
                                       <h3 className="text-sm font-bold text-slate-900">Feature Coming Soon</h3>
                                       <p className="text-[11px] text-slate-400 max-w-xs mx-auto">We are working on bringing {activeTab} tools to you very soon.</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
