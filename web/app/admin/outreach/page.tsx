"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Mail, 
  BarChart3, 
  Plus, 
  Upload, 
  Send, 
  Linkedin, 
  CheckCircle2, 
  RefreshCcw,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  X
} from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Avatar, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

export default function OutreachDashboard() {
  const [activeTab, setActiveTab] = useState("leads");
  const [leads, setLeads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const { token } = useAuthStore();

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "startup",
    subject: "",
    message: ""
  });

  const [linkedInPayload, setLinkedInPayload] = useState({ name: "", company: "", type: "startup" });
  const [generatedLinkedInMsg, setGeneratedLinkedInMsg] = useState("");
  const [generatingLinkedIn, setGeneratingLinkedIn] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, campaignRes, analyticsRes] = await Promise.all([
        apiFetchJSON(`/api/outreach/leads`),
        apiFetchJSON(`/api/outreach/campaign`),
        apiFetchJSON(`/api/outreach/analytics`)
      ]);

      if (leadsRes.success) setLeads(leadsRes.data || []);
      if (campaignRes.success) setCampaigns(campaignRes.data || []);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching outreach data:", error);
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!file) return toast.error("Please select a CSV file");
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/outreach/leads/import`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchData();
        setFile(null);
      } else {
        toast.error(data.message || "Failed to import leads");
      }
    } catch (error) {
      toast.error("Import failed: Network error");
    } finally {
      setImporting(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.message) {
      return toast.error("Please fill all fields");
    }
    const res = await apiFetchJSON("/api/outreach/campaign/create", {
      method: "POST",
      body: JSON.stringify(newCampaign)
    });
    if (res.success) {
      toast.success("Campaign created");
      setShowCampaignBuilder(false);
      setNewCampaign({ name: "", type: "startup", subject: "", message: "" });
      fetchData();
    }
  };

  const handleSendCampaign = async (id: string) => {
    toast.promise(
        apiFetchJSON("/api/outreach/campaign/send", {
            method: "POST",
            body: JSON.stringify({ campaignId: id })
        }),
        {
            loading: 'Sending campaign emails...',
            success: (data) => {
                if (data.success) {
                    fetchData();
                    return data.message;
                }
                throw new Error(data.message);
            },
            error: (err) => err.message || "Failed to send campaign"
        }
    );
  };

  const handleGenerateLinkedIn = async () => {
    if (!linkedInPayload.name) return toast.error("Name is required");
    setGeneratingLinkedIn(true);
    const res = await apiFetchJSON("/api/outreach/linkedin-message", {
      method: "POST",
      body: JSON.stringify(linkedInPayload)
    });
    if (res.success) {
      setGeneratedLinkedInMsg(res.data);
    }
    setGeneratingLinkedIn(false);
  };

  const filteredLeads = Array.isArray(leads) ? leads.filter((l: any) => 
    (l.name?.toLowerCase().includes(search.toLowerCase()) || 
     l.email?.toLowerCase().includes(search.toLowerCase()) ||
     l.company?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || l.type === filterType)
  ) : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Scale</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Outreach <span className="text-slate-400 not-italic font-medium">/ Console</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={fetchData} className="h-10 border-slate-200 text-slate-300 hover:text-slate-900 aspect-square p-0">
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
           </Button>
           <Button onClick={() => setShowCampaignBuilder(true)} className="h-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 italic shadow-lg shadow-slate-200">
              <Plus size={16} className="mr-2" /> CREATE CAMPAIGN
           </Button>
        </div>
      </div>

      {/* Grid Stats */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Prospect Leads", value: analytics.totalLeads, icon: Users, trend: `${((analytics.contactedLeads / analytics.totalLeads) * 100 || 0).toFixed(1)}%` },
            { label: "Contacted Leads", value: analytics.contactedLeads, icon: Send, trend: "ACTIVE" },
            { label: "Acquired Users", value: analytics.joinedLeads, icon: CheckCircle2, trend: `${analytics.joinRate}%` },
            { label: "Messages Dispatched", value: analytics.totalSent, icon: Mail, trend: "TOTAL" },
          ].map((stat, i) => (
            <Card key={i} className="border border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                    <stat.icon size={20} />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest px-2">{stat.trend}</Badge>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Controls */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-lg h-12 w-full md:w-fit mb-8 border border-slate-200">
          <TabsTrigger value="leads" className="rounded-md px-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all text-[10px] font-black uppercase tracking-widest italic">Leads Registry</TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-md px-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all text-[10px] font-black uppercase tracking-widest italic">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-md px-8 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all text-[10px] font-black uppercase tracking-widest italic">Intelligence</TabsTrigger>
        </TabsList>
        
        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <div className="flex flex-col xl:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3 w-full xl:w-auto">
              <div className="relative flex-1 md:min-w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input 
                  placeholder="SEARCH NODES..." 
                  className="pl-12 h-11 rounded-lg border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest focus-visible:ring-slate-200" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="h-11 px-4 rounded-lg border border-slate-200 bg-white text-[10px] font-black text-slate-600 outline-none hover:border-slate-300 transition-colors uppercase tracking-widest"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">ALL ENTITIES</option>
                <option value="startup">STARTUPS</option>
                <option value="investor">INVESTORS</option>
              </select>
            </div>
            
            <div className="flex gap-3 items-center bg-slate-50 p-1 rounded-lg border border-slate-100">
               <div className="relative group">
                 <input 
                   type="file" 
                   accept=".csv" 
                   className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                   onChange={(e) => setFile(e.target.files?.[0] || null)}
                 />
                 <Button variant="ghost" className="h-9 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white rounded-md">
                    {file ? file.name : "CHOOSE CSV"}
                 </Button>
               </div>
               <Button onClick={handleImport} disabled={importing || !file} className="h-9 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded-md shadow-sm">
                 {importing ? <RefreshCcw size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
                 IMPORT REGISTRY
               </Button>
            </div>
          </div>

          <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="py-4 font-black text-slate-400 uppercase tracking-widest text-[9px] px-8 italic">Prospect Identity</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Sector & Tier</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Status</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Synchronization</TableHead>
                  <TableHead className="text-right px-8 font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead: any, i) => (
                  <TableRow key={lead._id || i} className="hover:bg-slate-50/30 border-slate-50 transition-colors">
                    <TableCell className="py-5 px-8">
                       <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg border border-slate-100">
                             <AvatarFallback className="bg-slate-900 text-white font-black text-[10px] uppercase">{lead.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                             <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">{lead.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold tracking-tight">{lead.email}</p>
                             <div className="text-[8px] font-black text-slate-400 uppercase mt-1 opacity-60">ORG: {lead.company}</div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit rounded-full px-2 py-0 border-slate-200 text-[8px] font-black uppercase tracking-widest bg-slate-50">
                            {lead.type}
                          </Badge>
                          <span className="text-[9px] text-slate-400 font-bold uppercase ml-1">{lead.industry || "General"}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className="rounded-full px-2.5 py-0.5 shadow-none text-[8px] font-black uppercase tracking-widest bg-slate-900 text-white italic">
                         {lead.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 font-black text-[9px] uppercase tracking-tighter">
                      {new Date(lead.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg group transition-all" 
                        onClick={() => {
                          setLinkedInPayload({ name: lead.name, company: lead.company, type: lead.type });
                          setGeneratedLinkedInMsg("");
                          setActiveTab("campaigns");
                        }}>
                         <Linkedin size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" /> 
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Active Campaigns</h3>
                 <Badge className="bg-slate-900 text-white rounded-full px-3 text-[9px] font-black">{campaigns.length} UNITS</Badge>
               </div>
               
               <div className="space-y-4">
                 {campaigns.map((camp: any, i) => (
                    <Card key={camp._id || i} className="group border border-slate-100 shadow-sm overflow-hidden bg-white">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className={`md:w-1.5 ${camp.type === 'investor' ? 'bg-slate-300' : 'bg-slate-900'}`} />
                          <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                 <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight italic">{camp.name}</h4>
                                 <div className="flex items-center gap-3 mt-1.5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{camp.subject}</p>
                                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{camp.type}</p>
                                 </div>
                              </div>
                              <Badge variant="outline" className="rounded-md px-2 py-0 text-[8px] font-black uppercase tracking-widest border-slate-200 text-slate-400 italic">
                                  {camp.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-4 mt-6">
                              <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dispatched</p>
                                <p className="text-lg font-black text-slate-900 italic">{camp.sentCount}</p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                                <p className="text-lg font-black text-slate-500 italic">{Math.max(0, camp.sentCount - (camp.replyCount || 0))}</p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Converted</p>
                                <p className="text-lg font-black text-emerald-600 italic">{camp.replyCount || 0}</p>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex justify-between items-center bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                               <span className="text-[8px] font-black text-slate-400 uppercase italic tracking-widest">DEPLOYED {new Date(camp.createdAt).toDateString()}</span>
                               <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" className="h-7 text-[8px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">WIPE</Button>
                                  <Button 
                                      size="sm" 
                                      className="h-7 bg-slate-900 text-white text-[8px] font-black px-4 shadow-sm uppercase tracking-widest italic rounded-md"
                                      onClick={() => handleSendCampaign(camp._id)}
                                      disabled={camp.status === 'sent'}
                                  >
                                      {camp.status === 'sent' ? "ARCHIVED" : "LAUNCH"}
                                  </Button>
                               </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                 ))}
               </div>
            </div>
            
            <div className="lg:col-span-4 space-y-4">
               <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">AI Generator</h3>
               <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
                 <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Personalizer Module</CardTitle>
                    <CardDescription className="text-[9px] font-bold text-slate-400 uppercase">Hyper-personalize outreach vectors</CardDescription>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Name</p>
                      <Input 
                        placeholder="IDENTITY..." 
                        value={linkedInPayload.name}
                        onChange={(e) => setLinkedInPayload({...linkedInPayload, name: e.target.value})}
                        className="h-10 border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest focus-visible:ring-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</p>
                      <Input 
                        placeholder="ORGANIZATION..." 
                        value={linkedInPayload.company}
                        onChange={(e) => setLinkedInPayload({...linkedInPayload, company: e.target.value})}
                        className="h-10 border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest focus-visible:ring-slate-200"
                      />
                    </div>
                    <Button 
                      className="w-full h-11 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-slate-200"
                      onClick={handleGenerateLinkedIn}
                      disabled={generatingLinkedIn}
                    >
                      {generatingLinkedIn ? <RefreshCcw size={14} className="animate-spin mr-2" /> : <Linkedin size={14} className="mr-2" />}
                      EXECUTE GEN
                    </Button>
                    
                    {generatedLinkedInMsg && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100 relative">
                        <Badge className="absolute -top-2 right-2 bg-white border border-slate-200 text-slate-900 text-[7px] font-black uppercase italic tracking-widest px-2">DRAFT</Badge>
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed italic">"{generatedLinkedInMsg}"</p>
                        <Button 
                          variant="outline"
                          className="mt-4 w-full h-8 border-slate-200 text-[8px] font-black px-4 flex justify-between uppercase hover:bg-white"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLinkedInMsg);
                            toast.success("Copied to clipboard");
                          }}
                        >
                          COPY BUFFER <Send size={10} className="opacity-40" />
                        </Button>
                      </div>
                    )}
                 </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6 space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border border-slate-100 shadow-sm bg-white p-6 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Acquisition Mix</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">Growth Vectors</p>
                    </div>
                    <BarChart3 size={18} className="text-slate-300" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                    <BarChart data={[
                      { name: 'Prospects', value: analytics?.totalLeads || 0 },
                      { name: 'Contacted', value: analytics?.contactedLeads || 0 },
                      { name: 'Joined', value: analytics?.joinedLeads || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32} fill="#0f172a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </Card>
             
             <Card className="border border-slate-100 shadow-sm bg-white p-6 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Growth Velocity</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">Synchronization Trend</p>
                    </div>
                    <TrendingUp size={18} className="text-slate-300" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                    <LineChart data={analytics?.stats || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="leads" 
                        stroke="#0f172a" 
                        strokeWidth={2} 
                        dot={{r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff'}} 
                        activeDot={{r: 6}}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </Card>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <Card className="bg-slate-900 text-white p-8 border-none rounded-xl shadow-lg relative overflow-hidden">
                 <div className="relative z-10 space-y-6">
                    <Badge className="bg-white/10 text-white border-none text-[8px] font-black tracking-widest uppercase italic">Operational Excellence</Badge>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-none">Top 5%<br/>Reach Rate</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-tight max-w-xs leading-relaxed">System identified resonance scores exceed the ecosystem average by 12.4%.</p>
                    <Button variant="outline" className="h-10 border-white/20 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10">
                      SYNDICATE REPORT <ArrowRight size={14} className="ml-2" />
                    </Button>
                 </div>
              </Card>
              
              {analytics && (
                <Card className="p-8 border border-slate-100 shadow-sm bg-white rounded-xl">
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic mb-8">Performance Funnel</h4>
                  <div className="space-y-8">
                    {[
                      { label: "Identification", value: analytics.totalLeads, width: '100%', color: 'bg-slate-900' },
                      { label: "Synchronization", value: analytics.contactedLeads, width: `${(analytics.contactedLeads / analytics.totalLeads) * 100 || 0}%`, color: 'bg-slate-600' },
                      { label: "Conversion", value: analytics.joinedLeads, width: `${(analytics.joinedLeads / analytics.totalLeads) * 100 || 0}%`, color: 'bg-emerald-500' },
                    ].map((step, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest italic">
                          <span className="text-slate-400">{step.label}</span>
                          <span className="text-slate-900">{step.value} Nodes</span>
                        </div>
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: step.width }} 
                              className={`h-full ${step.color} rounded-full`} 
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
           </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Builder Modal */}
      <AnimatePresence>
        {showCampaignBuilder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
            >
              <div className="absolute top-6 right-6 cursor-pointer text-slate-300 hover:text-slate-900" onClick={() => setShowCampaignBuilder(false)}>
                <X size={24} />
              </div>
              
              <div className="p-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Campaign Architect</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure automated outreach protocols</p>
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Reference</p>
                          <Input 
                            placeholder="TITLE..." 
                            value={newCampaign.name}
                            onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                            className="h-11 bg-slate-50 border-slate-200 text-[10px] font-black uppercase tracking-widest focus-visible:ring-slate-200"
                          />
                      </div>
                      <div className="space-y-1.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Segment Target</p>
                          <select 
                              className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-black text-slate-900 outline-none uppercase tracking-widest"
                              value={newCampaign.type}
                              onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                          >
                              <option value="startup">STARTUPS</option>
                              <option value="investor">INVESTORS</option>
                          </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmission Subject</p>
                        <Input 
                            placeholder="SUBJECT LINE..." 
                            value={newCampaign.subject}
                            onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                            className="h-11 bg-slate-50 border-slate-200 text-[10px] font-black uppercase tracking-widest focus-visible:ring-slate-200"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Template</p>
                        <Textarea 
                            placeholder="MESSAGE CONTENT..." 
                            className="min-h-[160px] bg-slate-50 border-slate-200 text-[11px] font-medium resize-none p-4 focus-visible:ring-slate-200"
                            value={newCampaign.message}
                            onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                        />
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">AVAILABLE TOKENS: {`{name}`}, {`{company}`}</p>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-10">
                    <Button variant="outline" className="h-12 flex-1 text-[10px] font-black uppercase tracking-widest border-slate-200 italic" onClick={() => setShowCampaignBuilder(false)}>Discard</Button>
                    <Button onClick={handleCreateCampaign} className="h-12 flex-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-slate-200">
                        DEPLOY UNIT
                    </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
