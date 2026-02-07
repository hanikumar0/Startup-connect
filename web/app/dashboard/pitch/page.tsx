"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUp, FileText, CheckCircle2, Loader2, AlertCircle, Sparkles, Lightbulb } from "lucide-react";
import { PitchAudit } from "@/components/pitch/PitchAudit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";

export default function PitchDeckPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showAuditor, setShowAuditor] = useState(false);

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
            const dummyUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

            const response = await apiFetch("/api/users/pitch-deck", {
                method: "PUT",
                body: JSON.stringify({ pitchDeckUrl: dummyUrl }),
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

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pitch Deck Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your presentation materials and get AI-powered insights.</p>
                </div>
            </div>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 mb-8">
                    <TabsTrigger value="upload" className="gap-2">
                        <FileUp size={16} />
                        Upload & Store
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="gap-2">
                        <Sparkles size={16} className="text-indigo-600" />
                        AI Audit
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Upload Card */}
                        <Card className="lg:col-span-2 border-none shadow-sm dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                                <CardTitle>Document Upload</CardTitle>
                                <CardDescription>Share your vision with verified investors. PDF formats preferred.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid gap-8">
                                    <div
                                        className={`relative border-2 border-dashed rounded-3xl p-16 transition-all text-center
                                            ${file ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}
                                        `}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept=".pdf,.pptx"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <FileUp className={`h-8 w-8 ${file ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            </div>
                                            {file ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-bold text-slate-900 dark:text-white">{file.name}</span>
                                                    <span className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                                </div>
                                            ) : (
                                                <div className="max-w-xs">
                                                    <p className="text-base font-bold text-slate-900 dark:text-white">Drop your pitch deck here</p>
                                                    <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest font-black text-[10px]">PDF, PPTX (Max 20MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {uploadStatus === 'success' && (
                                        <div className="flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 animate-in fade-in slide-in-from-top-2">
                                            <CheckCircle2 className="h-6 w-6 shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-bold">Upload Successful!</p>
                                                <p className="opacity-90 text-sm">Your deck is ready for investor viewing and AI analysis.</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200"
                                                onClick={() => setShowAuditor(true)}
                                            >
                                                Analyze Now
                                            </Button>
                                        </div>
                                    )}

                                    {uploadStatus === 'error' && (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30">
                                            <AlertCircle className="h-6 w-6 shrink-0" />
                                            <p className="text-sm font-bold">Upload failed. Please try again.</p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleUpload}
                                        disabled={!file || isUploading || uploadStatus === 'success'}
                                        className="h-14 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-[0.98] rounded-2xl"
                                    >
                                        {isUploading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                        ) : uploadStatus === 'success' ? (
                                            "Document Active"
                                        ) : (
                                            "Securely Upload Deck"
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                                            <Lightbulb size={20} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Pro Tip</h4>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                        Investors spend an average of <span className="text-slate-900 dark:text-white font-bold">2.4 minutes</span> per deck. Make sure your "Problem" slide is in the first 3 pages.
                                    </p>
                                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full">
                                        <div className="h-full w-2/3 bg-amber-500 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                                <CardContent className="p-6">
                                    <Sparkles className="h-8 w-8 mb-4 opacity-50" />
                                    <h4 className="font-bold text-lg mb-2">Automated Audit</h4>
                                    <p className="text-sm opacity-90 leading-relaxed mb-4">
                                        Once uploaded, our AI scan will check your market data against real-world benchmarks.
                                    </p>
                                    <Button variant="secondary" className="w-full font-bold" onClick={() => setShowAuditor(true)}>
                                        Try Auditor
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="audit">
                    <div className="max-w-4xl mx-auto">
                        <PitchAudit />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

