"use client";

import { useEffect, useState } from "react";
import { 
  Bell, Check, Trash2, Settings, Filter, Loader2,
  ShieldCheck, Target, MessageSquare, Calendar, 
  Sparkles, Trophy, TrendingUp, Zap, User, Star,
  AlertTriangle, Info, AlertCircle
} from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// ─── Type → Icon & Color map ──────────────────────────────────────────────────
const TYPE_META: Record<string, { icon: any; color: string; bg: string }> = {
  new_investor_match:       { icon: Target,       color: "text-indigo-600", bg: "bg-indigo-50" },
  investor_viewed_profile:  { icon: User,         color: "text-blue-600",   bg: "bg-blue-50" },
  warm_intro_available:     { icon: Sparkles,     color: "text-violet-600", bg: "bg-violet-50" },
  grant_deadline_soon:      { icon: Trophy,       color: "text-amber-600",  bg: "bg-amber-50" },
  funding_score_improved:   { icon: TrendingUp,   color: "text-emerald-600",bg: "bg-emerald-50" },
  high_fit_startup_added:   { icon: Zap,          color: "text-indigo-600", bg: "bg-indigo-50" },
  startup_entered_sector:   { icon: Target,       color: "text-blue-600",   bg: "bg-blue-50" },
  startup_round_closing:    { icon: AlertTriangle,color: "text-red-500",    bg: "bg-red-50" },
  intro_request_received:   { icon: Sparkles,     color: "text-violet-600", bg: "bg-violet-50" },
  due_diligence_shared:     { icon: ShieldCheck,  color: "text-emerald-600",bg: "bg-emerald-50" },
  new_message:              { icon: MessageSquare,color: "text-slate-600",  bg: "bg-slate-50" },
  verification_approved:    { icon: ShieldCheck,  color: "text-emerald-600",bg: "bg-emerald-50" },
  badge_awarded:            { icon: Star,         color: "text-amber-600",  bg: "bg-amber-50" },
  feature_unlocked:         { icon: Zap,          color: "text-indigo-600", bg: "bg-indigo-50" },
  platform_announcement:    { icon: Bell,         color: "text-slate-600",  bg: "bg-slate-50" },
  new_grant_match:          { icon: Trophy,       color: "text-emerald-600",bg: "bg-emerald-50" },
  accelerator_match:        { icon: Trophy,       color: "text-indigo-600", bg: "bg-indigo-50" },
  meeting_request:          { icon: Calendar,     color: "text-purple-600", bg: "bg-purple-50" },
  meeting_accepted:         { icon: Calendar,     color: "text-emerald-600",bg: "bg-emerald-50" },
  reminder_15min:           { icon: Calendar,     color: "text-amber-600",  bg: "bg-amber-50" },
  profile_viewed:           { icon: User,         color: "text-blue-600",   bg: "bg-blue-50" },
  startup_saved:            { icon: Star,         color: "text-amber-600",  bg: "bg-amber-50" },
  investor_saved:           { icon: Star,         color: "text-amber-600",  bg: "bg-amber-50" },
  identity_verified:        { icon: ShieldCheck,  color: "text-emerald-600",bg: "bg-emerald-50" },
  system_alert:             { icon: Info,         color: "text-slate-600",  bg: "bg-slate-50" },
};

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  critical:  { label: "Critical",  color: "text-red-600",    bg: "bg-red-50" },
  important: { label: "Important", color: "text-amber-600",  bg: "bg-amber-50" },
  info:      { label: "Info",      color: "text-slate-500",  bg: "bg-slate-50" },
};

const FILTER_TABS = ["All", "Unread", "Critical", "Important", "Info"] as const;
type FilterTab = typeof FILTER_TABS[number];

