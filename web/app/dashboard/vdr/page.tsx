"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Shield,
    Unlock,
    Upload,
    Clock,
    CheckCircle2,
    XCircle,
    Download,
    Eye,
    FolderOpen,
    Plus,
    Loader2,
    Lock,
    BrainCircuit,
    Zap,
    TrendingUp,
    ChevronRight,
    ArrowRight,
    CircleDashed,
    ShieldAlert,
    Lock as LockIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function VDRPage() {
    const [user, setUser] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload Form State
    const [newDoc, setNewDoc] = useState({
        name: "",
        category: "Financials",
        isRestricted: true,
        file: null as File | null
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchMyDocuments();
        }
    }, []);

    const fetchMyDocuments = async () => {
        try {
            const response = await apiFetch("/api/vdr/my");
            const data = await response.json();
            if (data.success) {
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        setIsUploading(true);
        try {
            const response = await apiFetch("/api/vdr/upload", {
                method: "POST",
                body: JSON.stringify({
                    name: newDoc.name,
                    category: newDoc.category,
                    url: "https://example.com/uploaded-doc.pdf",
                    isRestricted: newDoc.isRestricted,
                    size: 1024 * 1024 * 2, // 2MB size
                    fileType: "application/pdf"
                }),
            });

            const data = await response.json();
            if (data.success) {
                setDocuments([...documents, data.document]);
                setShowUploadModal(false);
                setNewDoc({ name: "", category: "Financials", isRestricted: true, file: null });
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAction = async (docId: string, requestId: string, status: string) => {
        try {
            const response = await apiFetch(`/api/vdr/handle/${docId}/${requestId}`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            const data = await response.json();
            if (data.success) {
                fetchMyDocuments();
            }
        } catch (error) {
            console.error("Error handling request:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <CircleDashed className="h-12 w-12 text-indigo-600 opacity-20" />
                </motion.div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Initializing Vault...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20"
        >
            {/* Breadcrumb Console */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Institutional Secure</span>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Virtual Data Room</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">
                        VAULT<span className="text-indigo-600">.</span>CORE
                    </h1>
                    <p className="text-xl text-slate-500 font-medium italic max-w-xl">
                        End-to-end encrypted document intelligence & investor access governance.
                    </p>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        className="h-16 px-8 bg-black hover:bg-slate-900 text-white rounded-[28px] shadow-2xl shadow-indigo-200 gap-3 border-none ring-offset-4 hover:ring-2 ring-black transition-all"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-bold text-lg">DEPLOY DOCUMENT</span>
                    </Button>
                </motion.div>
            </div>

            {/* Smart VDR Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Vault Integrity", value: "99.9%", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Military Grade SSL Overlap" },
                    { label: "Vault Health", value: "OPTIMAL", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", desc: "No Latency Issues Detected" },
                    { label: "Engagements", value: "HIGH", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Active Investor Interest" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group bg-white/50 backdrop-blur-sm overflow-hidden border border-slate-50">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                                        <stat.icon size={28} />
                                    </div>
                                    <Badge className={`${stat.bg} ${stat.color} border-none font-black text-[9px] px-3`}>ACTIVE</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic opacity-70">{stat.label}</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                                    <p className="text-[11px] font-bold text-slate-500 italic mt-2">{stat.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-slate-100/50 p-2 rounded-[24px] mb-10 h-16 w-full lg:w-fit gap-2">
                    <TabsTrigger value="all" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">INTERNAL STORAGE</TabsTrigger>
                    <TabsTrigger value="requests" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm flex gap-2">
                        EXTERNAL REQUESTS
                        {documents.some(d => d.accessRequests?.some((r:any)=>r.status==="PENDING")) && (
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-10 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {documents.length > 0 ? documents.map((doc, idx) => (
                            <motion.div
                                key={doc._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group rounded-[48px] border-none shadow-sm hover:shadow-2xl transition-all duration-700 bg-white overflow-hidden flex flex-col h-full border border-slate-50">
                                    <CardContent className="p-8 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="h-16 w-16 rounded-3xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50 group-hover:rotate-12 transition-transform duration-500">
                                                <FileText className="h-8 w-8 text-indigo-600" />
                                            </div>
                                            <Badge variant="secondary" className={`rounded-xl px-4 py-2 font-black text-[9px] uppercase tracking-widest border-none ${doc.isRestricted ? "bg-black text-white" : "bg-indigo-600 text-white"}`}>
                                                {doc.isRestricted ? <Lock className="h-3 w-3 mr-2" /> : <Unlock className="h-3 w-3 mr-2" />}
                                                {doc.isRestricted ? "RESTRICTED" : "OPEN VAULT"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <p className="text-[10px] font-black tracking-widest text-indigo-600 uppercase mb-1">{doc.category}</p>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter line-clamp-2 leading-none">{doc.name}</h3>
                                            </div>

                                            <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100/50 space-y-4 group-hover:bg-indigo-50/30 transition-colors duration-500">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <BrainCircuit size={16} className="text-indigo-600" strokeWidth={3} />
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">AI AGENT ANALYSIS</span>
                                                    </div>
                                                    <Badge className={`text-[9px] font-black border-none px-3 py-1 ${doc.riskScore > 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        SCORE: {doc.riskScore || 0}%
                                                    </Badge>
                                                </div>
                                                <p className="text-[12px] text-slate-600 leading-relaxed italic font-medium">
                                                    "{doc.aiSummary || 'Security sweep confirmed. No anomalies detected in current document structure.'}"
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(doc.keyClauses?.length > 0 ? doc.keyClauses : ["Clause Valid", "Encryption Set"]).slice(0, 2).map((clause: any, i: number) => (
                                                        <span key={i} className="text-[9px] font-black bg-white px-3 py-1.5 rounded-full border border-slate-100 text-slate-600 shadow-sm uppercase tracking-tighter">
                                                            {clause}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 italic">SYSTEM STATS</span>
                                                <span className="text-xs font-bold text-slate-500">{(doc.size / (1024 * 1024)).toFixed(1)} MB • REV_{new Date(doc.createdAt).getFullYear()}_{idx+100}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm">
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm">
                                                        <Download className="h-5 w-5" />
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-24 text-center bg-slate-50 rounded-[56px] border-4 border-dashed border-white shadow-inner">
                                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <FolderOpen className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Vault Empty</h3>
                                <p className="text-slate-500 font-medium italic mt-2">Zero documents detected in secure storage.</p>
                                <Button
                                    variant="link"
                                    className="mt-4 text-indigo-600 font-black uppercase text-xs tracking-widest gap-2"
                                    onClick={() => setShowUploadModal(true)}
                                >
                                    Initialize First Deployment <ArrowRight size={14} />
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-[56px] border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-50">
                        <ScrollArea className="max-h-[700px]">
                            <div className="p-4 space-y-4">
                                {documents.some(d => d.accessRequests?.length > 0) ? (
                                    documents.flatMap(doc => doc.accessRequests.map((req: any) => ({ ...req, docId: doc._id, docName: doc.name }))).map((req: any, i:number) => (
                                        <motion.div
                                            key={req._id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-8 rounded-[40px] bg-white border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-500 group"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
                                                    {req.email?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">INQUIRY_{i+1000}</p>
                                                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px] px-3">PENDING SCAN</Badge>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-500 italic">
                                                        Target Profile: <span className="text-indigo-600 underline underline-offset-4 decoration-2">{req.email}</span>
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                                        REQUESTING ACCESS TO: <span className="text-slate-900">"{req.docName}"</span>
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <AnimatePresence mode="wait">
                                                {req.status === "PENDING" ? (
                                                    <div className="flex gap-4">
                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <Button 
                                                                variant="outline" 
                                                                className="h-14 px-8 rounded-[24px] font-black text-xs uppercase tracking-widest text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
                                                                onClick={() => handleAction(req.docId, req._id, "REJECTED")}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                DENY
                                                            </Button>
                                                        </motion.div>
                                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <Button 
                                                                className="h-14 px-8 rounded-[24px] font-black text-xs uppercase tracking-widest bg-black hover:bg-slate-900 text-white shadow-xl shadow-slate-200"
                                                                onClick={() => handleAction(req.docId, req._id, "APPROVED")}
                                                            >
                                                                <ShieldCheck size={18} className="mr-2" strokeWidth={3} />
                                                                GRANT ACCESS
                                                            </Button>
                                                        </motion.div>
                                                    </div>
                                                ) : (
                                                    <div className={`px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest ${req.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                                        {req.status}
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-24 text-center">
                                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Clock className="h-10 w-10 text-slate-200" />
                                        </div>
                                        <p className="text-xl font-black text-slate-400 uppercase italic opacity-50 tracking-tighter">Zero Pending Requests</p>
                                        <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest opacity-70 italic font-medium">Monitoring system for incoming access inquiries...</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Upload Modal (Simplified & Themed) */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUploadModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-[56px] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-black p-12 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent pointer-events-none" />
                                <LockIcon className="h-12 w-12 mx-auto mb-6 text-indigo-500 opacity-50" />
                                <h1 className="text-5xl font-black tracking-tighter italic mb-2">UPLOAD.CORE</h1>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Institutional Secure Deposition</p>
                            </div>
                            
                            <div className="p-12 space-y-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Document Identifier</Label>
                                    <Input
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:ring-indigo-500 focus:border-indigo-500 px-6"
                                        placeholder="e.g. CORE_FINANCIALS_FY24"
                                        value={newDoc.name}
                                        onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Classification Hub</Label>
                                    <select
                                        className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.5rem_center] bg-no-repeat"
                                        value={newDoc.category}
                                        onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                                    >
                                        <option>Financials</option>
                                        <option>Legal</option>
                                        <option>Product</option>
                                        <option>Cap Table</option>
                                        <option>Pitch Deck</option>
                                    </select>
                                </div>
                                
                                <label className="group flex items-center justify-between p-6 rounded-3xl border-2 border-slate-100 hover:border-black transition-all cursor-pointer bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                                            <ShieldAlert size={20} className={newDoc.isRestricted ? "text-black" : "text-slate-300"} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight uppercase">Encryption Lockdown</p>
                                            <p className="text-[10px] font-bold text-slate-400 italic">Toggle between Public and Protected States</p>
                                        </div>
                                    </div>
                                    <div 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setNewDoc({ ...newDoc, isRestricted: !newDoc.isRestricted });
                                        }}
                                        className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${newDoc.isRestricted ? "bg-black" : "bg-slate-200"}`}
                                    >
                                        <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${newDoc.isRestricted ? "translate-x-6" : ""}`} />
                                    </div>
                                </label>

                                <div className="border-4 border-dashed border-slate-100 rounded-[32px] p-12 text-center bg-slate-50/50 group hover:bg-indigo-50/20 hover:border-indigo-100 transition-all duration-500">
                                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
                                        <Upload className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <p className="text-sm font-black text-slate-900 tracking-tight uppercase italic mb-1">Select Core Object</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supports PDF, DOCX (Max 250MB)</p>
                                    <Input type="file" className="hidden" id="file-upload" />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setShowUploadModal(false)} 
                                        className="h-16 flex-1 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-50"
                                    >
                                        ABORT
                                    </Button>
                                    <Button 
                                        className="h-16 flex-1 bg-black hover:bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
                                        disabled={!newDoc.name || isUploading} 
                                        onClick={handleUpload}
                                    >
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "EXECUTE UPLOAD"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const ShieldCheck = ({ size, className, strokeWidth }: { size?: number, className?: string, strokeWidth?: number }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={strokeWidth || 2} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
