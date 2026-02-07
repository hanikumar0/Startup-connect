"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    UserCheck,
    ShieldAlert,
    TrendingUp,
    LayoutDashboard,
    CheckCircle2,
    XCircle,
    Eye
} from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { title: "Total Users", value: "1,284", icon: Users, color: "text-blue-600" },
        { title: "Verified Profiles", value: "856", icon: UserCheck, color: "text-green-600" },
        { title: "Pending Reviews", value: "42", icon: ShieldAlert, color: "text-amber-600" },
        { title: "Weekly Growth", value: "+12.5%", icon: TrendingUp, color: "text-indigo-600" },
    ];

    const pendingUsers = [
        { id: "1", name: "Alpha Tech Labs", role: "STARTUP", email: "contact@alphatech.com", date: "2025-12-20" },
        { id: "2", name: "Sarah Ventures", role: "INVESTOR", email: "sarah@ventures.com", date: "2025-12-21" },
        { id: "3", name: "Green Earth Sol", role: "STARTUP", email: "hello@greenearth.org", date: "2025-12-22" },
    ];

    return (
        <div className="flex min-h-screen bg-zinc-50/50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-zinc-200 hidden lg:block">
                <div className="p-6 border-b border-zinc-200">
                    <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                        <ShieldAlert size={28} />
                        <span>Admin Panel</span>
                    </div>
                </div>
                <nav className="p-4 space-y-2">
                    <Button
                        variant={activeTab === 'overview' ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3 h-11"
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} /> Overview
                    </Button>
                    <Button
                        variant={activeTab === 'verification' ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3 h-11"
                        onClick={() => setActiveTab('verification')}
                    >
                        <CheckCircle2 size={20} /> Verification Queue
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-11">
                        <Users size={20} /> User Management
                    </Button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">System Overview</h1>
                            <p className="text-zinc-500 mt-1">Real-time metrics and verification controls.</p>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                            Admin Console v1.0
                        </Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <Card key={i} className="border-none shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium text-zinc-500">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pending Verifications Table */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="border-b border-zinc-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Verification Queue</CardTitle>
                                <CardDescription>Review submitted documents for startups and investors.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline">View All</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-zinc-50/50">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Entity</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Date Filed</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingUsers.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-zinc-50/30 transition-colors">
                                            <TableCell className="font-semibold">{user.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={user.role === 'INVESTOR' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-blue-600 bg-blue-50 border-blue-100'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-zinc-500">{user.email}</TableCell>
                                            <TableCell className="text-zinc-500">{user.date}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-indigo-600">
                                                        <Eye size={18} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-50">
                                                        <CheckCircle2 size={18} />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50">
                                                        <XCircle size={18} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