// ─── Preferences Panel ────────────────────────────────────────────────────────
function PreferencesPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetchJSON("/api/badges/preferences").then((res) => {
      if (res.success) setPrefs(res.alertPreferences);
    });
  }, []);

  const handleToggle = (key: string, value: boolean) => {
    setPrefs((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await apiFetchJSON("/api/badges/preferences", {
      method: "PUT",
      body: JSON.stringify(prefs),
    });
    setSaving(false);
    onClose();
  };

  if (!prefs) return <div className="p-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-indigo-600" /></div>;

  const toggleItems = [
    { key: "emailAlerts", label: "Email Alerts", desc: "Receive alerts via email" },
    { key: "investorMatch", label: "Investor Matches", desc: "New match notifications" },
    { key: "profileViewed", label: "Profile Views", desc: "When someone views your profile" },
    { key: "grantAlerts", label: "Grant Alerts", desc: "Deadlines and new opportunities" },
    { key: "meetingReminders", label: "Meeting Reminders", desc: "15min before meetings" },
    { key: "marketingAlerts", label: "Platform News", desc: "Product updates and announcements" },
  ];

  return (
    <Card className="rounded-[28px] border border-slate-100 shadow-xl">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Alert Preferences</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 text-xs font-bold">✕</button>
        </div>

        {/* Mode */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Delivery Mode</p>
          <div className="flex gap-2">
            {["instant", "daily_digest", "weekly_digest"].map((mode) => (
              <button
                key={mode}
                onClick={() => setPrefs((p: any) => ({ ...p, mode }))}
                className={cn(
                  "flex-1 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                  prefs.mode === mode
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-500 border-slate-100 hover:border-indigo-100"
                )}
              >
                {mode.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alert Types</p>
          {toggleItems.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-[10px] text-slate-400">{desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key] ?? true}
                onClick={() => handleToggle(key, !(prefs[key] ?? true))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none ${(prefs[key] ?? true) ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ${(prefs[key] ?? true) ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11 bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-2xl"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    const res = await apiFetchJSON("/api/notifications");
    if (res.success) {
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    }
    setIsLoading(false);
  };

  const markRead = async (id: string) => {
    await apiFetchJSON(`/api/notifications/read/${id}`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await apiFetchJSON("/api/notifications/read-all", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id: string) => {
    await apiFetchJSON(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "Unread") return !n.isRead;
    if (activeFilter === "Critical") return n.priority === "critical";
    if (activeFilter === "Important") return n.priority === "important";
    if (activeFilter === "Info") return n.priority === "info";
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-3xl mx-auto">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>ALERTS</span>
          <span className="h-1 w-1 bg-slate-300 rounded-full" />
          <span className="text-slate-600">SMART NOTIFICATIONS</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Alerts</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="rounded-xl text-[10px] font-bold uppercase tracking-wider"
              >
                <Check size={12} className="mr-1" /> Mark All Read
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPrefs(!showPrefs)}
              className="rounded-xl"
              title="Alert Preferences"
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Preferences Panel */}
      {showPrefs && <PreferencesPanel onClose={() => setShowPrefs(false)} />}

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-50 rounded-2xl p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
              activeFilter === tab
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-slate-700"
            )}
          >
            {tab}
            {tab === "Unread" && unreadCount > 0 && (
              <span className="h-4 min-w-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((n) => {
            const typeMeta = TYPE_META[n.type] || TYPE_META.system_alert;
            const priorityMeta = PRIORITY_META[n.priority] || PRIORITY_META.info;
            const Icon = typeMeta.icon;

            return (
              <div
                key={n._id}
                onClick={() => {
                  if (!n.isRead) markRead(n._id);
                  if (n.link) window.location.href = n.link;
                }}
                className={cn(
                  "group flex gap-4 p-5 rounded-[20px] border transition-all cursor-pointer",
                  n.isRead
                    ? "bg-white border-slate-50 hover:border-indigo-50 hover:bg-slate-50/50"
                    : "bg-indigo-50/30 border-indigo-100 hover:border-indigo-200"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "mt-0.5 h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  !n.isRead ? `${typeMeta.bg} ${typeMeta.color}` : "bg-slate-100 text-slate-400"
                )}>
                  <Icon size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      "text-sm leading-snug",
                      n.isRead ? "font-semibold text-slate-600" : "font-bold text-slate-900"
                    )}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {n.priority && n.priority !== "info" && (
                        <span className={cn(
                          "text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                          priorityMeta.color, priorityMeta.bg
                        )}>
                          {priorityMeta.label}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!n.isRead && <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-300 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-[32px] border border-slate-50">
          <CardContent className="p-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <Bell size={28} strokeWidth={1} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 uppercase italic">Silence is Strategic</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {activeFilter !== "All" ? `No ${activeFilter.toLowerCase()} alerts` : "No alerts found"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
