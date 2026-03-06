import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 px-6">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Rocket className="w-10 h-10 text-indigo-600" />
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
                    404 Tracker
                </h1>
                <h2 className="text-xl font-semibold mb-3 text-slate-700">Page Lost in Orbit</h2>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    The page you are looking for has been moved, evaporated, or fundamentally never existed in our database.
                </p>

                <Link href="/dashboard" className="w-full">
                    <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-semibold shadow-md transition-all flex items-center justify-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        Return to Dashboard
                    </Button>
                </Link>
            </div>

            <p className="mt-8 text-sm text-slate-400 font-medium">
                Startup Connect Network &copy; {new Date().getFullYear()}
            </p>
        </div>
    );
}
