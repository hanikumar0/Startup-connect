"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-12">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Top Deal Recommendations */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Top Deal Recommendations</h3>
              <Link href="/dashboard/discover" className="text-[10px] font-bold text-indigo-600 hover:underline">
                View discovery
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="group p-8 rounded-2xl border border-slate-100 bg-white shadow-sm relative transition-all hover:shadow-md hover:border-indigo-100 cursor-pointer">
                 <div className="absolute top-8 right-8 text-slate-200 group-hover:text-indigo-600 transition-colors">
                    <ArrowUpRight size={20} />
                 </div>
                 
                 <div className="mb-2">
                    <Badge className="bg-indigo-50 text-indigo-600 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-6">
                      50% Thesis Alignment
                    </Badge>
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Target Venture</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">SaaS</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Portfolio Concentration */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Portfolio Concentration</h3>
            
            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm group hover:border-indigo-100 transition-all">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h4 className="text-xl font-black text-slate-900">Portfolio Diversification</h4>
                        <p className="text-sm text-slate-400 mt-1 font-medium italic opacity-80">Visual breakdown of deals by industry sector.</p>
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-widest">
                        Live Analytics
                    </Badge>
                </div>
                {/* Visual placeholder */}
                <div className="h-48 w-full bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-8">
                   <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-slate-200 mb-4 shadow-sm">
                      <TrendingUp size={24} />
                   </div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sector Data Ingestion Pending</p>
                </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar - Investment Thesis */}
        <div className="space-y-6">
          <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col min-h-[400px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Investment Thesis</h3>
              
              <div className="flex items-baseline gap-2 mb-3">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter">0%</h3>
                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Thesis Completion</span>
              </div>
              
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mb-8">
                 <div className="h-full bg-indigo-600 w-[0%]" />
              </div>

              <p className="text-xs font-medium text-slate-500 leading-relaxed mb-10 italic opacity-70">
                Setup your target stage and sector to start receiving curated deal-flow recommendations.
              </p>

              <div className="mt-auto">
                <Button className="w-full h-12 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all" onClick={() => router.push('/dashboard/settings/profile')}>
                    Setup Thesis
                </Button>
              </div>
          </div>
        </div>

      </div>

    </div>
  );
}
