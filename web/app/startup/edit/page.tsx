"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StartupForm from "@/components/startup/StartupForm";
import { apiFetchJSON } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function StartupEditPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStartup() {
      try {
        const data = await apiFetchJSON("/api/startup/me");
        if (data.success) {
          setInitialData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch startup profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStartup();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Edit Startup Profile</h1>
          <p className="text-zinc-500 mt-1">Keep your information up to date for investors.</p>
        </div>
        {initialData ? (
          <StartupForm mode="edit" initialData={initialData} />
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-zinc-100">
             <p className="text-zinc-500 font-medium">No startup profile found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
