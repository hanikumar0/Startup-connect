"use client";

import { useState } from "react";
import { 
    User, 
    ShieldCheck, 
    Lock, 
    Bell, 
    ChevronRight,
    Search,
    Mail,
    Phone,
    MapPin,
    Shield,
    Smartphone,
    Eye,
    EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TabItem = ({ id, label, icon: Icon, active, onClick }: { 
    id: string; 
    label: string; 
    icon: any; 
    active: boolean; 
    onClick: () => void; 
}) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center justify-between px-4 py-3 rounded-xl transition-all group ${
            active 
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`}
    >
        <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                active ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
            }`}>
                <Icon size={16} />
            </div>
            <span className="text-[13px] font-bold tracking-tight">{label}</span>
        </div>
        {active && <ChevronRight size={14} className="opacity-50" />}
    </button>
);

const ContentHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-[12px] text-slate-500 font-medium mt-1">{description}</p>
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4 pt-4 first:pt-0">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{title}</h3>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            {children}
        </div>
    </div>
);

const InputField = ({ label, placeholder, value, icon: Icon, type = "text" }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 px-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600">
                <Icon size={14} />
            </div>
            <input 
                readOnly
                type={type}
                placeholder={placeholder}
                value={value}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl h-10 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
        </div>
    </div>
);

export default function SettingsPremiumPage() {
    const [activeTab, setActiveTab] = useState("profile");

    const menuItems = [
        { id: "profile", label: "Profile", icon: User },
        { id: "verification", label: "Verification", icon: ShieldCheck },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <div className="space-y-10">
                        <ContentHeader 
                            title="Profile Settings" 
                            description="Update your personal details and how others see you on the platform."
                        />
                        <div className="flex items-center gap-6 mb-8 group">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-black border-2 border-dashed border-indigo-200 group-hover:bg-indigo-100 transition-colors">
                                    H
                                </div>
                                <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors">
                                    <Smartphone size={14} />
                                </button>
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 leading-tight">Hanikumar</h4>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Free Tier Account</p>
                            </div>
                        </div>

                        <Section title="Basic Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InputField label="Full Name" placeholder="Your name" value="Hanikumar" icon={User} />
                                <InputField label="Email Address" placeholder="Email" value="hanikumar0@gmail.com" icon={Mail} />
                                <InputField label="Phone Number" placeholder="Phone" value="+91 98765 43210" icon={Phone} />
                                <InputField label="Current Location" placeholder="Location" value="Mumbai, India" icon={MapPin} />
                            </div>
                        </Section>
                    </div>
                );
            case "verification":
                return (
                    <div className="space-y-10">
                        <ContentHeader 
                            title="Identity Verification" 
                            description="Verify your identity to unlock higher transaction limits and premium features."
                        />
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-5">
                                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-900">Current Status: Basic</h4>
                                    <p className="text-[11px] text-emerald-700/70 font-medium">Verify your PAN/Aadhaar to upgrade to Institutional tier.</p>
                                </div>
                            </div>
                            
                            <Section title="Document Submission">
                                <div className="space-y-4">
                                    <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl hover:border-indigo-400 transition-colors cursor-pointer group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <Smartphone size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-900">Government ID</p>
                                                    <p className="text-[11px] text-slate-400">Upload PAN or Aadhaar card</p>
                                                </div>
                                            </div>
                                            <button className="h-8 px-4 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Upload</button>
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        </div>
                    </div>
                );
            case "security":
                return (
                    <div className="space-y-10">
                        <ContentHeader 
                            title="Security & Access" 
                            description="Manage your password, two-factor authentication, and active sessions."
                        />
                        <div className="space-y-6">
                            <Section title="Change Password">
                                <div className="grid grid-cols-1 gap-4 max-w-md">
                                    <InputField label="Current Password" type="password" icon={Lock} />
                                    <InputField label="New Password" type="password" icon={Shield} />
                                    <button className="h-10 w-full bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest mt-2 hover:bg-slate-800 transition-all">Update Password</button>
                                </div>
                            </Section>

                            <Section title="Advanced Protection">
                                <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Smartphone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                                            <p className="text-[11px] text-slate-400">Add an extra layer of security to your account</p>
                                        </div>
                                    </div>
                                    <button className="h-7 w-12 bg-slate-200 rounded-full relative transition-colors shadow-inner">
                                        <div className="absolute top-1 left-1 h-5 w-5 bg-white rounded-full shadow-sm" />
                                    </button>
                                </div>
                            </Section>
                        </div>
                    </div>
                );
            case "notifications":
                return (
                    <div className="space-y-10">
                        <ContentHeader 
                            title="Notification Preferences" 
                            description="Choose what alerts you want to receive and where they are sent."
                        />
                        <Section title="Communication Channels">
                            <div className="space-y-4">
                                {[
                                    { title: "Push Notifications", desc: "Real-time alerts in your browser" },
                                    { title: "Email Alerts", desc: "Bulletins and account activity via email" },
                                    { title: "Marketing Updates", desc: "News, offers and product updates" }
                                ].map((n, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-[13px] font-bold text-slate-900">{n.title}</p>
                                            <p className="text-[11px] text-slate-400">{n.desc}</p>
                                        </div>
                                        <button className={`h-7 w-12 rounded-full relative transition-all ${i < 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                            <div className={`absolute top-1 h-5 w-5 bg-white rounded-full shadow-sm transition-all ${i < 2 ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">
                        <Shield size={12} />
                        Account Center
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <button className="h-10 w-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                        <Search size={18} />
                    </button>
                    <button className="h-10 px-5 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all active:scale-95">
                        Global Save
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Sidebar Navigation */}
                <div className="md:col-span-3 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 border-b border-slate-50 mb-2">
                            Menu Options
                        </div>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <TabItem 
                                    key={item.id}
                                    id={item.id}
                                    label={item.label}
                                    icon={item.icon}
                                    active={activeTab === item.id}
                                    onClick={() => setActiveTab(item.id)}
                                />
                            ))}
                        </nav>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">Priority Support</h4>
                                <p className="text-[11px] text-white/50 mt-1 leading-relaxed">Upgrade to Institutional plan for 24/7 dedicated account manager.</p>
                            </div>
                            <button className="mt-2 w-full h-9 bg-white text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                                View Plans
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
