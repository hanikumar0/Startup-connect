"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InvestorForm from "@/components/investor/InvestorForm";
import { apiFetchJSON } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function InvestorEditPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInvestor() {
      try {
        const data = await apiFetchJSON("/api/investor/me");
        if (data.success) {
          setInitialData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch investor profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvestor();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-indigo-600">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Edit Investor Profile</h1>
          <p className="text-zinc-500 mt-1">Update your investment thesis and portfolio.</p>
        </div>
        {initialData ? (
          <InvestorForm mode="edit" initialData={initialData} />
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-zinc-100">
             <p className="text-zinc-500 font-medium">No investor profile found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
