"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  Search, 
  CheckCircle2, 
  XSquare, 
  Zap, 
  MapPin, 
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Mail,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchInvestors();
  }, [filter]);

  const fetchInvestors = async () => {
    setLoading(true);
    const res = await apiFetchJSON(`/api/admin/investors?status=${filter}`);
    if (res.success) {
      setInvestors(res.data);
    }
    setLoading(false);
  };

  const handleModerate = async (id: string, updates: any) => {
    const res = await apiFetchJSON(`/api/admin/investor/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    if (res.success) {
      toast.success(updates.status ? `Investor ${updates.status}` : "Updates applied");
      fetchInvestors();
    }
  };

  return (
    <div className="p-10 space-y-12">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none italic">Investor Registry</h2>
           <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
             Audit institutional & individual dry powder allocations
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
          {investors.map((investor, i) => (
            <motion.div
              key={investor._id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-none shadow-[20px_20px_60px_-15px_rgba(15,23,42,0.05)] rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-500">
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
                   <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center font-black text-3xl text-emerald-700 shadow-xl shadow-emerald-50 group-hover:scale-110 transition-transform">
                      {investor.logo ? <img src={investor.logo} alt="L" className="w-full h-full object-cover rounded-[1.8rem]" /> : investor.investorName.charAt(0)}
                   </div>
                   
                   <div className="flex-1 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                            <div className="flex items-center gap-3">
                               <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{investor.investorName}</h3>
                               <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full text-[8px] font-black tracking-widest px-3 border-none shadow-none uppercase">{investor.investorType}</Badge>
                               {investor.isVerified && <Badge className="bg-blue-500 text-white rounded-full text-[8px] font-black tracking-widest px-3 border-none flex items-center gap-1"><CheckCircle2 size={10} /> ACCREDITED</Badge>}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                               <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                  <Wallet size={14} className="text-emerald-500" /> {investor.firmName || 'Independent'}
                               </div>
                               <span className="text-slate-200">•</span>
                               <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                  <MapPin size={14} className="text-emerald-500" /> {investor.location}
                               </div>
                               <span className="text-slate-200">•</span>
                               <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                  <TrendingUp size={14} className="text-emerald-500" /> ACROSS {investor.preferredStages?.join(', ')}
                               </div>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            {filter === 'pending' ? (
                               <>
                                  <Button 
                                    className="rounded-2xl h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xl shadow-emerald-100 flex items-center gap-2"
                                    onClick={() => handleModerate(investor._id, { status: 'approved', isVerified: true })}
                                  >
                                     <UserCheck size={18} /> APPROVE & ACCREDIT
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="rounded-2xl h-14 px-8 border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 font-black text-xs transition-all flex items-center gap-2"
                                    onClick={() => handleModerate(investor._id, { status: 'rejected' })}
                                  >
                                     <XSquare size={18} /> REJECT
                                  </Button>
                               </>
                            ) : (
                               <Button 
                                 variant="outline"
                                 className="rounded-2xl h-14 px-8 border-slate-200 text-emerald-600 font-black text-xs transition-all flex items-center gap-2"
                                 onClick={() => handleModerate(investor._id, { isFeatured: !investor.isFeatured })}
                               >
                                  <Zap size={18} /> {investor.isFeatured ? 'UNFEATURE' : 'FEATURE AS TOP 5%'}
                               </Button>
                            )}
                         </div>
                      </div>
                      
                      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center group-hover:bg-white group-hover:border-emerald-100 transition-colors">
                         <div className="flex flex-col gap-1 max-w-xl">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Investment Thesis & Abstract</span>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mt-2 line-clamp-2">
                               {investor.bio}
                            </p>
                         </div>
                         <div className="flex gap-8 border-l border-slate-200/60 pl-8 h-full items-center">
                            <div className="text-center">
                               <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic mb-1">Check Sizes</div>
                               <div className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">${Math.round(investor.checkSizeMin/1000)}K - ${Math.round(investor.checkSizeMax/1000)}K</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {investors.length === 0 && !loading && (
          <div className="h-80 flex flex-col items-center justify-center text-slate-300 gap-4 bg-white/40 border-2 border-dashed border-slate-100 rounded-[3rem]">
             <Wallet size={60} strokeWidth={1} className="animate-pulse" />
             <span className="font-black italic text-lg uppercase tracking-widest">No investors found in {filter} queue</span>
          </div>
        )}
      </div>
    </div>
  );
}
