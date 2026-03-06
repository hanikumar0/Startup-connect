export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                    <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
            </div>
        </div>
    );
}
