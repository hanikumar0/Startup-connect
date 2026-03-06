import { Rocket, ShieldCheck, Zap, MessageSquare, Video, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-indigo-600 to-zinc-900 bg-[length:200%_auto] animate-gradient-x">Startup Connect</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-indigo-600 underline-offset-4 hover:underline">Features</Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-indigo-600 underline-offset-4 hover:underline">About</Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-zinc-600">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 px-6 font-bold">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-7xl blur-[140px] opacity-[0.15] bg-gradient-to-r from-indigo-400 via-purple-500 to-emerald-400 pointer-events-none rounded-full" />
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="container relative z-10 mx-auto px-4 text-center sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 py-1.5 px-6 text-indigo-600 border-indigo-200 bg-indigo-50/50 backdrop-blur-sm font-bold text-xs uppercase tracking-widest gap-2">
                <Sparkles className="h-3 w-3" />
                Next Generation Venture Marketplace
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto max-w-5xl text-6xl font-extrabold tracking-tight text-zinc-900 sm:text-8xl lg:leading-[1.05]"
            >
              Securely Connect <span className="text-indigo-600 drop-shadow-sm transition-all hover:text-indigo-700">Startups</span> <br className="hidden lg:block" /> with <span className="text-indigo-600">Investors</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 sm:text-xl font-medium"
            >
              The industry-first AI hyper-marketplace bridging the trust gap between innovative founders and the right strategic capital.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row"
            >
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 font-bold text-base">
                  Join as Startup <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?role=investor">
                <Button size="lg" variant="outline" className="h-14 px-10 border-zinc-200 hover:bg-zinc-50 rounded-2xl transition-all hover:scale-105 active:scale-95 font-bold text-base bg-white/50 backdrop-blur-sm">
                  Join as Investor
                </Button>
              </Link>
            </motion.div>

            {/* Visual Element */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-28 flex justify-center perspective-1000"
            >
              <div className="relative h-80 w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white/50 backdrop-blur-xl p-3 shadow-2xl rotate-1 group">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
                <div className="h-full w-full rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Rocket className="h-12 w-12 text-zinc-300 group-hover:text-indigo-600 group-hover:scale-125 transition-all duration-700" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center px-4">
                    <div className="h-2 w-32 bg-zinc-200 rounded-full" />
                    <div className="h-8 w-8 bg-indigo-100 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
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
                { title: "Real-time Verification", description: "Seamless government-backed Identity verification using robust APIs.", icon: ShieldCheck, color: "indigo" },
                { title: "AI-Powered Matching", description: "Higher match precision with proprietary vector similarity engines.", icon: Zap, color: "emerald" },
                { title: "Secure Data Rooms", description: "Encrypted virtual data rooms with precise granular access controls.", icon: MessageSquare, color: "purple" },
                { title: "Native Video Chat", description: "Experience zero-lag, built-in WebRTC based video conferencing.", icon: Video, color: "blue" },
                { title: "Portfolio Tracking", description: "Real-time telemetry and deal lifecycle management for investors.", icon: Rocket, color: "rose" },
                { title: "Smart Contracts", description: "Automated logic for digital agreements and term sheet distributions.", icon: Sparkles, color: "amber" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-none shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 group relative overflow-hidden h-full bg-white">
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="pt-8 px-8 pb-10 text-center sm:text-left relative z-10 flex flex-col items-center sm:items-start h-full">
                      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-indigo-600 shadow-sm border border-zinc-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                        <feature.icon className="h-7 w-7" />
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-zinc-900">{feature.title}</h3>
                      <p className="text-zinc-500 leading-relaxed font-medium">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
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
