"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XSquare, 
  Download, 
  ArrowUpRight, 
  Calendar,
  Zap,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Clock,
  History,
  Activity,
  ArrowRight
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BillingDashboard() {
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  const fetchBillingInfo = async () => {
    setLoading(true);
    const res = await apiFetchJSON("/api/billing/subscription");
    if (res.success) {
      setSubscription(res.subscription);
      setUsage(res.usage);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    const res = await apiFetchJSON("/api/billing/cancel", { method: "PUT" });
    if (res.success) {
      toast.success("Subscription will cancel at the end of the term");
      fetchBillingInfo();
    }
  };

  const handleBoost = async () => {
    const res = await apiFetchJSON("/api/billing/boost", { method: "POST" });
    if (res.success) {
      toast.success("Profile boosted for 7 days!");
    } else if (res.code === 'UPGRADE_REQUIRED') {
        toast.error(res.message);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full" />
    </div>
  );

  return (
    <div className="p-10 space-y-12 max-w-6xl mx-auto italic min-h-screen bg-[#fcfcfd]">
       <header className="flex justify-between items-end">
        <div>
           <h1 className="text-[52px] font-black tracking-tighter text-slate-900 leading-none italic uppercase leading-none">Strategic Billing</h1>
           <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
             Manage platform memberships & high-velocity growth tools
           </p>
        </div>
        
        <div className="flex gap-4">
           <Badge className={`rounded-full h-12 px-8 font-black text-xs tracking-widest flex items-center gap-2 ${
             subscription.status === 'active' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100' : 'bg-rose-500 text-white shadow-xl shadow-rose-100'
           }`}>
             <ShieldCheck size={16} /> {subscription.status === 'active' ? 'MEMBERSHIP CURRENT' : 'MEMBERSHIP LAPSED'}
           </Badge>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <Card className="lg:col-span-8 border-none shadow-[20px_20px_60px_-15px_rgba(15,23,42,0.05)] rounded-[3rem] bg-indigo-600 text-white overflow-hidden relative">
            <div className="relative z-10 p-12 h-full flex flex-col justify-between">
               <div>
                  <div className="flex items-center gap-3">
                     <Zap size={24} className="text-white" />
                     <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{subscription.plan === 'pro' ? 'PROFESSIONAL' : subscription.plan === 'premium' ? 'ELITE PREMIUM' : 'STARTER FREE'} TIER</h3>
                  </div>
                  <div className="mt-12 flex items-baseline gap-1">
                     <span className="text-6xl font-black italic tracking-tighter">₹{subscription.plan === 'pro' ? '1,499' : subscription.plan === 'premium' ? '3,999' : '0'}</span>
                     <span className="text-lg opacity-40 font-bold ml-1">/{subscription.billingCycle || 'mo'}</span>
                  </div>
                  <p className="mt-8 text-white/70 font-medium text-lg leading-relaxed max-w-sm italic">You have full access to {subscription.plan === 'premium' ? 'all elite features including profile boosting and featured placement.' : subscription.plan === 'pro' ? 'all essential growth tools including unlimited messaging.' : 'free essential platform discovery features.'}</p>
               </div>
               
               <div className="mt-12 flex gap-4 pt-10 border-t border-white/10">
                  {subscription.plan === 'free' ? (
                     <Button className="h-16 rounded-2xl bg-white text-indigo-700 hover:bg-white/90 font-black px-10 text-lg shadow-2xl">
                        EXPLORE UPGRADES
                     </Button>
                  ) : (
                     <>
                        <div className="flex-1 flex flex-col justify-center">
                           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/60 mb-1">Billing Sequence</div>
                           <div className="text-lg font-black italic tracking-tight">Renewal: {new Date(subscription.endDate || Date.now()).toLocaleDateString()}</div>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="h-14 px-8 rounded-2xl border-white/20 hover:bg-white/10 text-white font-black text-xs transition-all uppercase tracking-widest border"
                            onClick={handleCancel}
                            disabled={subscription.status === 'cancelled'}
                        >
                           {subscription.status === 'cancelled' ? 'CANCELLING AT END OF TERM' : 'TERMINATE SUBSCRIPTION'}
                        </Button>
                     </>
                  )}
               </div>
            </div>
            <div className="absolute -right-24 -bottom-24 opacity-10 transform scale-[2] rotate-12 -z-0">
               <TrendingUp size={400} />
            </div>
         </Card>

         <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex flex-col justify-between h-full border border-slate-50">
               <div className="space-y-10">
                  <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 leading-none">Quota Telemetry</h4>
                  
                  <div className="space-y-6 pt-4">
                     {[
                        { label: 'Outbound Velocity', count: usage?.messagesSent || 0, max: subscription.plan === 'free' ? 5 : '∞', color: 'bg-indigo-600' },
                        { label: 'Strategic Unlocks', count: usage?.contactsUnlocked || 0, max: subscription.plan === 'free' ? 0 : '∞', color: 'bg-emerald-600' },
                     ].map((funnel, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{funnel.label}</span>
                              <span className="text-2xl font-black italic tracking-tighter text-slate-900">{funnel.count}<span className="text-xs text-slate-300 font-bold ml-1">/ {funnel.max}</span></span>
                           </div>
                           <div className="h-4 bg-slate-50 rounded-full overflow-hidden shadow-inner p-1">
                              <motion.div initial={{ width: 0 }} animate={{ width: funnel.max === '∞' ? '100%' : `${((funnel.count / (funnel.max as number)) * 100)}%` }} className={`h-full rounded-full ${funnel.color}`} />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="mt-12 bg-indigo-50/30 rounded-3xl p-6 border border-dashed border-indigo-100 italic">
                  <p className="text-[11px] font-bold text-slate-500 leading-none mb-3">Governance Reset Protocol</p>
                  <p className="text-xs font-black text-slate-900 tracking-tight leading-relaxed">Your monthly strategic quota will automatically refresh on <span className="text-indigo-600 underline">May 7, 2026</span> at 00:00 UTC.</p>
               </div>
            </Card>
         </div>
      </section>

      {/* Strategic Growth Tools */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 border border-slate-50 hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <Zap size={24} className="text-indigo-600" />
                     <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 leading-none">Velocity Boost</h4>
                  </div>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 italic">Force your profile to the absolute top of discovery results globally for the next 168 hours.</p>
               </div>
               <Button 
                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-xs tracking-widest uppercase hover:bg-black shadow-xl"
                onClick={handleBoost}
               >
                  EXECUTE 7-DAY BOOST <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
            <div className="absolute -right-10 -top-10 opacity-5 transform scale-150 rotate-12 group-hover:scale-175 transition-transform">
               <Zap size={140} />
            </div>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 border border-slate-50 hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <Star size={24} className="text-emerald-600" />
                     <h4 className="text-2xl font-black italic tracking-tighter text-slate-900 leading-none">Elite Verification</h4>
                  </div>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 italic">Secure your strategic verification badge and unlock restricted profile metrics for deep diligence.</p>
               </div>
               <Button className="w-full h-16 rounded-2xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-black text-xs tracking-widest uppercase shadow-none">
                  START VERIFICATION AUDIT
               </Button>
            </div>
         </Card>

         <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-10 hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="relative z-10 flex flex-col justify-between h-full">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <Download size={24} className="text-indigo-400" />
                     <h4 className="text-2xl font-black italic tracking-tighter leading-none">Invoice Repository</h4>
                  </div>
                  <p className="text-white/40 font-medium text-sm leading-relaxed mb-10 italic tracking-tight">Access historical billing artifacts, transaction receipts, and accounting-compliant documentation.</p>
               </div>
               <Button variant="outline" className="w-full h-16 rounded-2xl border-white/20 text-white font-black hover:bg-white/10 text-xs tracking-widest border-2">
                  SYNC ARCHIVES <ChevronRight size={16} className="ml-2" />
               </Button>
            </div>
         </Card>
      </section>

      {/* Transaction Audit */}
      <section className="space-y-8">
         <div className="flex items-center gap-4">
            <History size={24} className="text-slate-400" />
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Transaction Audit Trail</h3>
         </div>
         
         <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden border border-slate-50 italic">
            <Table>
               <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none">
                     <TableHead className="py-8 px-10 font-black text-slate-400 uppercase tracking-widest text-[10px]">Reference Sequence</TableHead>
                     <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Strategic Plan</TableHead>
                     <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Execution Date</TableHead>
                     <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Monetary Quantum</TableHead>
                     <TableHead className="text-right px-10 font-black text-slate-400 uppercase tracking-widest text-[10px]">Artifacts</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {[
                    { id: 'TX-984210', plan: subscription.plan, date: new Date().toLocaleDateString(), amount: subscription.plan === 'pro' ? '1,499' : '3,999' }
                  ].map((tx, i) => (
                     <TableRow key={i} className="hover:bg-slate-50/50 border-slate-50">
                        <TableCell className="py-10 px-10 font-black text-slate-900">#{tx.id}</TableCell>
                        <TableCell>
                           <Badge className="bg-indigo-600 text-white font-black text-[9px] px-4 py-1.5 rounded-xl uppercase tracking-widest">{tx.plan}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">{tx.date}</TableCell>
                        <TableCell className="text-slate-900 font-black text-2xl tracking-tighter italic">₹{tx.amount}</TableCell>
                        <TableCell className="text-right px-10">
                           <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-white text-indigo-600 border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-indigo-50 transition-all flex items-center justify-center">
                              <Download size={18} />
                           </Button>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </Card>
      </section>
    </div>
  );
}

const Star = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
