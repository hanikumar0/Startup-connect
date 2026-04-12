"use client"

import { useEffect, useState } from "react";
import { SyndicateRoom } from "@/components/deals/SyndicateRoom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, List, Plus, Search, Filter, ChevronRight, ArrowRight, CircleDashed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion";

export default function DealsPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <CircleDashed className="h-12 w-12 text-indigo-600 opacity-20" />
                </motion.div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Initializing Lounge...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20 px-1"
        >
            {/* Breadcrumb Console */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Syndication Hub</span>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Syndicate Lounge</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">
                        SYNDICATE<span className="text-indigo-600">.</span>CORE
                    </h1>
                    <p className="text-xl text-slate-500 font-medium italic max-w-xl">
                        Co-invest with industry leaders in institutional, high-growth venture objects.
                    </p>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="h-16 px-8 bg-black hover:bg-slate-900 text-white rounded-[28px] shadow-2xl shadow-indigo-100 gap-3 border-none ring-offset-4 hover:ring-2 ring-black transition-all">
                        <Plus size={20} strokeWidth={3} />
                        <span className="font-bold text-lg uppercase tracking-tight">CREATE SYNDICATE</span>
                    </Button>
                </motion.div>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                    <TabsList className="bg-slate-100/50 p-2 rounded-[24px] h-16 w-full lg:w-fit gap-2">
                        <TabsTrigger value="active" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">ACTIVE DEALS</TabsTrigger>
                        <TabsTrigger value="portfolio" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">PARTICIPATING</TabsTrigger>
                        <TabsTrigger value="closed" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">CLOSED_ARCHIVE</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" strokeWidth={3} />
                            <Input placeholder="Search deals..." className="h-14 lg:w-80 rounded-2xl border-slate-100 bg-white/50 backdrop-blur-sm pl-12 pr-6 font-bold text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm" />
                        </div>
                        <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white/50 hover:bg-slate-50 transition-all shadow-sm">
                            <Filter size={20} strokeWidth={3} className="text-slate-400" />
                        </Button>
                    </div>
                </div>

                <TabsContent value="active" className="space-y-12 focus-visible:outline-none">
                    <SyndicateRoom />
                </TabsContent>

                <TabsContent value="portfolio" className="focus-visible:outline-none">
                    <div className="py-32 text-center bg-slate-50/50 rounded-[56px] border-4 border-dashed border-white shadow-inner">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
                        >
                            <LayoutGrid className="h-10 w-10 text-slate-200" />
                        </motion.div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Participations Empty</h3>
                        <p className="text-slate-500 font-medium italic mt-2">You haven't initialized or joined any active venture syndicates.</p>
                        <Button
                            variant="link"
                            className="mt-4 text-indigo-600 font-black uppercase text-xs tracking-widest gap-2"
                        >
                            Explore Open Opportunities <ArrowRight size={14} strokeWidth={3} />
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}
