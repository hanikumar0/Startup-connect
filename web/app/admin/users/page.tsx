"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  Ban, 
  Trash2, 
  Mail,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const res = await apiFetchJSON(`/api/admin/users?page=${page}&role=${roleFilter}&search=${search}`);
        if (res.success) {
            setUsers(res.users);
            setTotalPages(res.totalPages);
        }
    } catch (err) {
        console.error("Fetch users fail", err);
    } finally {
        setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    const res = await apiFetchJSON(`/api/admin/user/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus })
    });
    if (res.success) {
      toast.success(`User status updated: ${newStatus}`);
      fetchUsers();
    }
  };

  const handleVerify = async (id: string) => {
    const res = await apiFetchJSON(`/api/admin/user/${id}/verify`, { method: "PUT" });
    if (res.success) {
      toast.success("Identity verified");
      fetchUsers();
    }
  };

  if (loading && users.length === 0) return (
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Governance</p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Network <span className="text-slate-400 not-italic font-medium">/ Registry</span></h1>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="h-10 border-slate-200 text-[9px] font-black uppercase tracking-widest italic hover:bg-slate-50">
               <Mail size={14} className="mr-2" /> Global Broadcast
             </Button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
           <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <div className="relative flex-1 md:min-w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input 
                  placeholder="SEARCH IDENTITIES..." 
                  className="pl-12 h-11 rounded-lg border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest focus-visible:ring-slate-200" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="h-11 px-4 rounded-lg border border-slate-200 bg-white text-[10px] font-black text-slate-600 outline-none hover:border-slate-300 transition-colors uppercase tracking-widest"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">ALL CLUSTERS</option>
                <option value="startup">STARTUPS</option>
                <option value="investor">INVESTORS</option>
                <option value="admin">GOVERNANCE</option>
              </select>
           </div>
           
           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100 italic">
              <span className="text-[9px] font-black text-slate-400 px-3 uppercase tracking-widest">Total Active: {users.length}</span>
           </div>
        </div>

        {/* User Registry Table */}
        <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="py-4 px-8 font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Identity Profile</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Strategic Role</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Validation</TableHead>
                <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Access State</TableHead>
                <TableHead className="text-right px-8 font-black text-slate-400 uppercase tracking-widest text-[9px] italic">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {users.map((user, i) => (
                  <TableRow key={user._id || i} className="hover:bg-slate-50/30 border-slate-50 transition-colors">
                    <TableCell className="py-6 px-8">
                       <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 rounded-lg border border-slate-100">
                             <AvatarFallback className={`bg-slate-900 text-white font-black text-[11px] uppercase ${user.role === 'admin' ? 'bg-red-900' : ''}`}>
                                {user.name.charAt(0)}
                             </AvatarFallback>
                          </Avatar>
                          <div>
                             <div className="font-black text-slate-900 text-[11px] uppercase italic tracking-tighter leading-tight">{user.name}</div>
                             <div className="text-slate-400 text-[9px] font-bold mt-1 tracking-tight">{user.email}</div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="rounded-full px-2 py-0 border-slate-200 text-[8px] font-black uppercase tracking-widest bg-slate-50">
                          {user.role}
                       </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className={user.isVerified ? "text-emerald-500" : "text-slate-200"} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${user.isVerified ? "text-emerald-600" : "text-slate-300"}`}>
                             {user.isVerified ? "VERIFIED" : "TRIAL"}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={`rounded-full px-2.5 py-0.5 shadow-none text-[8px] font-black uppercase tracking-widest italic ${
                         user.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                       }`}>
                         {user.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <div className="flex justify-end gap-2">
                          {!user.isVerified && (
                             <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-3 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-[8px] font-black uppercase tracking-widest"
                                onClick={() => handleVerify(user._id)}
                             >
                                <CheckCircle2 size={12} className="mr-1.5" /> VERIFY
                             </Button>
                          )}
                          <Button 
                             size="sm" 
                             variant="outline" 
                             className={`h-8 px-3 border-slate-200 text-[8px] font-black uppercase tracking-widest ${user.status === 'active' ? 'hover:border-rose-200 hover:bg-rose-50 text-rose-600' : 'hover:border-indigo-200 hover:bg-indigo-50 text-indigo-600'}`}
                             onClick={() => handleStatusChange(user._id, user.status)}
                          >
                             {user.status === 'active' ? <Ban size={12} className="mr-1.5" /> : <CheckCircle2 size={12} className="mr-1.5" />}
                             {user.status === 'active' ? "BLOCK" : "UNBLOCK"}
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>

          {/* Pagination Registry */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                Node {users.length} of {totalPages * 20} identified Cluster
             </div>
             <div className="flex gap-2">
                <Button 
                   variant="outline" 
                   size="sm"
                   disabled={page === 1} 
                   onClick={() => setPage(page - 1)}
                   className="h-9 border-slate-200 text-[9px] font-black uppercase tracking-widest italic"
                >
                   <ChevronLeft size={14} className="mr-1" /> Back
                </Button>
                <div className="h-9 px-4 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black italic">
                   {page}
                </div>
                <Button 
                   variant="outline" 
                   size="sm"
                   disabled={page >= totalPages} 
                   onClick={() => setPage(page + 1)}
                   className="h-9 border-slate-200 text-[9px] font-black uppercase tracking-widest italic"
                >
                   Next <ChevronRight size={14} className="ml-1" />
                </Button>
             </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
