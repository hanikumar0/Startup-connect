"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rocket, Users, ArrowRight, TrendingUp, ShieldCheck, Globe, Search, Filter, Sparkles, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DiscoverPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1240px] mx-auto px-6 py-12 space-y-16">
        
        {/* Sleek Hero Strategy */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="space-y-6 max-w-2xl text-center md:text-left">
              <div className="space-y-2">
                 <Badge variant="outline" className="py-1.5 px-3 bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-widest">Marketplace Discovery</Badge>
                 <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                   The Global Network for <span className="text-primary">Capital & Innovation.</span>
                 </h1>
              </div>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Connect with the world's most promising startups and the investors fueling their growth—all in one secure, data-driven ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                 <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                    <input 
                       type="text" 
                       placeholder="Search firms or founders..." 
                       className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
                    />
                 </div>
                 <Button className="h-12 px-8 bg-primary text-white font-bold text-xs uppercase shadow-lg shadow-primary/20">Find Matches</Button>
              </div>
           </div>
           
           <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {[
                { label: 'Network Value', value: '$4.2B+', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Active Deals', value: '850+', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Vetted Members', value: '12k+', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Daily Matches', value: '92%', icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl flex flex-col items-center text-center space-y-3 hover:border-primary/20 transition-all cursor-default">
                   <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                      <stat.icon size={20} />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold text-slate-900">{stat.value}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Discovery Portals */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Link href="/discover/startups" className="group">
              <Card className="h-full border-border shadow-none rounded-[2rem] bg-white hover:border-primary/20 transition-all overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Rocket size={160} className="rotate-12" />
                 </div>
                 <CardContent className="p-12 space-y-8 relative z-10">
                    <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                       <Rocket size={24} />
                    </div>
                    <div className="space-y-3">
                       <h2 className="text-3xl font-bold text-slate-900 leading-none">Find Startups</h2>
                       <p className="text-slate-500 font-medium leading-relaxed max-w-xs">Explore a curated marketplace of pre-vetted startups and high-growth opportunities.</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest pt-4 group-hover:gap-4 transition-all">
                       Browse Catalog <ArrowRight size={16} />
                    </div>
                 </CardContent>
              </Card>
           </Link>

           <Link href="/discover/investors" className="group">
              <Card className="h-full border-border shadow-none rounded-[2rem] bg-white hover:border-slate-900/20 transition-all overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Users size={160} className="-rotate-12" />
                 </div>
                 <CardContent className="p-12 space-y-8 relative z-10">
                    <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                       <Users size={24} />
                    </div>
                    <div className="space-y-3">
                       <h2 className="text-3xl font-bold text-slate-900 leading-none">Find Investors</h2>
                       <p className="text-slate-500 font-medium leading-relaxed max-w-xs">Connect with top-tier VCs, funds, and private investors aligned with your thesis.</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-widest pt-4 group-hover:gap-4 transition-all">
                       Browse Investors <ArrowRight size={16} />
                    </div>
                 </CardContent>
              </Card>
           </Link>
        </section>

        {/* Verification Engine - Secondary Info */}
        <section className="bg-slate-50 rounded-[2.5rem] p-12 border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-xl">
               <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900">Institutional-Grade Vetting</h3>
                  <p className="text-slate-500 font-medium leading-relaxed"> Our proprietary verification engine ensures every participant in the ecosystem is real, active, and compliant with global financial standards.</p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100">
                     <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Identity Secure</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-100">
                     <div className="h-2 w-2 bg-primary rounded-full" />
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">KYC Compliant</span>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-[480px]">
               <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase">
                     <TrendingUp size={14} /> Growth Focus
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Velocity Tracking Enabled</p>
               </div>
               <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
                     <Users size={14} /> Peer Network
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Institutional Deal-flow</p>
               </div>
            </div>
        </section>

      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
