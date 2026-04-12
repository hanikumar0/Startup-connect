"use client";

import DashboardLayoutWrapper from "@/components/layout/DashboardLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
