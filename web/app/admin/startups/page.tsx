"use client";

import { useState, useEffect } from "react";
import { 
  Rocket, 
  Search, 
  CheckCircle2, 
  XSquare, 
  TrendingUp, 
  Trash2, 
  ExternalLink,
  Zap,
  Globe,
  MapPin,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchStartups();
  }, [filter]);

  const fetchStartups = async () => {
    setLoading(true);
    const res = await apiFetchJSON(`/api/admin/startups?status=${filter}`);
    if (res.success) {
      setStartups(res.data);
    }
    setLoading(false);
  };

  const handleModerate = async (id: string, updates: any) => {
    const res = await apiFetchJSON(`/api/admin/startup/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    if (res.success) {
      toast.success(updates.status ? `Startup ${updates.status}` : "Updates applied");
      fetchStartups();
    }
  };

  return (
    <div className="p-10 space-y-12">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none italic">Unicorn Pipeline</h2>
           <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
             Moderate startup profiles & highlight ecosystem outliers
           </p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           {['pending', 'approved', 'rejected'].map(s => (
             <button
               key={s}
               onClick={() => setFilter(s)}
               className={`px-8 h-12 rounded-xl text-xs font-black tracking-widest transition-all ${
                 filter === s ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-900'
               }`}
             >
               {s.toUpperCase()}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 pb-20 italic">
        <AnimatePresence mode="popLayout">
          {startups.map((startup, i) => (
            <motion.div
              key={startup._id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-none shadow-[20px_20px_60px_-15px_rgba(15,23,42,0.05)] rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500">
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
                   <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-indigo-600 flex items-center justify-center font-black text-3xl text-indigo-700 shadow-xl shadow-indigo-50 group-hover:scale-110 transition-transform">
                      {startup.logo ? <img src={startup.logo} alt="L" className="w-full h-full object-cover rounded-[1.8rem]" /> : startup.startupName.charAt(0)}
                   </div>
                   
                   <div className="flex-1 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                            <div className="flex items-center gap-3">
                               <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{startup.startupName}</h3>
                               {startup.isFeatured && <Badge className="bg-amber-400 text-black hover:bg-amber-500 rounded-full text-[8px] font-black tracking-widest px-3 border-none shadow-none flex items-center gap-1"><Zap size={10} /> FEATURED</Badge>}
                               {startup.isVerified && <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full text-[8px] font-black tracking-widest px-3 border-none shadow-none flex items-center gap-1"><CheckCircle2 size={10} /> VERIFIED</Badge>}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                               <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                  <Rocket size={14} className="text-indigo-400" /> {startup.industry}
                               </div>
                               <span className="text-slate-200">•</span>
                               <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                  <MapPin size={14} className="text-indigo-400" /> {startup.location || 'Remote'}
                               </div>
                               <span className="text-slate-200">•</span>
                               <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                  <Globe size={14} className="text-indigo-400" /> {startup.website || 'No Web'}
                               </div>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            {filter === 'pending' ? (
                               <>
                                  <Button 
                                    className="rounded-2xl h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xl shadow-indigo-100 flex items-center gap-2"
                                    onClick={() => handleModerate(startup._id, { status: 'approved', isVerified: true })}
                                  >
                                     <CheckCircle2 size={18} /> APPROVE & VERIFY
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="rounded-2xl h-14 px-8 border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 font-black text-xs transition-all flex items-center gap-2"
                                    onClick={() => handleModerate(startup._id, { status: 'rejected' })}
                                  >
                                     <XSquare size={18} /> REJECT
                                  </Button>
                               </>
                            ) : (
                               <Button 
                                 variant="outline"
                                 className="rounded-2xl h-14 px-8 border-slate-200 text-indigo-600 font-black text-xs transition-all flex items-center gap-2"
                                 onClick={() => handleModerate(startup._id, { isFeatured: !startup.isFeatured })}
                               >
                                  <Zap size={18} /> {startup.isFeatured ? 'UNFEATURE' : 'FEATURE AS TOP 5%'}
                               </Button>
                            )}
                         </div>
                      </div>
                      
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                         <div className="flex flex-col gap-1 max-w-xl">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Abstract & Traction</span>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mt-2 line-clamp-2">
                               {startup.description}
                            </p>
                         </div>
                         <div className="flex gap-8 border-l border-slate-200/60 pl-8 h-full items-center">
                            <div className="text-center">
                               <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Stage</div>
                               <div className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{startup.stage}</div>
                            </div>
                            <div className="text-center">
                               <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Funding</div>
                               <div className="text-xl font-black text-indigo-700 tracking-tighter uppercase italic">${Math.round(startup.fundingRequired/1000) || 0}K</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {startups.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="h-80 flex flex-col items-center justify-center text-slate-300 gap-4 bg-white/40 border-2 border-dashed border-slate-100 rounded-[3rem]"
          >
             <Rocket size={60} strokeWidth={1} className="animate-pulse" />
             <span className="font-black italic text-lg uppercase tracking-widest">No startups found in {filter} queue</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
