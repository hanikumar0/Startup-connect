"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  XSquare, 
  User, 
  ShieldAlert, 
  BarChart,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const res = await apiFetchJSON("/api/admin/reports");
    if (res.success) {
      setReports(res.data);
    }
    setLoading(false);
  };

  const handleResolve = async (id: string, status: string, action: string) => {
    const res = await apiFetchJSON(`/api/admin/report/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ status, actionTaken: action })
    });
    if (res.success) {
      toast.success(`Report ${status}`);
      fetchReports();
    }
  };

  return (
    <div className="p-10 space-y-12 pb-32 italic">
      <header className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">Abuse Monitor</h2>
           <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
             Moderate reported content & enforce community standards
           </p>
        </div>
        
        <div className="flex gap-4">
           <Badge className="bg-rose-500 text-white rounded-full h-12 px-8 font-black text-xs tracking-widest uppercase">{reports.filter(r => r.status === 'pending').length} ACTIVE REPORTS</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {reports.map((report, i) => (
            <motion.div
              key={report._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`border-none shadow-[20px_20px_60px_-15px_rgba(15,23,42,0.05)] rounded-[2.5rem] bg-white overflow-hidden transition-all duration-500 hover:shadow-2xl ${report.status === 'resolved' ? 'opacity-60' : 'hover:-translate-y-1'}`}>
                <div className="p-8 md:p-10 border-l-8 border-rose-500 flex flex-col md:flex-row gap-10">
                   <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100 flex-shrink-0">
                      <AlertTriangle size={36} />
                   </div>
                   
                   <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="flex items-center gap-3">
                               <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Report #{report._id.slice(-6).toUpperCase()}</h3>
                               <Badge className={`rounded-xl px-4 py-1 font-black text-[9px] border-none shadow-none uppercase ${
                                 report.status === 'pending' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                               }`}>
                                 {report.status}
                               </Badge>
                            </div>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
                               Target Type: <span className="text-indigo-600 underline font-black">{report.targetType}</span>
                            </p>
                         </div>
                         <div className="flex gap-2">
                            {report.status === 'pending' ? (
                               <>
                                  <Button 
                                    className="rounded-2xl h-14 px-8 bg-slate-900 text-white font-black hover:bg-black shadow-lg"
                                    onClick={() => handleResolve(report._id, 'resolved', 'Blocked content')}
                                  >
                                     <Trash2 size={18} className="mr-3" /> REMOVE CONTENT
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="rounded-2xl h-14 px-8 border-slate-200 text-slate-400 hover:text-rose-600 font-black"
                                    onClick={() => handleResolve(report._id, 'dismissed', 'False report')}
                                  >
                                     DISMISS
                                  </Button>
                               </>
                            ) : (
                               <div className="text-right">
                                  <div className="text-[10px] font-black uppercase text-slate-300">Resolved Action</div>
                                  <div className="text-sm font-black text-slate-900 italic">{report.actionTaken}</div>
                               </div>
                            )}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Report</div>
                            <p className="text-slate-600 font-medium italic leading-relaxed">
                               "{report.reason}"
                            </p>
                         </div>
                         <div className="p-6 bg-indigo-50/30 rounded-3xl border border-dashed border-indigo-100">
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Reported By</div>
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                                  {report.reporter?.name?.charAt(0) || 'U'}
                               </div>
                               <div>
                                  <div className="text-sm font-black text-slate-900">{report.reporter?.name || 'Anonymous User'}</div>
                                  <div className="text-[10px] font-bold text-slate-400">{report.reporter?.email || 'N/A'}</div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {reports.length === 0 && !loading && (
          <div className="h-96 flex flex-col items-center justify-center text-slate-200 gap-6">
             <CheckCircle2 size={80} strokeWidth={1} className="animate-pulse" />
             <h4 className="font-black text-2xl uppercase tracking-widest">Ecosystem Clean</h4>
          </div>
        )}
      </div>
    </div>
  );
}
