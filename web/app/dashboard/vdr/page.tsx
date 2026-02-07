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
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api";

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
            // In a real app, you'd upload to S3 first. 
            // For this MVP, we'll simulate the URL generation.
            const response = await apiFetch("/api/vdr/upload", {
                method: "POST",
                body: JSON.stringify({
                    name: newDoc.name,
                    category: newDoc.category,
                    url: "https://example.com/mock-doc.pdf", // Mock URL
                    isRestricted: newDoc.isRestricted,
                    size: 1024 * 1024 * 2, // 2MB mock
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
                fetchMyDocuments(); // Refresh to update status
            }
        } catch (error) {
            console.error("Error handling request:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Virtual Data Room</h1>
                    <p className="text-slate-500 mt-1">Manage your secure documents and investor access requests.</p>
                </div>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2"
                    onClick={() => setShowUploadModal(true)}
                >
                    <Plus className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            {/* Smart VDR Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Data Integrity", value: "98%", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Document Health", value: "Optimal", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Investor Engagement", value: "High", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{stat.label}</p>
                                    <p className="text-xl font-black text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-slate-100 p-1 mb-6">
                    <TabsTrigger value="all">All Documents</TabsTrigger>
                    <TabsTrigger value="requests">Access Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.length > 0 ? documents.map((doc) => (
                            <Card key={doc._id} className="group border-none shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                            <FileText className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <Badge variant="secondary" className={doc.isRestricted ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}>
                                            {doc.isRestricted ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                                            {doc.isRestricted ? "Restricted" : "Public"}
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1">{doc.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{doc.category}</p>

                                    <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BrainCircuit size={14} className="text-indigo-600" />
                                                <span className="text-[10px] font-bold text-slate-600 uppercase">AI Summary</span>
                                            </div>
                                            <Badge className={`text-[9px] ${doc.riskScore > 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                Risk: {doc.riskScore || 0}%
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed italic line-clamp-2">
                                            "{doc.aiSummary || 'Analysis complete. Document is robust.'}"
                                        </p>
                                        {doc.keyClauses && doc.keyClauses.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {doc.keyClauses.slice(0, 2).map((clause: any, idx: number) => (
                                                    <span key={idx} className="text-[9px] bg-white px-2 py-0.5 rounded border border-indigo-100 text-indigo-700">
                                                        {clause}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">{(doc.size / (1024 * 1024)).toFixed(1)} MB • {new Date(doc.createdAt).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FolderOpen className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No documents yet</h3>
                                <p className="text-slate-500">Upload your pitch deck, financials, or legal documents to get started.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="space-y-4">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <ScrollArea className="max-h-[600px]">
                            <div className="divide-y divide-slate-50">
                                {documents.some(d => d.accessRequests?.length > 0) ? (
                                    documents.flatMap(doc => doc.accessRequests.map((req: any) => ({ ...req, docId: doc._id, docName: doc.name }))).map((req: any) => (
                                        <div key={req._id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                    U
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">User Requested Access</p>
                                                    <p className="text-sm text-slate-500">Document: <span className="text-indigo-600 font-medium">{req.docName}</span></p>
                                                </div>
                                            </div>
                                            {req.status === "PENDING" ? (
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="text-red-600 border-red-100 hover:bg-red-50" onClick={() => handleAction(req.docId, req._id, "REJECTED")}>
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Decline
                                                    </Button>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction(req.docId, req._id, "APPROVED")}>
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Grant Access
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Badge className={req.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>
                                                    {req.status}
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <Clock className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500 font-medium">No pending access requests.</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <CardHeader className="bg-indigo-600 text-white p-6">
                            <CardTitle>Upload to VDR</CardTitle>
                            <CardDescription className="text-indigo-100">Add a new document to your secure vault.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Document Name</Label>
                                <Input
                                    placeholder="e.g. FY24 Financial Audit"
                                    value={newDoc.name}
                                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            <div className="flex items-center space-x-2 py-2">
                                <input
                                    type="checkbox"
                                    id="restricted"
                                    className="rounded border-slate-300 text-indigo-600"
                                    checked={newDoc.isRestricted}
                                    onChange={(e) => setNewDoc({ ...newDoc, isRestricted: e.target.checked })}
                                />
                                <Label htmlFor="restricted" className="text-sm font-medium">Restrict access (Request only)</Label>
                            </div>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                                <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-500">Drop your PDF here or click to browse</p>
                                <Input type="file" className="hidden" id="file-upload" />
                            </div>
                        </CardContent>
                        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex gap-3">
                            <Button variant="ghost" onClick={() => setShowUploadModal(false)} className="flex-1">Cancel</Button>
                            <Button className="flex-1 bg-indigo-600" disabled={!newDoc.name || isUploading} onClick={handleUpload}>
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
