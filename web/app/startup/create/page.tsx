"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StartupForm from "@/components/startup/StartupForm";

export default function StartupCreatePage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Create Startup Profile</h1>
          <p className="text-zinc-500 mt-1">Fill in the details to showcase your venture to top-tier investors.</p>
        </div>
        <StartupForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
