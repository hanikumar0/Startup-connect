"use client";

import { Rocket, ShieldCheck, Zap, MessageSquare, Video, ArrowRight, Sparkles, Target, BarChart3, Lock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrustRadar } from "@/components/TrustRadar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* SaaS Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1280px] mx-auto h-16 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Rocket className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">Startup Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">How it Works</Link>
            <Link href="#trust" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Verification</Link>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
               <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Sign in</Link>
               <Link href="/register">
                 <Button className="h-9 px-4 bg-primary text-white rounded-md text-sm font-semibold shadow-sm hover:bg-primary/90 transition-all">Get Started</Button>
               </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        
        {/* Crisp Hero Section */}
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-[1280px] mx-auto text-center space-y-8">
             <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>AI Matching Engine Now Live</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.05]">
               The Institutional Grade <br />
               Matchmaking Engine.
             </h1>
             <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
               Connecting the next generation of founders and investors with precision matches, automated diligence, and institutional trust.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                   <Button className="h-12 px-8 rounded-md bg-primary text-white font-semibold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                     Start Matching
                   </Button>
                </Link>
                <Button variant="outline" className="h-12 px-8 rounded-md border-slate-200 bg-white text-slate-900 font-semibold text-base hover:bg-slate-50 transition-all">
                   View Features
                </Button>
             </div>
             
             {/* Product Preview */}
             <div className="pt-16 max-w-5xl mx-auto">
                <div className="rounded-xl border border-border bg-slate-50 p-4 shadow-2xl relative">
                   <div className="aspect-video rounded-lg bg-white border border-border shadow-sm flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                         <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                            <Video className="h-6 w-6 text-primary" />
                         </div>
                         <p className="text-sm font-bold uppercase tracking-widest">Platform Discovery Preview</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 md:border-t md:border-slate-100">
          <div className="max-w-[1280px] mx-auto">
            <header className="text-center mb-16 space-y-4">
               <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Platform Pillars</h2>
               <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Everything you need to raise.</h3>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 {
                   title: "Intent-Based Matching",
                   desc: "Proprietary AI scoring engine that prioritizes signal over noise, connecting only the perfect stage and sector matches.",
                   icon: Zap
                 },
                 {
                   title: "Institutional Vetting",
                   desc: "Every profile undergoes a rigorous E-KYC process. No fake interest, no wasted meetings. Real verified data.",
                   icon: ShieldCheck
                 },
                 {
                   title: "Unified Diligence",
                   desc: "Manage your full fundraising funnel, track interactions, and manage pitch documents from a single, secure vault.",
                   icon: Lock
                 }
               ].map((f, i) => (
                 <div key={i} className="space-y-4 p-8 rounded-xl border border-border bg-white shadow-sm hover:border-primary/20 transition-all hover:shadow-lg">
                    <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-primary">
                       <f.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                       {f.desc}
                    </p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* How It Works - RESTORED FEATURE */}
        <section id="how-it-works" className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#1d4ed8_0%,transparent_50%)] opacity-20" />
           <div className="max-w-[1280px] mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">The Process</h2>
                       <h3 className="text-4xl lg:text-5xl font-bold tracking-tight">From signup to term sheet.</h3>
                    </div>
                    <div className="space-y-8">
                       {[
                         { step: '01', title: 'Institutional Verification', desc: 'Secure your profile with our real-time E-KYC gateway.' },
                         { step: '02', title: 'Targeted Discovery', desc: 'Our AI engine maps your data against our private investor network.' },
                         { step: '03', title: 'Secure Diligence', desc: 'Execute meetings and data room access within a secure, encrypted dashboard.' }
                       ].map((s, i) => (
                         <div key={i} className="flex gap-6">
                            <span className="text-2xl font-black text-primary/40 underline decoration-primary underline-offset-8">{s.step}</span>
                            <div className="space-y-2">
                               <h4 className="text-xl font-bold">{s.title}</h4>
                               <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                    <div className="space-y-6 text-center">
                       <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                          <BarChart3 size={24} />
                       </div>
                       <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Yield focused matching</h4>
                       <div className="h-64 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center">
                          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Match Visualization Engine</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Verification Engine - RESTORED FEATURE (TrustRadar) */}
        <section id="trust" className="py-24 px-6">
           <div className="max-w-[1280px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                 <div className="lg:col-span-5 space-y-8">
                    <header className="space-y-4">
                       <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Zero Trust Networking</h2>
                       <h3 className="text-4xl font-bold text-slate-900 tracking-tight">The Trust Radar Engine.</h3>
                    </header>
                    <p className="text-lg text-slate-600 leading-relaxed">
                       We score every participant across five critical dimension of institutional readiness. High scores unlock exclusive tier-1 deal flow and premium investor pools.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Verified</p>
                          <p className="text-2xl font-bold text-slate-900">$2.4B+</p>
                       </div>
                       <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
                          <p className="text-2xl font-bold text-slate-900">420+</p>
                       </div>
                    </div>
                 </div>
                 <div className="lg:col-span-7 flex flex-col items-center">
                    <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-border shadow-2xl relative">
                       <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                       <TrustRadar scores={{ identity: 95, financials: 88, team: 92, legal: 84, traction: 98 }} />
                       <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                          <div className="space-y-1">
                             <p className="text-xs font-bold text-slate-900">ELITE STATUS</p>
                             <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Score: 91.4</p>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px]">VERIFIED ASSET</Badge>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Platform Integrity Summary */}
        <section className="py-24 px-6 bg-slate-50 border-y border-border">
           <div className="max-w-[800px] mx-auto text-center space-y-8">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                 <ShieldCheck size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Built on Transparency and Trust</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Startup Connect is a closed ecosystem. Every participant is verified through a rigorous institutional vetting process to ensure high-signal interactions and zero noise.
              </p>
           </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="py-16 px-6 bg-white border-t border-border">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-white">
                   <Rocket className="h-3 w-3" />
                </div>
                <span className="text-md font-bold tracking-tight text-slate-900 uppercase">Startup Connect</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">Connecting the next generation of founders and investors with precision matches.</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product</h4>
                 <ul className="space-y-2">
                    <li><Link href="/" className="text-sm text-slate-500 hover:text-primary transition-colors">Features</Link></li>
                    <li><Link href="/pricing" className="text-sm text-slate-500 hover:text-primary transition-colors">Pricing</Link></li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Company</h4>
                 <ul className="space-y-2">
                    <li><Link href="/about" className="text-sm text-slate-500 hover:text-primary transition-colors">About</Link></li>
                    <li><Link href="/contact" className="text-sm text-slate-500 hover:text-primary transition-colors">Contact</Link></li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Legal</h4>
                 <ul className="space-y-2">
                    <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-primary transition-colors">Privacy</Link></li>
                    <li><Link href="/terms" className="text-sm text-slate-500 hover:text-primary transition-colors">Terms</Link></li>
                 </ul>
              </div>
           </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-xs text-slate-400">© {new Date().getFullYear()} Startup Connect. All rights reserved.</p>
           <div className="flex gap-6">
              <div className="h-5 w-5 rounded bg-slate-100" />
              <div className="h-5 w-5 rounded bg-slate-100" />
              <div className="h-5 w-5 rounded bg-slate-100" />
           </div>
        </div>
      </footer>
    </div>
  );
}
