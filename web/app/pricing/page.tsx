"use client";

import { useState } from "react";
import { Check, Zap, Rocket, Wallet, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function PricingPage() {
  const [role, setRole] = useState<"startup" | "investor">("startup");
  const [loading, setLoading] = useState<string | null>(null);

  const startupPlans = [
    {
      name: "Free",
      price: "0",
      desc: "Essentials for early-stage stealth.",
      features: ["5 messages/mo", "Basic discovery", "Public profile", "Community access"],
      button: "Current Plan",
      color: "bg-slate-100 text-slate-900 border-none",
      planId: "free"
    },
    {
      name: "Pro",
      price: "1,499",
      desc: "Accelerate your fundraising velocity.",
      features: ["Unlimited messaging", "Contact unlock", "Priority discovery", "Pitch deck analytics"],
      button: "Go Pro",
      color: "bg-indigo-600 text-white shadow-xl shadow-indigo-100 border-none",
      popular: true,
      planId: "pro"
    },
    {
      name: "Premium",
      price: "3,999",
      desc: "Elite visibility for top 1% startups.",
      features: ["Featured badge", "Boost profile (7 days)", "AI Priority matching", "VDR Unlimited storage"],
      button: "Join Elite",
      color: "bg-slate-900 text-white shadow-xl shadow-slate-200 border-none",
      planId: "premium"
    }
  ];

  const investorPlans = [
    {
        name: "Free",
        price: "0",
        desc: "Browse premium deal flow.",
        features: ["Browse startups", "Basic filters", "Public profile"],
        button: "Current Plan",
        color: "bg-slate-100 text-slate-900 border-none",
        planId: "free"
    },
    {
        name: "Pro",
        price: "4,999",
        desc: "Advanced sourcing and outreach.",
        features: ["Contact founders", "Unlimited messaging", "Advanced sector filters", "Deal flow analytics"],
        button: "Upgrade Now",
        color: "bg-emerald-600 text-white shadow-xl shadow-emerald-100 border-none",
        popular: true,
        planId: "pro"
    },
    {
        name: "Premium",
        price: "9,999",
        desc: "Institutional grade intelligence.",
        features: ["Featured investor", "Top discover placement", "AI Smart deal flow", "Dedicated support"],
        button: "Go Premium",
        color: "bg-slate-900 text-white border-none",
        planId: "premium"
    }
  ];

  const plans = role === "startup" ? startupPlans : investorPlans;

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
        const res = await apiFetchJSON("/api/billing/create-checkout", {
            method: "POST",
            body: JSON.stringify({
                planId,
                successUrl: `${window.location.origin}/billing?success=true`,
                cancelUrl: `${window.location.origin}/pricing?canceled=true`
            })
        });

        if (res.success) {
            const stripe = await stripePromise;
            if (stripe) {
                await (stripe as any).redirectToCheckout({ sessionId: res.sessionId });
            }
        }
    } catch (error) {
        toast.error("Checkout failed");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-20 px-8 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-10"
      >
        <div className="space-y-4">
           <Badge className="bg-indigo-50 text-indigo-600 rounded-full px-6 py-1.5 font-black text-[10px] tracking-widest border-none">MEMBERSHIPS</Badge>
           <h1 className="text-6xl font-black tracking-tighter text-slate-900 italic leading-none">Choose Your Velocity</h1>
           <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-xl mx-auto pt-2">
             Select the strategic tier that aligns with your platform objectives
           </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-white p-1.5 rounded-3xl border border-slate-100 shadow-sm w-fit mx-auto">
           <button
             onClick={() => setRole("startup")}
             className={`px-10 h-14 rounded-[1.2rem] text-xs font-black tracking-widest transition-all italic flex items-center gap-2 ${
               role === "startup" ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-900'
             }`}
           >
             <Rocket size={16} /> FOR STARTUPS
           </button>
           <button
             onClick={() => setRole("investor")}
             className={`px-10 h-14 rounded-[1.2rem] text-xs font-black tracking-widest transition-all italic flex items-center gap-2 ${
               role === "investor" ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' : 'text-slate-400 hover:text-slate-900'
             }`}
           >
             <Wallet size={16} /> FOR INVESTORS
           </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
           {plans.map((plan, i) => (
             <motion.div
               key={plan.name}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="relative h-full"
             >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-6 py-1.5 rounded-full text-[10px] font-black tracking-widest z-10 shadow-lg border-2 border-white">
                    MOST POPULAR
                  </div>
                )}
                
                <div className={`h-full bg-white rounded-[3rem] p-10 flex flex-col border border-slate-100 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-500 overflow-hidden relative group`}>
                   {plan.name === 'Premium' && (
                     <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
                        <Star size={160} />
                     </div>
                   )}
                   
                   <div className="text-left space-y-6 flex-1 relative z-10">
                      <div>
                         <h3 className="text-2xl font-black italic text-slate-900 tracking-tighter">{plan.name}</h3>
                         <p className="text-slate-400 font-medium text-sm mt-1">{plan.desc}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                         <span className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{plan.price}</span>
                         <span className="text-slate-400 font-bold text-xs">/mo</span>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-50">
                         {plan.features.map(f => (
                           <div key={f} className="flex items-start gap-3">
                              <div className={`mt-1 p-1 rounded-full ${plan.popular ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                 <Check size={12} strokeWidth={4} />
                              </div>
                              <span className="text-slate-600 font-bold text-xs text-left leading-tight">{f}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <Button 
                    className={`mt-10 h-16 rounded-2xl font-black text-xs tracking-widest uppercase relative z-10 ${plan.color}`}
                    onClick={() => handleCheckout(plan.planId)}
                    disabled={loading === plan.planId || plan.planId === 'free'}
                   >
                      {loading === plan.planId ? "Processing..." : plan.button}
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="pt-20 border-t border-slate-100 text-center">
           <h4 className="text-slate-900 font-black italic tracking-tighter text-2xl flex items-center justify-center gap-3">
              Trusted by leading ecosystems <ShieldCheck className="text-indigo-600" size={24} />
           </h4>
           <div className="mt-10 flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-125">
              {['Techstars', 'Y Combinator', 'Kalaari', 'Accel', 'Sequoia'].map(brand => (
                <span key={brand} className="text-2xl font-black tracking-tighter">{brand.toUpperCase()}</span>
              ))}
           </div>
        </div>
      </motion.div>
    </div>
  );
}
