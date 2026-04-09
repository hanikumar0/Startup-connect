"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Building2, UserCheck, ShieldAlert, History, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const stats = [
    { name: "Total Users", value: "1,284", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Startups", value: "542", icon: Building2, color: "text-green-600", bg: "bg-green-50" },
    { name: "Total Investors", value: "312", icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Pending Verification", value: "18", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Governance Console</h1>
          <p className="text-zinc-500 mt-1">Platform-wide statistics and management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 border-none shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-indigo-600" /> Recent Signups
                </CardTitle>
                <Button variant="outline" size="sm" className="font-bold border-zinc-200">View All Users</Button>
             </CardHeader>
             <CardContent>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100">
                          <th className="py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User</th>
                          <th className="py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                          <th className="py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                          <th className="py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <tr key={i} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors group">
                            <td className="py-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">JD</div>
                                  <div>
                                     <p className="text-sm font-bold text-zinc-900">User Alpha {i}</p>
                                     <p className="text-xs text-zinc-500">user{i}@example.com</p>
                                  </div>
                               </div>
                            </td>
                            <td className="py-4">
                               <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${i % 2 === 0 ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                                  {i % 2 === 0 ? "Investor" : "Startup"}
                               </span>
                            </td>
                            <td className="py-4">
                               <div className="flex items-center gap-1.5">
                                  <div className={`h-1.5 w-1.5 rounded-full ${i === 2 ? "bg-amber-500" : "bg-green-500"}`}></div>
                                  <span className="text-sm text-zinc-600">{i === 2 ? "Pending" : "Verified"}</span>
                               </div>
                            </td>
                            <td className="py-4 text-right">
                               <Button variant="ghost" size="sm" className="text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Manage</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-sm h-full">
             <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-600" /> Audit Log
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                    {i !== 4 && <div className="absolute left-[11px] top-6 bottom-0 w-px bg-zinc-100"></div>}
                    <div className="h-6 w-6 rounded-full bg-white border-2 border-indigo-500 z-10"></div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 leading-none">Security Audit {i}</p>
                      <p className="text-xs text-zinc-400 mt-1">2 hours ago • System</p>
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold mt-4 shadow-md">View Full Log</Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
