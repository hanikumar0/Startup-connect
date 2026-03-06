"use client";

import React from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";

interface TrustRadarProps {
    scores: {
        identity: number;
        financials: number;
        team: number;
        legal: number;
        traction: number;
    };
}

export function TrustRadar({ scores }: TrustRadarProps) {
    const data = [
        { subject: "Identity", A: scores.identity, fullMark: 100 },
        { subject: "Financials", A: scores.financials, fullMark: 100 },
        { subject: "Team", A: scores.team, fullMark: 100 },
        { subject: "Legal", A: scores.legal, fullMark: 100 },
        { subject: "Traction", A: scores.traction, fullMark: 100 },
    ];

    const average = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
    const isElite = average >= 90;

    return (
        <div className="relative w-full h-[250px] flex items-center justify-center group">
            {/* Background Glow Effect */}
            <div className={`absolute inset-0 blur-3xl opacity-20 transition-all duration-700 ${isElite ? "bg-amber-400 group-hover:opacity-40" : "bg-indigo-400 opacity-10"
                }`} />

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                    />
                    <Radar
                        name="Verification"
                        dataKey="A"
                        stroke={isElite ? "#d97706" : "#4f46e5"}
                        fill={isElite ? "#fbbf24" : "#6366f1"}
                        fillOpacity={0.6}
                        animationBegin={0}
                        animationDuration={1500}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {isElite && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-amber-500 text-[8px] font-black text-white shadow-lg shadow-amber-200 animate-pulse">
                    ELITE STATUS
                </div>
            )}
        </div>
    );
}
