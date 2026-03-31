"use client"

import { useFinance } from "@/context/FinanceContext"
import { cn } from "@/lib/utils"

interface RecentActivityProps {
    data?: any[]
}

export function RecentActivity({ data = [] }: RecentActivityProps) {
    const { currencySymbol } = useFinance()

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground italic text-sm">
                No recent activity found.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {data.map((item, index) => {
                const isIncome = item.type === 'income'
                return (
                    <div key={index} className="flex items-center">
                        <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center font-bold border",
                            isIncome
                                ? "bg-primary/20 text-primary border-primary/50"
                                : "bg-red-500/20 text-red-500 border-red-500/50"
                        )}>
                            {item.name?.[0] || 'A'}
                        </div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-white">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category || item.description || 'Finance'}</p>
                        </div>
                        <div className={cn(
                            "ml-auto font-medium",
                            isIncome ? "text-green-500" : "text-white"
                        )}>
                            {isIncome ? "+" : "-"}{currencySymbol}{Number(item.amount).toLocaleString()}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
