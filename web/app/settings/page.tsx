"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/lib/store";
import { User as UserIcon, ShieldCheck, Bell, Lock, CreditCard, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 pt-2">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Settings
            </h1>
            <p className="text-sm text-slate-500">
              Manage your account preferences and public profile.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-10 px-4">Cancel</Button>
             <Button className="h-10 px-6 bg-primary text-white hover:bg-primary/90">Save Changes</Button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Settings Sidebar nav */}
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 shrink-0 lg:w-48">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-left whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Settings Content */}
          <div className="flex-1 space-y-10">
            {activeTab === "profile" && (
              <>
                <section className="space-y-6">
                  <div>
                    <h2 className="text-xl font-medium tracking-tight text-slate-900">Public Profile</h2>
                    <p className="text-sm text-slate-500 mt-1">Control how your information appears to others on the platform.</p>
                  </div>
                  
                  <div className="p-6 rounded-xl border border-border bg-white shadow-sm space-y-8">
                    
                    {/* Toggle UI */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold text-slate-900">Profile Visibility</Label>
                        <p className="text-sm text-slate-500">Make your profile discoverable by investors and partners.</p>
                      </div>
                      
                      <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isPublic ? "bg-primary" : "bg-slate-200"
                        )}
                        role="switch"
                        aria-checked={isPublic}
                      >
                        <span className="sr-only">Toggle Public Profile</span>
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            isPublic ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Profile Preview Card */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-slate-900">Profile Preview</Label>
                      <div className="relative p-6 rounded-xl border border-border bg-slate-50/50 flex flex-col sm:flex-row gap-6 items-start">
                        <div className="absolute top-4 right-4">
                          <Button variant="outline" size="sm" className="h-8 text-xs font-medium">Live Preview</Button>
                        </div>
                        
                        <div className="h-20 w-20 rounded-full bg-white border border-border flex items-center justify-center text-slate-400 shrink-0 shadow-sm overflow-hidden">
                           {user?.avatar ? (
                             <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                           ) : (
                             <UserIcon size={32} />
                           )}
                        </div>
                        
                        <div className="space-y-2 pt-1 flex-1">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{user?.name || 'Your Name'}</h3>
                            <p className="text-sm text-slate-500 capitalize">{user?.role || 'Founder'} • Member since 2024</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-2">
                             <span className="px-2.5 py-1 rounded-md bg-white border border-border text-xs font-medium text-slate-600">SaaS</span>
                             <span className="px-2.5 py-1 rounded-md bg-white border border-border text-xs font-medium text-slate-600">B2B</span>
                             <span className="px-2.5 py-1 rounded-md bg-white border border-border text-xs font-medium text-slate-600">Pre-seed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div>
                    <h2 className="text-xl font-medium tracking-tight text-slate-900">Personal Information</h2>
                    <p className="text-sm text-slate-500 mt-1">Update your basic profile details.</p>
                  </div>
                  
                  <div className="p-6 rounded-xl border border-border bg-white shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-sm font-medium text-slate-900">Full Name</Label>
                         <Input defaultValue={user?.name} className="h-10" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-sm font-medium text-slate-900">Email Address</Label>
                         <Input defaultValue={user?.email} className="h-10" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                         <Label className="text-sm font-medium text-slate-900">Bio</Label>
                         <textarea 
                           className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]" 
                           placeholder="Tell us a little bit about yourself..."
                         />
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === "security" && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-slate-900">Security</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your password and security settings.</p>
                </div>
                
                <div className="p-6 rounded-xl border border-border bg-white shadow-sm space-y-6 max-w-xl">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-sm font-medium text-slate-900">Current Password</Label>
                       <Input type="password" placeholder="••••••••" className="h-10" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-sm font-medium text-slate-900">New Password</Label>
                       <Input type="password" placeholder="New Password" className="h-10" />
                    </div>
                  </div>
                  <Button className="h-10 px-6">Update Password</Button>
                </div>
              </section>
            )}

            {activeTab === "notifications" && (
               <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-slate-900">Notifications</h2>
                  <p className="text-sm text-slate-500 mt-1">Choose what updates you want to receive.</p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-white shadow-sm">
                   <p className="text-sm text-slate-500">Notification settings coming soon.</p>
                </div>
               </section>
            )}

            {activeTab === "billing" && (
               <section className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-slate-900">Billing</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your subscription and payment methods.</p>
                </div>
                <div className="p-8 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                   <div className="flex items-center gap-3 text-primary mb-2">
                      <CreditCard size={24} />
                      <h3 className="text-lg font-semibold">Pro Plan</h3>
                   </div>
                   <p className="text-sm text-slate-700 max-w-md">You are currently on the Pro plan. You have access to all premium features including unlimited matches and priority support.</p>
                   <div className="pt-4">
                     <Button className="h-10 bg-white text-slate-900 border border-border hover:bg-slate-50 shadow-sm">Manage Subscription</Button>
                   </div>
                </div>
               </section>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
