"use client"

import { SyndicateRoom } from "@/components/deals/SyndicateRoom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, List, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DealsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Syndicate Lounge</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Co-invest with industry leaders in high-growth startups.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none gap-2">
                    <Plus size={18} />
                    Create Syndicate
                </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <TabsList className="bg-slate-100 dark:bg-slate-900 p-1">
                        <TabsTrigger value="active">Active Deals</TabsTrigger>
                        <TabsTrigger value="portfolio">Participating</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search deals..." className="pl-9 h-10 w-48 lg:w-64 dark:bg-slate-900 dark:border-slate-800" />
                        </div>
                        <Button variant="outline" size="icon" className="h-10 w-10 dark:border-slate-800">
                            <Filter size={18} />
                        </Button>
                    </div>
                </div>

                <TabsContent value="active" className="space-y-12">
                    <SyndicateRoom />
                </TabsContent>

                <TabsContent value="portfolio">
                    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <p className="text-slate-500">You haven't joined any syndicates yet.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
