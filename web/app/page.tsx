import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, ShieldCheck, Zap, MessageSquare, Video, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Startup Connect</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-indigo-600">Features</Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-indigo-600">About</Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="container relative z-10 mx-auto px-4 text-center sm:px-6">
            <Badge variant="outline" className="mb-4 py-1 px-4 text-indigo-600 border-indigo-100 bg-indigo-50/50">
              Transforming the Startup Ecosystem
            </Badge>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl lg:leading-[1.1]">
              Securely Connect <span className="text-indigo-600">Startups</span> with <span className="text-indigo-600">Investors</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
              An AI-powered marketplace connecting startups with the right investors for smarter, faster growth.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Join as Startup <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?role=investor">
                <Button size="lg" variant="outline" className="h-12 px-8 border-zinc-200 hover:bg-zinc-50">
                  Join as Investor
                </Button>
              </Link>
            </div>

            {/* Visual Element */}
            <div className="mt-20 flex justify-center opacity-40">
              <div className="relative h-64 w-full max-w-4xl rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-400 to-transparent"></div>
                <div className="flex h-full items-center justify-center text-zinc-400">
                  [ Interactive Matching Dashboard Visualization ]
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-zinc-50 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Platform Capabilities</h2>
              <p className="mt-4 text-zinc-600">Everything you need to secure funding or find your next unicorn.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Real-time Verification", description: "Identity verification using Aadhaar, PAN, and GST via government APIs.", icon: ShieldCheck },
                { title: "AI-Powered Matching", description: "Smart recommendation engine connecting founders with relevant capital interests.", icon: Zap },
                { title: "Encrypted Communication", description: "End-to-end encrypted chat and secure document sharing for sensitive deals.", icon: MessageSquare },
                { title: "Video Meetings", description: "Integrated WebRTC-based video conferencing and meeting scheduling.", icon: Video },
                { title: "Deal Flow Management", description: "Track your interaction history and manage pitch decks effortlessly.", icon: Rocket },
                { title: "Verified Identity", description: "Trust marks for startups and investors who complete the verified e-KYC process.", icon: ShieldCheck },
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-sm transition-all hover:shadow-md">
                  <CardContent className="pt-8 text-center sm:text-left">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm border border-zinc-100">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="text-zinc-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 bg-white py-12">
        <div className="container mx-auto px-4 text-center sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white">
              <Rocket className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight">Startup Connect</span>
          </div>
          <div className="flex justify-center gap-6 mb-8 text-sm font-medium text-zinc-500">
            <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/login" className="hover:text-indigo-600 transition-colors">Login</Link>
          </div>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Startup Connect. All rights reserved. BTech Final Year Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
