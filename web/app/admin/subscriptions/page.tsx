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
  Loader2,
  DollarSign
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await apiFetchJSON("/api/admin/subscriptions");
      if (res.success) {
        setSubscriptions(res.subscriptions || []);
      }
    } catch (err) {
      console.error("Fetch subs fail", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-200 h-10 w-10" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monetization Module</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Captive <span className="text-slate-400 not-italic font-medium">/ Revenue</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Velocity</p>
                <p className="text-sm font-black text-emerald-500 uppercase italic tracking-tighter">+12.4% INCREMENTAL</p>
             </div>
             <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                <TrendingUp size={20} />
             </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-8">
               <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
                     <Zap size={24} className="text-amber-400 animate-pulse" />
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 text-slate-400 italic">MRR Stream</Badge>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Consolidated Monthly Rate</p>
                  <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">₹1.5M</h3>
                  <div className="mt-6 flex items-center gap-2">
                     <span className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[70%] bg-slate-900 rounded-full" />
                     </span>
                     <span className="text-[9px] font-black text-slate-400 uppercase italic">70% TARGET</span>
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white p-8 group">
             <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center">
                   <UserCheck size={24} className="text-emerald-500" />
                </div>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 text-slate-400 italic">Efficiency</Badge>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Renewal Velocity</p>
                <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">94.2%</h3>
                <div className="mt-6 flex items-center gap-2">
                   <span className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[94.2%] bg-emerald-500 rounded-full" />
                   </span>
                   <span className="text-[9px] font-black text-emerald-500 uppercase italic">OPTIMAL</span>
                </div>
             </div>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white p-8 group">
             <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center">
                   <RotateCcw size={24} className="text-rose-500" />
                </div>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 text-slate-400 italic">Attrition</Badge>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Churn Dynamics</p>
                <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">2.1%</h3>
                <div className="mt-6 flex items-center gap-2">
                   <span className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[2.1%] bg-rose-500 rounded-full" />
                   </span>
                   <span className="text-[9px] font-black text-rose-500 uppercase italic">MINIMAL</span>
                </div>
             </div>
          </Card>
        </div>

        {/* Ledger Registry */}
        <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden rounded-xl">
           <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic leading-none">Subscription Ledger</h3>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1.5">Institutional membership tracking</p>
              </div>
              <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3 w-3" />
                 <input 
                    placeholder="SEARCH LEDGER..." 
                    className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-slate-300 transition-colors"
                 />
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <Table>
                 <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                       <TableHead className="py-4 px-8 font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Client Identity</TableHead>
                       <TableHead className="py-4 font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Strategic Tier</TableHead>
                       <TableHead className="py-4 font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Status</TableHead>
                       <TableHead className="py-4 font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Cycle Dynamics</TableHead>
                       <TableHead className="py-4 px-8 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Operations</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {subscriptions.length > 0 ? (
                       subscriptions.map((sub, i) => (
                          <TableRow key={sub._id || i} className="hover:bg-slate-50/30 border-slate-50 transition-colors">
                             <TableCell className="py-6 px-8">
                                <div className="flex items-center gap-3">
                                   <Avatar className="h-11 w-11 rounded-lg border border-slate-100">
                                      <AvatarFallback className="bg-slate-900 text-white font-black text-[11px] uppercase">{sub.user?.name.charAt(0)}</AvatarFallback>
                                   </Avatar>
                                   <div>
                                      <div className="font-black text-slate-900 text-[11px] leading-tight uppercase italic tracking-tighter">{sub.user?.name}</div>
                                      <div className="text-slate-400 text-[9px] font-bold mt-1 uppercase">{sub.user?.email}</div>
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell>
                                <Badge className={`rounded-sm px-2 py-0.5 font-black text-[8px] border-none shadow-none uppercase italic ${
                                   sub.plan === 'pro' ? 'bg-indigo-600 text-white' : 
                                   sub.plan === 'enterprise' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                   {sub.plan}
                                </Badge>
                             </TableCell>
                             <TableCell>
                                <div className="flex items-center gap-1.5">
                                   <div className={`h-1.5 w-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                   <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest italic">{sub.status}</span>
                                </div>
                             </TableCell>
                             <TableCell>
                                <div className="text-slate-900 font-black text-[11px] italic tracking-tighter">₹{sub.amount}<span className="text-slate-400 not-italic"> / {sub.billingCycle === 'yearly' ? 'yr' : 'mo'}</span></div>
                                <div className="text-slate-400 text-[8px] uppercase font-black tracking-widest mt-1 opacity-60">RENEWAL: {new Date(sub.endDate).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                             </TableCell>
                             <TableCell className="text-right px-8">
                                <Button variant="ghost" size="sm" className="h-9 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg group transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                                   Refund <ChevronRight size={14} className="ml-1 opacity-40 group-hover:translate-x-1 transition-transform" />
                                </Button>
                             </TableCell>
                          </TableRow>
                       ))
                    ) : (
                       <TableRow>
                          <TableCell colSpan={5} className="py-24 text-center">
                             <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Buffer is currently empty / Null state verified</p>
                          </TableCell>
                       </TableRow>
                    )}
                 </TableBody>
              </Table>
           </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
