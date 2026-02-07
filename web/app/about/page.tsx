import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Rocket,
    Target,
    Users,
    Zap,
    ShieldCheck,
    Globe,
    MessageSquare,
    TrendingUp,
    ArrowLeft
} from "lucide-react";

export const metadata = {
    title: "About Us | Startup Connect",
    description: "Learn how Startup Connect is revolutionizing fundraising through AI-powered matchmaking and a trusted global ecosystem.",
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            <Rocket className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-zinc-900">Startup Connect</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" /> Back to Home
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 pt-32 pb-20">
                {/* Header Section */}
                <section className="container mx-auto px-4 text-center sm:px-6 mb-20 lg:mb-32">
                    <Badge variant="outline" className="mb-4 py-1 px-4 text-indigo-600 border-indigo-100 bg-indigo-50/50">
                        About Startup Connect
                    </Badge>
                    <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl lg:leading-[1.1] mb-8">
                        Connecting ideas with the <span className="text-indigo-600">right capital.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
                        Startup Connect is an AI-powered platform that connects startups with the right investors. We simplify fundraising by using intelligent matchmaking to align founders and investors based on vision, industry, and growth stage.
                    </p>
                </section>

                {/* Why We Exist Section */}
                <section className="bg-zinc-50 py-24 sm:py-32 overflow-hidden">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-6">Why We Exist</h2>
                                <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                                    Raising funds is not just about money—it’s about finding the right partner. Many startups struggle to reach the right investors, while investors spend time filtering unsuitable opportunities.
                                </p>
                                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
                                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                                        <Target className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Our Solution</h3>
                                        <p className="text-zinc-600">Startup Connect solves this problem by creating meaningful, data-driven connections.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full"></div>
                                <div className="relative grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="h-40 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <Zap className="h-8 w-8 text-amber-500 mb-2" />
                                            <span className="font-semibold">Fast Growth</span>
                                        </div>
                                        <div className="h-40 bg-zinc-900 rounded-2xl text-white shadow-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                                            <Users className="h-8 w-8 text-indigo-400 mb-2" />
                                            <span className="font-semibold">Right Partners</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-8">
                                        <div className="h-40 bg-indigo-600 rounded-2xl text-white shadow-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-6 duration-600">
                                            <ShieldCheck className="h-8 w-8 text-indigo-200 mb-2" />
                                            <span className="font-semibold">Trusted Vetting</span>
                                        </div>
                                        <div className="h-40 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-10 duration-800">
                                            <Globe className="h-8 w-8 text-blue-500 mb-2" />
                                            <span className="font-semibold">Global Reach</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What We Do Section */}
                <section className="py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6 text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">What We Do</h2>
                    </div>
                    <div className="container mx-auto px-4 sm:px-6 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                title: "AI Matchmaking",
                                desc: "Match startups and investors using AI semantic algorithms.",
                                icon: Zap,
                                color: "text-amber-500",
                                bg: "bg-amber-50"
                            },
                            {
                                title: "Smart Discovery",
                                desc: "Help investors discover high-potential startups efficiently.",
                                icon: Target,
                                color: "text-indigo-600",
                                bg: "bg-indigo-50"
                            },
                            {
                                title: "Direct Chat",
                                desc: "Enable secure and direct communication between founders and investors.",
                                icon: MessageSquare,
                                color: "text-blue-500",
                                bg: "bg-blue-50"
                            },
                            {
                                title: "Data Decisions",
                                desc: "Support faster and smarter funding decisions with data insights.",
                                icon: TrendingUp,
                                color: "text-emerald-500",
                                bg: "bg-emerald-50"
                            },
                        ].map((item, i) => (
                            <Card key={i} className="border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                                <CardContent className="pt-8">
                                    <div className={`mb-4 h-12 w-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                    <p className="text-zinc-600 text-sm leading-relaxed">{item.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section className="bg-zinc-900 text-white py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-24">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl border-l-4 border-indigo-600 pl-6">Our Mission</h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                To make fundraising accessible, efficient, and transparent for startups while helping investors identify the right opportunities with confidence.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl border-l-4 border-indigo-600 pl-6">Our Vision</h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                To build a trusted global ecosystem where innovation meets investment through technology.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Who It's For Section */}
                <section className="py-24 sm:py-32">
                    <div className="container mx-auto px-4 sm:px-6 text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-4">Who It’s For</h2>
                        <p className="text-zinc-600">Empowering every stakeholder in the innovation economy.</p>
                    </div>
                    <div className="container mx-auto px-4 sm:px-6 grid gap-8 md:grid-cols-3">
                        {[
                            { type: "Founders", entities: "Startups at early and growth stages", icon: Rocket },
                            { type: "Investors", entities: "Angel investors and venture capitalists", icon: Users },
                            { type: "Ecosystem", entities: "Accelerators and innovation networks", icon: Globe },
                        ].map((user, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:border-indigo-100 transition-colors">
                                <div className="mb-6 h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center text-indigo-600">
                                    <user.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{user.type}</h3>
                                <p className="text-zinc-600">{user.entities}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Our Promise Section */}
                <section className="bg-indigo-600 py-20 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white blur-3xl -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white blur-3xl translate-x-1/2 translate-y-1/2 rounded-full"></div>
                    </div>
                    <div className="container relative z-10 mx-auto px-4 sm:px-6 text-center max-w-3xl">
                        <h2 className="text-3xl font-bold text-white mb-6">Our Promise</h2>
                        <p className="text-indigo-100 text-lg leading-relaxed mb-10">
                            We are committed to building a reliable, secure, and growth-focused platform that supports long-term success for both startups and investors.
                        </p>
                        <Link href="/register">
                            <Button size="lg" className="bg-white text-indigo-600 hover:bg-zinc-100 font-bold px-12 h-14 rounded-full">
                                Join the Mission
                            </Button>
                        </Link>
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
                    <p className="text-sm text-zinc-500 mb-2">Connecting ideas with the right capital.</p>
                    <p className="text-xs text-zinc-400">
                        © {new Date().getFullYear()} Startup Connect. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
