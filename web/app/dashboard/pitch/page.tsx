"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    FileUp, 
    FileText, 
    CheckCircle2, 
    Loader2, 
    AlertCircle, 
    Sparkles, 
    Lightbulb,
    ChevronRight,
    ArrowRight,
    CircleDashed,
    ShieldCheck,
    Lock
} from "lucide-react";
import { PitchAudit } from "@/components/pitch/PitchAudit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function PitchDeckPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showAuditor, setShowAuditor] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <CircleDashed className="h-12 w-12 text-indigo-600 opacity-20" />
                </motion.div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Initializing Terminal...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20 px-1"
        >
            {/* Breadcrumb Console */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Strategic Assets</span>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Pitch Deck Intelligence</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">
                        PITCH<span className="text-indigo-600">.</span>ENGINE
                    </h1>
                    <p className="text-xl text-slate-500 font-medium italic max-w-xl">
                        High-velocity capital presentation & AI-driven narrative optimization.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="bg-slate-100/50 p-2 rounded-[24px] mb-10 h-16 w-full lg:w-fit gap-2">
                    <TabsTrigger value="upload" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">DEPOT TERMINAL</TabsTrigger>
                    <TabsTrigger value="audit" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm flex gap-2">
                        <Sparkles size={14} className="text-indigo-600" strokeWidth={3} />
                        AI AUDIT PROTOCOL
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Upload Card */}
                        <Card className="lg:col-span-2 rounded-[56px] border-none shadow-sm hover:shadow-2xl transition-all duration-700 bg-white overflow-hidden border border-slate-50">
                            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShieldCheck className="text-indigo-600" size={18} strokeWidth={3} />
                                    <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Secure Deposition Hub</span>
                                </div>
                                <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">OBJECT_UPLOAD</CardTitle>
                                <CardDescription className="text-sm text-slate-500 font-medium italic mt-2">Deploy your institutional narrative to verified ecosystem participants.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10">
                                <div className="grid gap-10">
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className={`relative border-4 border-dashed rounded-[48px] p-20 transition-all text-center group
                                            ${file ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'}
                                        `}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept=".pdf,.pptx"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center shadow-lg shadow-slate-100 group-hover:rotate-6 transition-transform duration-500">
                                                <FileUp className={`h-10 w-10 ${file ? 'text-indigo-600' : 'text-slate-300'}`} strokeWidth={2.5} />
                                            </div>
                                            {file ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{file.name}</span>
                                                    <span className="text-xs font-black text-slate-400 mt-2 uppercase tracking-widest italic">{(file.size / (1024 * 1024)).toFixed(2)} MB / ENCRYPTED_PDF</span>
                                                </div>
                                            ) : (
                                                <div className="max-w-xs">
                                                    <p className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Deposit Narrative Object</p>
                                                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest opacity-70">Supports PDF, PPTX (MAX_LOAD: 20MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                    <AnimatePresence mode="wait">
                                        {uploadStatus === 'success' && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col md:flex-row items-center gap-6 p-8 bg-black rounded-[32px] text-white border-none shadow-2xl shadow-indigo-100"
                                            >
                                                <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                                                    <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={3} />
                                                </div>
                                                <div className="flex-1 text-center md:text-left">
                                                    <p className="text-xl font-black tracking-tighter uppercase italic leading-none">PROTOCOL_SUCCESS</p>
                                                    <p className="text-xs font-bold text-slate-400 italic mt-1 uppercase tracking-widest opacity-80">Object is now available for institutional audit.</p>
                                                </div>
                                                <Button
                                                    className="h-12 px-8 bg-white hover:bg-slate-100 text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                                                    onClick={() => setShowAuditor(true)}
                                                >
                                                    EXECUTE AUDIT
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {uploadStatus === 'error' && (
                                        <div className="flex items-center gap-4 p-6 bg-red-50 rounded-2xl text-red-600 border border-red-100">
                                            <AlertCircle className="h-6 w-6 shrink-0" strokeWidth={3} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">PROTOCOL_FAILURE: System could not finalize deposition.</p>
                                        </div>
                                    )}

                                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!file || isUploading || uploadStatus === 'success'}
                                            className="h-20 w-full bg-black hover:bg-slate-900 text-white font-black text-lg uppercase tracking-widest transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98] rounded-[32px] gap-3"
                                        >
                                            {isUploading ? (
                                                <><Loader2 className="h-6 w-6 animate-spin" /> EXECUTING...</>
                                            ) : uploadStatus === 'success' ? (
                                                "SYSTEM_ACTIVE"
                                            ) : (
                                                <>DEPLOY NARRATIVE OBJECT <ArrowRight size={20} strokeWidth={3} /></>
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips Sidebar */}
                        <div className="space-y-8">
                            <Card className="rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group bg-white border border-slate-50 overflow-hidden">
                                <CardContent className="p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                                            <Lightbulb size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic leading-none">STRATEGIC PRO-TIP</span>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-none mt-1 uppercase italic">VELOCITY_METRIC</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium italic leading-relaxed mb-6">
                                        Investors spend approx. <span className="text-slate-900 font-black">2.4m</span> per object. Prioritize the <span className="text-indigo-600 font-black underline underline-offset-4 decoration-2">problem vector</span> within the first 3 slides for maximum retention.
                                    </p>
                                    <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "66%" }}
                                            className="h-full bg-amber-500" 
                                        />
                                    </div>
                                    <div className="flex justify-between mt-3 px-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase italic">RETENTION_LOW</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase italic text-right">OPTIMAL_ZONE</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[40px] border-none shadow-2xl shadow-indigo-100 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles size={80} strokeWidth={3} />
                                </div>
                                <CardContent className="p-10 relative z-10">
                                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                                        <Sparkles className="h-8 w-8 text-white" strokeWidth={3} />
                                    </div>
                                    <h4 className="text-3xl font-black tracking-tighter mb-4 uppercase italic leading-none">AUTO_AUDIT AI</h4>
                                    <p className="text-sm opacity-90 font-medium italic leading-relaxed mb-8">
                                        Initialize state-of-the-art market benchmarking. Our AI scan validates narrative authenticity against global venture signals.
                                    </p>
                                    <Button 
                                        variant="secondary" 
                                        className="h-14 w-full bg-white hover:bg-slate-50 text-indigo-900 font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl shadow-black/10" 
                                        onClick={() => {
                                            const tabList = document.querySelector('[role="tablist"]');
                                            const auditTab = tabList?.querySelector('[value="audit"]') as HTMLButtonElement;
                                            auditTab?.click();
                                        }}
                                    >
                                        ACTIVATE AUDITOR <ChevronRight size={14} strokeWidth={3} className="ml-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="focus-visible:outline-none">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-5xl mx-auto"
                    >
                        <PitchAudit />
                    </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}

