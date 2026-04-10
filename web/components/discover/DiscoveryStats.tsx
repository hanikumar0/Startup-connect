"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, Calendar, Send, Activity } from "lucide-react";

interface DiscoveryStatsProps {
  stats: {
    totalMatches: number;
    connectionRequests: number;
    acceptedConnections: number;
    meetingsScheduled: number;
    outreachSent: number;
  };
}

export default function DiscoveryStats({ stats }: DiscoveryStatsProps) {
  const items = [
    { label: "Total Matches", value: stats.totalMatches, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Requests", value: stats.connectionRequests, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Accepted", value: stats.acceptedConnections, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Meetings", value: stats.meetingsScheduled, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Outreach Sent", value: stats.outreachSent, icon: Send, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 bg-white/70 backdrop-blur-md border border-white/40 shadow-xl shadow-slate-200/40 rounded-2xl flex flex-col items-center text-center space-y-2 hover:bg-white transition-all cursor-default"
        >
          <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
            <item.icon size={20} />
          </div>
          <div>
            <h4 className="text-2xl font-bold text-slate-900">{item.value}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
