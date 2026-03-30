"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

interface FinanceSummary {
    total_savings: number
    monthly_income: number
    monthly_expenses: number
    investment_roi: number
}

interface FinanceContextType {
    summary: FinanceSummary | null
    history: any[]
    latest: any
    user: any
    loading: boolean
    refreshData: () => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [summary, setSummary] = useState<FinanceSummary | null>(null)
    const [history, setHistory] = useState<any[]>([])
    const [latest, setLatest] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchAllData = useCallback(async () => {
        try {
            // Fetch user first as it's critical
            try {
                const userRes = await api.get("/auth/me")
                setUser(userRes.data)
            } catch (e) {
                console.error("User fetch failed:", e)
            }

            // Fetch other data in parallel but handle errors individually
            const [summaryRes, historyRes, latestRes] = await Promise.all([
                api.get("/finance/summary").then(r => { console.log("Summary success:", r.data); return r; }).catch(e => { console.error("Summary failed:", e); return { data: null }; }),
                api.get("/finance/history").then(r => { console.log("History success:", r.data); return r; }).catch(e => { console.error("History failed:", e); return { data: [] }; }),
                api.get("/finance/latest").then(r => { console.log("Latest success:", r.data); return r; }).catch(e => { console.error("Latest failed:", e); return { data: null }; })
            ])

            if (summaryRes.data) {
                console.log("Setting summary state:", summaryRes.data)
                setSummary(summaryRes.data)
            }
            setHistory(historyRes.data || [])
            if (latestRes.data) {
                console.log("Setting latest state:", latestRes.data)
                setLatest(latestRes.data)
            }

        } catch (error: any) {
            console.error("General dashboard data fetch failed:", error)
            if (error.response?.status === 401) {
                router.push("/login")
            }
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    const refreshData = async () => {
        setLoading(true)
        await fetchAllData()
    }

    return (
        <FinanceContext.Provider value={{ summary, history, latest, user, loading, refreshData }}>
            {children}
        </FinanceContext.Provider>
    )
}

export function useFinance() {
    const context = useContext(FinanceContext)
    if (context === undefined) {
        throw new Error("useFinance must be used within a FinanceProvider")
    }
    return context
}
