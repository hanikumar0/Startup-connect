"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Terminal, 
  Play, 
  Search, 
  CheckCircle2, 
  Rocket, 
  Wallet, 
  TrendingUp, 
  Zap, 
  BarChart, 
  Timer,
  ChevronRight,
  ShieldCheck,
  History,
  Activity,
  Globe,
  Database,
  Cpu,
  MoreVertical,
  Calendar,
  Layers,
  Link as LinkIcon,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminScrapersPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  
  // URL Extraction State
  const [extractUrl, setExtractUrl] = useState("");
  const [extractType, setExtractType] = useState("startup");
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiFetchJSON("/api/admin/scrape/logs");
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScraper = async (type: string) => {
    setRunning(type);
    toast.promise(
        apiFetchJSON(`/api/admin/scrape/${type}`, { method: "POST" }),
        {
            loading: `Executing ${type} ingestion agents...`,
            success: (data) => {
                setRunning(null);
                fetchLogs();
                return `${type} synchronization complete`;
            },
            error: "Ingestion service error"
        }
    );
  };

  const handleUrlExtraction = async () => {
    if (!extractUrl) return toast.error("Please enter a valid URL");
    setIsExtracting(true);
    
    toast.promise(
      apiFetchJSON("/api/admin/scrape/url", {
        method: "POST",
        body: JSON.stringify({ url: extractUrl, type: extractType })
      }),
      {
        loading: "AI Prospector is analyzing the target website...",
        success: (data) => {
          setIsExtracting(false);
          setExtractUrl("");
          fetchLogs();
          return `Successfully extracted ${extractType} profile`;
        },
        error: "Automation node could not parse the target source"
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-[1240px] mx-auto px-6 py-10 space-y-10 animate-in fade-in duration-500">
        
        {/* Institutional Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
              <Database size={14} className="text-slate-900" />
              <span>Institutional Data Ingestion</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
              Scraper <span className="text-slate-400 not-italic font-medium">Matrix</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
              Platform-wide data synchronization and AI link prospecting for automatic profile generation.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
             <Card className="bg-slate-900 text-white p-4 border-none shadow-xl flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                   <Timer size={20} className="animate-pulse" />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next Auto-Sync</p>
                   <p className="text-sm font-black italic tracking-tight">T-Minus 04:22:15</p>
                </div>
             </Card>
             <Button variant="outline" onClick={fetchLogs} className="h-14 w-14 border-slate-200">
                <History size={20} className={loading ? "animate-spin" : "text-slate-400"} />
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* Main Controls - Left 2 Columns */}
          <div className="xl:col-span-2 space-y-10">
            
            {/* AI Link Prospector (New Feature) */}
            <Card className="border-2 border-slate-900 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={160} />
               </div>
               <CardContent className="p-10 space-y-8 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <Badge className="bg-slate-900 text-white rounded-full px-4 text-[9px] font-black uppercase italic tracking-widest border-none">
                          AI Link Prospector
                       </Badge>
                       <h2 className="text-3xl font-black italic tracking-tighter text-slate-900">Direct Extraction Hub</h2>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 italic font-black text-lg">AI</div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex-1 relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input 
                          placeholder="PASTE SOURCE URL (LinkedIn, Crunchbase, Website)..." 
                          value={extractUrl}
                          onChange={(e) => setExtractUrl(e.target.value)}
                          className="pl-12 h-16 rounded-2xl border-slate-200 bg-slate-50 text-sm font-bold focus-visible:ring-slate-900 shadow-sm"
                        />
                     </div>
                     <select 
                       className="h-16 px-6 rounded-2xl border border-slate-200 bg-white text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none shadow-sm"
                       value={extractType}
                       onChange={(e) => setExtractType(e.target.value)}
                     >
                       <option value="startup">STARTUP</option>
                       <option value="investor">INVESTOR</option>
                     </select>
                     <Button 
                       onClick={handleUrlExtraction}
                       disabled={isExtracting}
                       className="h-16 px-10 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] italic shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                     >
                        {isExtracting ? <Activity size={20} className="animate-spin mr-2" /> : <Zap size={20} className="mr-2" />}
                        EXECUTE EXTRACTION
                     </Button>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Neural extraction engine validates signal integrity before ingestion.
                  </p>
               </CardContent>
            </Card>

            {/* Batch Sync Controllers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { 
                  type: 'startups', 
                  label: 'Global Startup Sync', 
                  icon: Rocket, 
                  color: 'text-indigo-600', 
                  bg: 'bg-indigo-50',
                  desc: 'Multi-agent crawl across institutional startup directories.',
                  sources: ['LinkedIn', 'ProductHunt', 'HackerNews'] 
                },
                { 
                  type: 'investors', 
                  label: 'Investor Audit Sync', 
                  icon: Wallet, 
                  color: 'text-emerald-600', 
                  bg: 'bg-emerald-50',
                  desc: 'Capital allocator validation and network density audit.',
                  sources: ['OpenVC', 'Apify', 'Crunchbase', 'Tracxn'] 
                },
              ].map((tool, i) => (
                <Card key={i} className="border border-slate-100 shadow-sm rounded-[2rem] bg-white group hover:border-slate-900 transition-all">
                   <CardContent className="p-8 space-y-6">
                      <div className="flex justify-between items-center">
                         <div className={cn("p-4 rounded-xl group-hover:rotate-6 transition-transform", tool.bg, tool.color)}>
                            <tool.icon size={24} />
                         </div>
                         <div className="flex gap-1">
                            {tool.sources.map(s => <div key={s} className="h-1.5 w-1.5 rounded-full bg-slate-200" />)}
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <h3 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">{tool.label}</h3>
                         <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{tool.desc}</p>
                      </div>

                      <Button 
                        variant="outline"
                        className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        onClick={() => handleRunScraper(tool.type)}
                        disabled={running !== null}
                      >
                         {running === tool.type ? <Timer className="animate-spin mr-3" size={16} /> : <Play size={14} className="mr-3" />}
                         LAUNCH BATCH SYNC
                      </Button>
                   </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity Sidebar - Right Column */}
          <div className="space-y-10">
            
            {/* Scheduler Status */}
            <Card className="border border-slate-100 shadow-sm rounded-[2rem] bg-slate-50 p-8 space-y-6">
               <div className="flex items-center gap-3">
                  <Calendar className="text-slate-900 h-5 w-5" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Auto-Sync Protocol</h3>
               </div>
               
               <div className="space-y-4">
                  {[
                    { label: "Every 12 Hours", task: "Startup Ingestion", status: "ACTIVE" },
                    { label: "Every 24 Hours", task: "Investor Audit", status: "ACTIVE" },
                    { label: "Every 6 Hours", task: "Signal Enrichment", status: "ACTIVE" },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                       <div>
                          <p className="text-[10px] font-black text-slate-900 italic">{s.task}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                       </div>
                       <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] font-black px-2">LIVE</Badge>
                    </div>
                  ))}
               </div>
               
               <div className="pt-4 border-t border-slate-200">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Service Core: Institutional Scheduler v4.2</p>
               </div>
            </Card>

            {/* Recent Audit Logs */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Audit Trail</h3>
                  <Button variant="ghost" className="text-[9px] font-black uppercase text-slate-900 h-auto p-0 flex items-center gap-1">VIEW ALL <ArrowRight size={10} /></Button>
               </div>
               
               <div className="space-y-3">
                  {logs.slice(0, 5).map((log, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center",
                            log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          )}>
                             <Layers size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-900 italic uppercase truncate max-w-[120px]">{log.source}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(log.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[11px] font-black text-slate-900">+{log.imported || 0}</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase">INGESTED</p>
                       </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-10 opacity-20">
                       <History size={32} className="mx-auto" />
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
