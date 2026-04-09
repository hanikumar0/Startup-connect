"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import InvestorForm from "@/components/investor/InvestorForm";

export default function InvestorCreatePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Create Investor Profile</h1>
          <p className="text-zinc-500 mt-1">Set your preferences to start receiving high-quality startup matches.</p>
        </div>
        <InvestorForm mode="create" />
      </div>
    </DashboardLayout>
  );
}
