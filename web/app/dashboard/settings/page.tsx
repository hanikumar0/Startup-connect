"use client";

import { useState, useEffect } from "react";
import {
    User,
    Lock,
    Loader2,
    FileUp,
    ChevronRight,
    Mail,
    Building2,
    Zap,
    Link as LinkIcon,
    Users,
    Clock,
    LockIcon,
    TrendingUp,
    PieChart,
    Verified,
    Activity,
    Target,
    Briefcase,
    ShieldCheck,
    MapPin,
    Globe,
    FileText,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
    const { user: globalUser, updateUser } = useAuthStore();
    const [user, setUser] = useState<any>(globalUser || {});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab ] = useState("profile");

    // KYC States
    const [kycStatus, setKycStatus] = useState("not_submitted");
    const [isFetchingKYC, setIsFetchingKYC] = useState(false);
    const [kycFormData, setKycFormData] = useState<any>({
        dob: "",
        country: "",
        idType: "Aadhaar",
        idNumber: "",
        idDocument: "",
        companyType: "Private Ltd",
        companyDoc: "",
        registrationNumber: "",
        businessDescription: "",
        coFounderEmails: [],
        pastInvestments: "",
        investorType: "",
        investmentRange: ""
    });

    // Instant e-KYC States
    const [aadhaarOTP, setAadhaarOTP] = useState("");
    const [isAadhaarOTPSent, setIsAadhaarOTPSent] = useState(false);
    const [aadhaarClientId, setAadhaarClientId] = useState("");
    const [isVerifyingInstant, setIsVerifyingInstant] = useState(false);

    const handleSendAadhaarOTP = async () => {
        if (!kycFormData.idNumber || kycFormData.idNumber.length !== 12) {
            alert("Please provide a valid 12-digit Aadhaar number first.");
            return;
        }
        setIsVerifyingInstant(true);
        try {
            const res = await apiFetch("/api/verify/aadhaar", {
                method: "POST",
                body: JSON.stringify({ aadhaarNumber: kycFormData.idNumber })
            });
            const data = await res.json();
            if (data.success) {
                setIsAadhaarOTPSent(true);
                setAadhaarClientId(data.clientId);
                alert("OTP sent to your Aadhaar-linked mobile number.");
            } else {
                alert(data.message || "Failed to generate OTP");
            }
        } catch (error) {
            console.error("Aadhaar OTP error:", error);
        } finally {
            setIsVerifyingInstant(false);
        }
    };

    const handleSubmitAadhaarOTP = async () => {
        if (!aadhaarOTP || !aadhaarClientId) return;
        setIsVerifyingInstant(true);
        try {
            const res = await apiFetch("/api/verify/aadhaar/otp", {
                method: "POST",
                body: JSON.stringify({ otp: aadhaarOTP, clientId: aadhaarClientId })
            });
            const data = await res.json();
            if (data.success) {
                setKycStatus("verified");
                alert("Aadhaar e-KYC Successful! Your profile is now verified.");
                window.location.reload(); // Refresh to update all states
            } else {
                alert(data.message || "OTP verification failed.");
            }
        } catch (error) {
            console.error("OTP verification error:", error);
        } finally {
            setIsVerifyingInstant(false);
        }
    };

    const handleVerifyPAN = async () => {
        if (!kycFormData.idNumber) {
            alert("Please provide your PAN number.");
            return;
        }
        setIsVerifyingInstant(true);
        try {
            const res = await apiFetch("/api/verify/pan", {
                method: "POST",
                body: JSON.stringify({ panNumber: kycFormData.idNumber })
            });
            const data = await res.json();
            if (data.success) {
                setKycStatus("verified");
                alert("PAN e-KYC Successful! Identity confirmed.");
                window.location.reload();
            } else {
                alert(data.message || "PAN verification failed.");
            }
        } catch (error) {
            console.error("PAN verification error:", error);
        } finally {
            setIsVerifyingInstant(false);
        }
    };

    useEffect(() => {
        if (globalUser) {
            setUser((prev: any) => ({ ...prev, ...globalUser }));
        }
        fetchKYCStatus();
    }, [globalUser]);

    const fetchKYCStatus = async () => {
        setIsFetchingKYC(true);
        try {
            const res = await apiFetch("/api/kyc/status");
            const data = await res.json();
            if (data.success) {
                setKycStatus(data.kycStatus);
                if (data.kycData) {
                    setKycFormData((prev: any) => ({ ...prev, ...data.kycData }));
                }
            }
        } catch (error) {
            console.error("KYC Fetch error:", error);
        } finally {
            setIsFetchingKYC(false);
        }
    };

    const isStartup = user.role?.toLowerCase() === "startup";
    const isInvestor = user.role?.toLowerCase() === "investor";

    // UNIFIED TABS
    const menuItems = [
        { id: "profile", label: "My Identity", icon: User },
        { id: "verification", label: "Verification", icon: ShieldCheck },
        { id: "matchmaking", label: isStartup ? "Fundraising" : "Investment Hub", icon: Target },
        { id: "network", label: isStartup ? "Co-Founders" : "Portfolio", icon: Users },
        { id: "security", label: "Security", icon: Lock },
    ];

    const focusOptions = [
        "SaaS", "AI", "Fintech", "Healthtech", "Edtech",
        "Web3", "Marketplace", "ClimateTech", "DevTools",
        "Cybersecurity", "E-commerce", "Gaming"
    ];

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch("/api/users/profile", {
                method: "PUT",
                body: JSON.stringify(user),
            });
            const data = await response.json();
            if (data.success) {
                updateUser(data.user);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            } else {
                alert(data.message || "Failed to save profile");
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKYCSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch("/api/kyc/submit", {
                method: "POST",
                body: JSON.stringify({ kycData: kycFormData })
            });
            const data = await res.json();
            if (data.success) {
                setKycStatus("pending");
            } else {
                alert(data.message || "KYC submission failed");
            }
        } catch (error) {
            console.error("KYC Submit error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isCooldownActive = (lastUpdate: string | Date | null) => {
        if (!lastUpdate) return false;
        const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const last = new Date(lastUpdate);
        return (now.getTime() - last.getTime() < SIXTY_DAYS_MS);
    };

    const getDaysRemaining = (lastUpdate: string | Date | null) => {
        if (!lastUpdate) return 0;
        const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const last = new Date(lastUpdate);
        const diff = SIXTY_DAYS_MS - (now.getTime() - last.getTime());
        return Math.ceil(diff / (24 * 60 * 60 * 1000));
    };

    const toggleTag = (type: 'focus' | 'tags', tag: string) => {
        if (type === 'focus' && isCooldownActive(user.lastFocusUpdate)) return;
        const current = user[type] || [];
        const updated = current.includes(tag)
            ? current.filter((t: string) => t !== tag)
            : [...current, tag];
        setUser({ ...user, [type]: updated });
    };

    const renderUnifiedProfile = () => (
        <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white border-2">
            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black text-slate-900 italic tracking-tight">Institutional Profile</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-400 mt-1">Unified identification and branding for {user.role} accounts.</CardDescription>
                    </div>
                    <Badge className="bg-white border-slate-200 text-slate-900 font-black text-[10px] uppercase h-8 px-4 shadow-sm italic">
                        {isStartup ? `Stage: ${user.stage || 'Idea'}` : (isInvestor ? `Tier: ${user.investorStage || 'New'}` : user.role)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
                {/* Visual Identity Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-[32px] bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-black border-2 border-slate-200 shadow-inner overflow-hidden">
                            {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" /> : user.name?.charAt(0)}
                        </div>
                        <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200 flex items-center justify-center text-white hover:scale-110 transition-transform">
                            <FileUp size={18} />
                        </button>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">{user.name}</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[4px] mt-2 flex items-center gap-2 justify-center sm:justify-start">
                           <Verified size={12} className={kycStatus === 'verified' ? "text-emerald-500" : "text-slate-300"} />
                           {kycStatus === 'verified' ? 'Identified Presence' : 'Standard Presence'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Common Fields */}
                    <div className="space-y-6">
                        <div className="space-y-2 opacity-60 grayscale cursor-not-allowed">
                             <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                                <LockIcon size={12} className="text-slate-300" />
                            </div>
                            <Input value={user.name || ''} disabled className="h-12 border-slate-100 bg-slate-50/50 rounded-xl px-4 text-sm font-bold" />
                        </div>
                        <div className="space-y-2 opacity-60 grayscale cursor-not-allowed">
                             <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Email</Label>
                                <LockIcon size={12} className="text-slate-300" />
                            </div>
                            <Input value={user.email || ''} disabled className="h-12 bg-slate-50/50 border-slate-100 text-slate-400 text-sm font-bold px-4" />
                        </div>
                        <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Operating Location</Label>
                             <div className="relative">
                                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input 
                                    value={user.location || ''} 
                                    onChange={(e) => setUser({ ...user, location: e.target.value })} 
                                    className="h-12 border-slate-100 bg-slate-50/30 rounded-xl pl-11 text-sm font-bold text-slate-900" 
                                    placeholder="e.g. San Francisco, US"
                                />
                             </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Official Presence (URL)</Label>
                             <div className="relative">
                                <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input 
                                    value={user.website || ''} 
                                    onChange={(e) => setUser({ ...user, website: e.target.value })} 
                                    className="h-12 border-slate-100 bg-slate-50/30 rounded-xl pl-11 text-sm font-bold text-slate-900" 
                                    placeholder="https://yourwebsite.com"
                                />
                             </div>
                        </div>
                        
                        {/* Dynamic Field: Role Indicator */}
                         <div className="space-y-2 opacity-60 grayscale cursor-not-allowed">
                             <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Branch</Label>
                                <LockIcon size={12} className="text-slate-300" />
                            </div>
                            <Input value={isStartup ? (user.companyName || "N/A") : (isInvestor ? (user.investorType || "Individual") : "Standard")} disabled className="h-12 bg-slate-50/50 border-slate-100 text-slate-400 text-sm font-bold px-4" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Elevator Headline</Label>
                                <div className="flex items-center gap-2">
                                    {isCooldownActive(user.lastHeadlineUpdate) && (
                                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase italic">Locked for {getDaysRemaining(user.lastHeadlineUpdate)}d</span>
                                    )}
                                </div>
                            </div>
                            <Input 
                                value={user.headline || ''} 
                                disabled={isCooldownActive(user.lastHeadlineUpdate)}
                                onChange={(e) => setUser({ ...user, headline: e.target.value })} 
                                className="h-12 border-slate-100 bg-slate-50/30 rounded-xl px-4 text-sm font-bold text-slate-900 italic" 
                                placeholder={isStartup ? "Summarize your mission..." : "Define your investment thesis..."}
                            />
                        </div>
                    </div>
                </div>

                {/* Role-Specific Content Area (In Profile Tab) */}
                <div className="pt-8 border-t border-slate-50">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6 block text-center">Market Positioning</Label>
                    <div className={`flex flex-wrap gap-3 justify-center ${isCooldownActive(user.lastFocusUpdate) ? 'opacity-50 pointer-events-none' : ''}`}>
                         {focusOptions.map(opt => (
                            <button
                                key={opt}
                                onClick={() => toggleTag('focus', opt)}
                                className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border-2 uppercase italic tracking-tighter ${
                                    user.focus?.includes(opt) 
                                    ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1" 
                                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
                <Button onClick={handleSave} disabled={isLoading} className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[20px] font-black uppercase text-xs tracking-[4px] shadow-2xl shadow-indigo-100 transition-all hover-lift">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Update Global Profile
                </Button>
            </div>
        </Card>
    );

    const renderVerification = () => {
        const isPending = kycStatus === "pending";
        const isVerified = kycStatus === "verified";
        const isRejected = kycStatus === "rejected";

        return (
            <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white border-2">
                <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 italic tracking-tight italic">KYC Authority System</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400 mt-1">Institutional verification for high-trust matchmaking.</CardDescription>
                        </div>
                        <Badge className={`h-8 px-4 rounded-xl font-black text-[10px] uppercase shadow-sm tracking-widest italic ${
                            isVerified ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            isPending ? "bg-amber-50 text-amber-600 border-amber-100" :
                            isRejected ? "bg-rose-50 text-rose-600 border-rose-100" :
                            "bg-white border-slate-200 text-slate-400"
                        }`}>
                            {isVerified ? "✔ Verified" : isPending ? "⏳ Pending Review" : isRejected ? "✖ Rejected" : "⚠ Not Verified"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    {isPending ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="h-24 w-24 bg-amber-50 rounded-[40px] flex items-center justify-center text-amber-500 animate-pulse">
                                <Clock size={48} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-slate-900 italic uppercase">Verification in Progress</h3>
                                <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed italic">
                                    Your KYC submission is currently being validated by our strategic compliance unit. Access will be unlocked shortly.
                                </p>
                            </div>
                        </div>
                    ) : isVerified ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="h-24 w-24 bg-emerald-50 rounded-[40px] flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-100">
                                <CheckCircle2 size={48} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-slate-900 italic uppercase">KYC Verified</h3>
                                <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed italic">
                                    Full institutional clearance granted. Your profile is now anchored with a high-trust verification badge and prioritized in matchmaking.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* SECTION 1: IDENTITY */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[5px] italic">01. Personal Identity</h4>
                                    <div className="h-px flex-1 bg-slate-50" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 opacity-60">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Legal Full Name</Label>
                                        <Input value={user.name || ''} disabled className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2 opacity-60">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Government Email</Label>
                                        <Input value={user.email || ''} disabled className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Date of Birth</Label>
                                        <Input type="date" value={kycFormData.dob} onChange={(e) => setKycFormData({...kycFormData, dob: e.target.value})} className="h-12 border-slate-100 bg-white rounded-xl px-4 text-sm font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Domicile Country</Label>
                                        <Input value={kycFormData.country} onChange={(e) => setKycFormData({...kycFormData, country: e.target.value})} placeholder="e.g. India" className="h-12 border-slate-100 bg-white rounded-xl px-4 text-sm font-bold" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Select ID Archetype</Label>
                                        <select 
                                            value={kycFormData.idType}
                                            onChange={(e) => setKycFormData({...kycFormData, idType: e.target.value})}
                                            className="h-12 w-full bg-white border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none"
                                        >
                                            <option value="Aadhaar">Aadhaar (UIDAI)</option>
                                            <option value="PAN">Permanent Account Number (PAN)</option>
                                            <option value="Passport">International Passport</option>
                                            <option value="Driving License">Driving License</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Identification Number</Label>
                                        <div className="flex gap-2">
                                            <Input value={kycFormData.idNumber} onChange={(e) => setKycFormData({...kycFormData, idNumber: e.target.value})} placeholder="Enter document number..." className="h-12 border-slate-100 bg-white rounded-xl px-4 text-sm font-bold flex-1" />
                                            {(kycFormData.idType === "Aadhaar" || kycFormData.idType === "PAN") && (
                                                <Button 
                                                    onClick={kycFormData.idType === "Aadhaar" ? handleSendAadhaarOTP : handleVerifyPAN}
                                                    disabled={isVerifyingInstant}
                                                    className="h-12 px-6 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-100"
                                                >
                                                    {isVerifyingInstant ? <Loader2 className="h-4 w-4 animate-spin" /> : "Instant e-KYC"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isAadhaarOTPSent && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-6 bg-indigo-50/30 border border-indigo-100 rounded-[24px] space-y-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                                <LockIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">One-Time Authorization</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enter the 6-digit code sent to your linked mobile.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={aadhaarOTP} 
                                                onChange={(e) => setAadhaarOTP(e.target.value)} 
                                                placeholder="Enter 6-digit OTP" 
                                                maxLength={6}
                                                className="h-12 border-slate-100 bg-white rounded-xl px-4 text-sm font-bold flex-1 tracking-[1em] text-center" 
                                            />
                                            <Button 
                                                onClick={handleSubmitAadhaarOTP}
                                                disabled={isVerifyingInstant || aadhaarOTP.length !== 6}
                                                className="h-12 px-8 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                            >
                                                {isVerifyingInstant ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center space-y-4 hover:border-indigo-200 transition-all cursor-pointer bg-slate-50/20 group">
                                     <div className="h-14 w-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                                        <FileText size={24} />
                                     </div>
                                     <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 italic">Inject ID Document (PNG/PDF)</p>
                                </div>
                            </div>

                            {/* SECTION 2: INSTITUTIONAL ROLE SPECIFIC */}
                            {isStartup ? (
                                <div className="space-y-8 pt-8">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[5px] italic">02. Corporate Registry</h4>
                                        <div className="h-px flex-1 bg-slate-50" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2 opacity-60">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Registered Entity Name</Label>
                                            <Input value={user.companyName || ''} disabled className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Legal Structure</Label>
                                            <select 
                                                value={kycFormData.companyType}
                                                onChange={(e) => setKycFormData({...kycFormData, companyType: e.target.value})}
                                                className="h-12 w-full bg-white border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none"
                                            >
                                                <option value="Private Ltd">Private Limited (Pvt Ltd)</option>
                                                <option value="LLP">Limited Liability Partnership (LLP)</option>
                                                <option value="Sole Proprietor">Sole Proprietorship</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">CIN / Registration Number</Label>
                                            <Input value={kycFormData.registrationNumber} onChange={(e) => setKycFormData({...kycFormData, registrationNumber: e.target.value})} placeholder="e.g. U74999DL2023..." className="h-12 border-slate-100 bg-white rounded-xl px-4 text-sm font-bold" />
                                        </div>
                                         <div className="space-y-2 opacity-60">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Official Domain</Label>
                                            <Input value={user.website || ''} disabled className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Institutional Thesis (Short)</Label>
                                        <textarea 
                                            value={kycFormData.businessDescription} 
                                            onChange={(e) => setKycFormData({...kycFormData, businessDescription: e.target.value})}
                                            className="w-full min-h-[120px] p-5 bg-white border border-slate-100 rounded-[24px] text-sm font-medium focus:outline-none italic"
                                            placeholder="What exact disturbance is your entity resolving?"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Co-founder Alignment (Emails)</Label>
                                        <Input 
                                            value={kycFormData.coFounderEmails?.join(", ") || ""} 
                                            onChange={(e) => setKycFormData({...kycFormData, coFounderEmails: e.target.value.split(",").map(em => em.trim())})}
                                            placeholder="founder2@entity.com, founder3@entity.com" 
                                            className="h-12 border-slate-100 bg-white rounded-xl px-4 text-sm font-bold" 
                                        />
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest px-1 italic">Separate multiple emails with commas.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 pt-8">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[5px] italic">02. Capital Infrastructure</h4>
                                        <div className="h-px flex-1 bg-slate-50" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                         <div className="space-y-2 opacity-60">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Desk Classification</Label>
                                            <Input value={user.investorType || ''} disabled className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold" />
                                        </div>
                                         <div className="space-y-2 opacity-60">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Official LinkedIn / Portal</Label>
                                            <Input value={user.website || ''} disabled className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Institutional Ticket Size (Range)</Label>
                                            <Input 
                                                value={kycFormData.investmentRange} 
                                                onChange={(e) => setKycFormData({...kycFormData, investmentRange: e.target.value})}
                                                placeholder="e.g. $10K - $100K" 
                                                className="h-12 border-slate-100 bg-white rounded-xl px-4 text-sm font-bold" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Historical Deployments (Optional)</Label>
                                        <textarea 
                                             value={kycFormData.pastInvestments} 
                                             onChange={(e) => setKycFormData({...kycFormData, pastInvestments: e.target.value})}
                                             className="w-full min-h-[120px] p-5 bg-white border border-slate-100 rounded-[24px] text-sm font-medium focus:outline-none italic"
                                             placeholder="List key portfolio exits or strategic deployments..."
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50">
                                <div className="flex items-center gap-3 text-amber-500 max-w-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <p className="text-[10px] font-bold italic opacity-80 leading-relaxed uppercase">
                                        Submitting this form locks your institutional data for manual audit. Ensure all identification tracks are accurate.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleKYCSubmit}
                                    disabled={isLoading}
                                    className="h-16 px-12 bg-slate-900 hover:bg-black text-white rounded-[24px] font-black uppercase text-xs tracking-[5px] italic shadow-2xl shadow-slate-200 transition-all hover-lift"
                                >
                                    {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-3" />}
                                    Authorize Verification
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    const renderMatchmaking = () => (
        <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white border-2">
            <CardHeader className="p-10 border-b border-slate-50">
                <CardTitle className="text-xl font-black text-slate-900 italic tracking-tight">{isStartup ? "Fundraising Logic" : "Capital Parameters"}</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400 mt-1">Configure your financial bounds for algorithmic matchmaking.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{isStartup ? "Target Funding Ask" : "Portfolio Ticket Size"}</Label>
                        <div className="relative">
                            <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                            <Input 
                                value={user.funding || ''} 
                                onChange={(e) => setUser({ ...user, funding: e.target.value })} 
                                placeholder={isStartup ? "e.g. $1M Seed" : "e.g. $50K - $500K"} 
                                className="h-14 pl-12 border-slate-100 bg-slate-50/30 rounded-[20px] text-lg font-black italic text-indigo-600 shadow-inner" 
                            />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center italic mt-2">
                           {isStartup ? "This value determines which investors see your pitch." : "This value filters startups reaching your desk."}
                        </p>
                    </div>

                    {isInvestor && (
                         <div className="space-y-1.5 pt-4">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Investor Classification</Label>
                            <select 
                                value={user.investorType || 'Individual'}
                                onChange={(e) => setUser({ ...user, investorType: e.target.value })}
                                className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="Individual">Individual Angel</option>
                                <option value="Firm">VC / Private Firm</option>
                                <option value="Financial Agency">Financial Agency</option>
                                <option value="Angel">Angel Network</option>
                            </select>
                        </div>
                    )}
                </div>
            </CardContent>
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="h-14 px-10 bg-slate-900 text-white rounded-[20px] font-black uppercase text-xs tracking-[4px] shadow-2xl shadow-slate-200 transition-all hover-lift">
                    Save Parameters
                </Button>
            </div>
        </Card>
    );

    const renderNetwork = () => (
         <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white border-2">
            <CardHeader className="p-10 border-b border-slate-50">
                <CardTitle className="text-xl font-black text-slate-900 italic tracking-tight">{isStartup ? "Founding Network" : "Deployment History"}</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400 mt-1">Manage institutional links and verified connections.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
                {isStartup ? (
                    <div className="space-y-8">
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Integrate Co-Founder</Label>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <Input disabled placeholder="founder@acme.ai" className="h-12 pl-12 border-slate-50 bg-slate-50/50 rounded-xl text-sm font-bold opacity-60" />
                                </div>
                                <Button disabled className="h-12 px-8 bg-slate-100 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest">Connect</Button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px] px-1 italic">Active Founders</p>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl font-black italic">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 uppercase italic leading-none">{user.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Primary Originator</p>
                                    </div>
                                 </div>
                                 <Badge className="bg-indigo-600 text-white font-black text-[9px] uppercase tracking-[3px] h-6 px-3 italic">HODL</Badge>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                        <div className="h-20 w-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200">
                            <Briefcase size={40} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-900 uppercase italic italic">Portfolio Locked</h4>
                            <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs mx-auto">Verified investment history will appear here once your portfolio audit is complete.</p>
                        </div>
                        <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest border-2">Request Audit</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    function renderContent() {
        switch (activeTab) {
            case "profile":
                return renderUnifiedProfile();
            case "verification":
                return renderVerification();
            case "matchmaking":
                return renderMatchmaking();
            case "network":
                return renderNetwork();
            case "security":
                return (
                    <Card className="border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white border-2">
                        <CardHeader className="p-10 border-b border-slate-50">
                            <CardTitle className="text-xl font-black text-slate-900 italic tracking-tight">Institutional Shield</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400 mt-1">Manage credentials and access permissions.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Current Password</Label>
                                    <Input type="password" placeholder="••••••••" className="h-12 border-slate-100 bg-slate-50/30 rounded-xl px-4 text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Authorized New Password</Label>
                                    <Input type="password" placeholder="Min. 8 Chars" className="h-12 border-slate-100 bg-slate-50/30 rounded-xl px-4 text-sm font-bold" />
                                </div>
                            </div>
                            <Button className="h-14 w-full md:w-auto px-12 bg-slate-900 text-white rounded-[20px] font-black uppercase text-xs tracking-[4px] hover-lift">
                                Revitalize Credentials
                            </Button>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 px-4 space-y-12">
            {/* Unified Top Navigation */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-6">
                <div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                        <Activity size={12} className="text-indigo-600 animate-pulse" />
                        Platform Authority
                        <ChevronRight size={10} className="text-slate-200" />
                        <span className="text-slate-900 uppercase">{activeTab}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                        Manage {isStartup ? "Startup" : "Investor"} Space.
                    </h1>
                </div>
                
                <div className="hidden md:flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Verified Presence</p>
                        <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">KYC Status: {kycStatus === 'verified' ? 'Active' : 'Pending/Not Set'}</p>
                    </div>
                    <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-50">
                        <ShieldCheck size={28} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
                     {/* Role-Agnostic Sidebar Menu */}
                    <div className="bg-white border-2 border-slate-100 rounded-[32px] p-3 shadow-2xl shadow-slate-100 space-y-2">
                        {menuItems.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex w-full items-center gap-4 px-6 py-4 rounded-2xl text-[12px] font-black transition-all uppercase italic tracking-tighter ${
                                    activeTab === item.id
                                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-[1.05] z-10"
                                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                <item.icon size={16} className={activeTab === item.id ? "text-indigo-400" : "text-slate-300"} />
                                {item.label}
                                {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-40" />}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 rounded-[32px] bg-indigo-600 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
                         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                             {isStartup ? <PieChart size={100} /> : <TrendingUp size={100} />}
                         </div>
                         <h4 className="text-[11px] font-black uppercase tracking-[5px] text-indigo-200 mb-3">System Logic</h4>
                         <p className="text-xs font-bold leading-relaxed italic opacity-90">
                             Your institutional data is locked into the global matching engine. Changes sync instantly across the network.
                         </p>
                    </div>
                </div>

                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
