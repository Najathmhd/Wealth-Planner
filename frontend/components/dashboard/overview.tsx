"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewProps {
    data?: any[]
}

export function Overview({ data = [] }: OverviewProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>

                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                    contentStyle={{ borderRadius: '8px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
        </ResponsiveContainer>
    )
}
