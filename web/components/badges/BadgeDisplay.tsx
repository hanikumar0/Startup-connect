"use client";

import { cn } from "@/lib/utils";
import { 
  ShieldCheck, Building2, TrendingUp, Zap, User, Star,
  Activity, Clock, Award, Crown, GraduationCap, BrainCircuit, Network
} from "lucide-react";

const BADGE_META: Record<string, { label: string; color: string; icon: string; bg: string; border: string }> = {
  // Startup badges
  verified_startup:   { label: "Verified Startup",   color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-100", icon: "ShieldCheck" },
  registered_company: { label: "Registered Company", color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-100",   icon: "Building2" },
  raising_now:        { label: "Raising Now",        color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-100", icon: "TrendingUp" },
  high_traction:      { label: "High Traction",      color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100",  icon: "Zap" },
  active_founder:     { label: "Active Founder",     color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100", icon: "User" },
  top_rated_startup:  { label: "Top Rated Startup",  color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-100", icon: "Star" },
  // Investor badges
  verified_investor:  { label: "Verified Investor",  color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-100", icon: "ShieldCheck" },
  active_investor:    { label: "Active Investor",    color: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-100", icon: "Activity" },
  recent_investor:    { label: "Recent Investor",    color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-100",   icon: "Clock" },
  trusted_vc:         { label: "Trusted VC",         color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100", icon: "Award" },
  fast_responder:     { label: "Fast Responder",     color: "text-green-600",  bg: "bg-green-50",   border: "border-green-100",  icon: "Zap" },
  premium_investor:   { label: "Premium Investor",   color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100",  icon: "Crown" },
  // Mentor badges
  trusted_mentor:     { label: "Trusted Mentor",     color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-100", icon: "GraduationCap" },
  expert_advisor:     { label: "Expert Advisor",     color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-100", icon: "BrainCircuit" },
  top_connector:      { label: "Top Connector",      color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-100",   icon: "Network" },
};

const ICON_MAP: Record<string, any> = {
  ShieldCheck, Building2, TrendingUp, Zap, User, Star,
  Activity, Clock, Award, Crown, GraduationCap, BrainCircuit, Network
};

interface BadgeDisplayProps {
  badges: string[];
  size?: "xs" | "sm" | "md";
  max?: number;
  className?: string;
  showTooltip?: boolean;
}

export function BadgeDisplay({ badges = [], size = "sm", max = 4, className, showTooltip = true }: BadgeDisplayProps) {
  if (!badges?.length) return null;

  const visible = badges.slice(0, max);
  const overflow = badges.length - max;

  const sizeClasses = {
    xs: { pill: "px-1.5 py-0.5 text-[9px] gap-1", icon: 10 },
    sm: { pill: "px-2 py-1 text-[10px] gap-1.5", icon: 12 },
    md: { pill: "px-3 py-1.5 text-[11px] gap-2", icon: 14 },
  };

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((badge) => {
        const meta = BADGE_META[badge];
        if (!meta) return null;
        const Icon = ICON_MAP[meta.icon] || ShieldCheck;
        return (
          <span
            key={badge}
            title={showTooltip ? meta.label : undefined}
            className={cn(
              "inline-flex items-center font-bold rounded-full border transition-all",
              sizeClasses[size].pill,
              meta.color,
              meta.bg,
              meta.border
            )}
          >
            <Icon size={sizeClasses[size].icon} strokeWidth={2.5} />
            <span>{meta.label}</span>
          </span>
        );
      })}
      {overflow > 0 && (
        <span className={cn(
          "inline-flex items-center font-bold rounded-full border",
          sizeClasses[size].pill,
          "text-slate-500 bg-slate-50 border-slate-100"
        )}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

/** Single badge pill — for cards */
export function BadgePill({ badge, size = "sm" }: { badge: string; size?: "xs" | "sm" | "md" }) {
  const meta = BADGE_META[badge];
  if (!meta) return null;
  const Icon = ICON_MAP[meta.icon] || ShieldCheck;

  const sizeClasses = {
    xs: { pill: "px-1.5 py-0.5 text-[9px] gap-1", icon: 10 },
    sm: { pill: "px-2 py-1 text-[10px] gap-1.5", icon: 12 },
    md: { pill: "px-3 py-1.5 text-[11px] gap-2", icon: 14 },
  };

  return (
    <span className={cn(
      "inline-flex items-center font-bold rounded-full border",
      sizeClasses[size].pill,
      meta.color, meta.bg, meta.border
    )}>
      <Icon size={sizeClasses[size].icon} strokeWidth={2.5} />
      <span>{meta.label}</span>
    </span>
  );
}

export { BADGE_META };
