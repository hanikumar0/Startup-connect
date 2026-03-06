"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Compass, MessageSquare, LayoutDashboard, Settings, User } from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Blurred Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-[#0f172a] shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 animate-in fade-in zoom-in-95 duration-200">
                <Command className="flex flex-col h-full w-full">
                    <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4">
                        <Search className="mr-3 h-5 w-5 text-slate-400" />
                        <Command.Input
                            autoFocus
                            placeholder="Type a command or search..."
                            className="flex h-14 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
                        />
                    </div>

                    <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        <Command.Empty className="py-6 text-center text-sm text-slate-500">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-slate-500">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/dashboard"))}
                                className="flex cursor-pointer items-center rounded-xl px-2 py-3 text-sm aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-500/10 dark:aria-selected:text-indigo-400 dark:text-slate-200 transition-colors"
                            >
                                <LayoutDashboard className="mr-3 h-4 w-4" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/dashboard/discover"))}
                                className="flex cursor-pointer items-center rounded-xl px-2 py-3 text-sm aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-500/10 dark:aria-selected:text-indigo-400 dark:text-slate-200 transition-colors"
                            >
                                <Compass className="mr-3 h-4 w-4" />
                                <span>Discover Matches</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/dashboard/chat"))}
                                className="flex cursor-pointer items-center rounded-xl px-2 py-3 text-sm aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-500/10 dark:aria-selected:text-indigo-400 dark:text-slate-200 transition-colors"
                            >
                                <MessageSquare className="mr-3 h-4 w-4" />
                                <span>Messages</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Settings" className="px-2 py-1.5 text-xs font-medium text-slate-500 mt-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                                className="flex cursor-pointer items-center rounded-xl px-2 py-3 text-sm aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-500/10 dark:aria-selected:text-indigo-400 dark:text-slate-200 transition-colors"
                            >
                                <User className="mr-3 h-4 w-4" />
                                <span>Profile Settings</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                                className="flex cursor-pointer items-center rounded-xl px-2 py-3 text-sm aria-selected:bg-indigo-50 aria-selected:text-indigo-600 dark:aria-selected:bg-indigo-500/10 dark:aria-selected:text-indigo-400 dark:text-slate-200 transition-colors"
                            >
                                <Settings className="mr-3 h-4 w-4" />
                                <span>Preferences</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
