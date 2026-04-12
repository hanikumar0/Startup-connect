"use client";

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { initSocket } from '@/lib/socket';
import { useAuthStore } from '@/lib/store';

const SocketContext = createContext<any>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { token, user, _hasHydrated } = useAuthStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        // Only initialize ONE time when token is available after hydration
        if (!_hasHydrated || !token || !user?.id || isInitialized.current) return;

        console.log("🚀 [SocketProvider] Establishing Global Connection Heartbeat...");
        initSocket(token);
        isInitialized.current = true;

        // Note: We don't disconnect on unmount here because this is the global provider 
        // that stays alive across all navigations.
    }, [_hasHydrated, token, user?.id]);

    return (
        <SocketContext.Provider value={null}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
