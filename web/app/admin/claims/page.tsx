"use client";

import { useState, useEffect } from "react";
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    const res = await apiFetchJSON("/api/admin/claims");
    if (res.success) {
      setClaims(res.data);
    }
    setLoading(false);
  };

  const handleApprove = async (type: string, id: string, approvedUserId: string) => {
    // Note: Reuse the claim controller endpoint previously implemented
    const res = await apiFetchJSON(`/api/admin/approve-claim/${type}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ approvedUserId })
    });
    if (res.success) {
      toast.success("Claim approved and verified");
      fetchClaims();
    }
  };

  return (
    <div className="p-10 space-y-12">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none italic">Verify Profiles</h2>
           <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
             Review and approve profile ownership requests
           </p>
        </div>
        
        <div className="flex gap-4">
           <Badge className="bg-slate-900 text-white hover:bg-slate-900 rounded-full h-12 px-8 font-black text-xs tracking-widest">{claims.length} PENDING CLAIMS</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
        <AnimatePresence>
          {claims.map((claim, i) => (
            <motion.div
              key={claim._id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-[20px_20px_60px_-15px_rgba(15,23,42,0.05)] rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <Fingerprint size={160} />
                </div>
                
                <CardContent className="p-10 space-y-8 relative z-10">
                   <div className="flex justify-between items-start">
                      <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                         <Key size={30} className="text-indigo-200" />
                      </div>
                      <Badge className="bg-white/20 text-white rounded-full font-black text-[10px] tracking-widest px-4 border-none backdrop-blur-md">
                         {claim.profileType.toUpperCase()} CLAIM
                      </Badge>
                   </div>
                   
                   <div className="space-y-2">
                       <h3 className="text-3xl font-black italic tracking-tighter leading-tight">
                         {claim.startupName || claim.investorName}
                       </h3>
                       <div className="flex items-center gap-2 text-indigo-200/60 font-bold text-xs uppercase tracking-widest italic">
                          Matching Profile <ArrowRight size={14} /> SCRAPED DATA
                       </div>
                   </div>

                   <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-3 ml-1">Claimant Requesting Verification</div>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-black text-lg">
                            {claim.claimedBy.name.charAt(0)}
                         </div>
                         <div>
                            <div className="font-extrabold text-white text-lg leading-tight">{claim.claimedBy.name}</div>
                            <div className="text-xs font-bold text-indigo-200/70">{claim.claimedBy.email}</div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <Button 
                        className="rounded-2xl h-16 bg-white text-indigo-600 hover:bg-indigo-50 font-black text-sm shadow-2xl"
                        onClick={() => handleApprove(claim.profileType, claim._id, claim.claimedBy._id)}
                      >
                         <CheckCircle2 size={20} className="mr-3" /> APPROVE CLAIM
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="rounded-2xl h-16 hover:bg-white/10 text-white font-black text-sm border-white/20"
                      >
                         <XCircle size={20} className="mr-3" /> REJECT CLAIM
                      </Button>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {claims.length === 0 && !loading && (
        <div className="h-[600px] flex flex-col items-center justify-center text-slate-300 gap-6 bg-white/40 border-2 border-dashed border-slate-100 rounded-[3rem]">
           <ShieldAlert size={80} strokeWidth={1} className="animate-bounce" />
           <div className="text-center">
              <h4 className="font-black italic text-2xl text-slate-900 leading-none">All Caught Up</h4>
              <p className="mt-3 font-bold text-slate-400 uppercase tracking-widest text-[10px]">No new profile verification requests at the moment</p>
           </div>
        </div>
      )}
    </div>
  );
}
