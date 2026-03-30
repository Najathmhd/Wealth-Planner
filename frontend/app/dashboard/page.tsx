"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DollarSign, TrendingUp, Wallet, ArrowUpRight, Loader2, Sparkles, BarChart3, Activity, PieChart, Target, Shield, Zap } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart as RePieChart, Pie } from "recharts"
import api from "@/lib/api"
import { useFinance } from "@/context/FinanceContext"
import { motion } from "framer-motion"
import { useMemo } from "react"

export default function DashboardPage() {
    const { summary, history, latest, user, loading, refreshData } = useFinance()
    const [lastUpdated, setLastUpdated] = useState<string>("")

    // 1. Hooks MUST be at the top level
    const chartData = useMemo(() => history.map((h: any) => ({
        name: new Date(h.date).toLocaleDateString('default', { month: 'short' }),
        total: h.total_savings
    })), [history])

    const activityData = useMemo(() => [
        ...(latest?.incomes || []).map((i: any) => ({ ...i, type: 'income', name: i.name || 'Income', date: latest.date })),
        ...(latest?.expenses || []).map((e: any) => ({ ...e, type: 'expense', name: e.category || 'Expense', date: latest.date }))
    ].sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime())).slice(0, 5), [latest])

    useEffect(() => {
        if (latest?.date || summary) {
            setLastUpdated(new Date().toLocaleTimeString())
        }
    }, [latest, summary])

    // Greeting logic
    const displayName = user?.full_name || user?.email?.split('@')[0] || ""
    const welcomeMessage = displayName ? `Welcome back, ${displayName}!` : "Welcome back!"

    // 2. Early return AFTER hooks
    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex-1 space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 text-left">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-text leading-tight">{welcomeMessage}</h2>
                    <p className="text-sm text-muted-foreground font-medium">
                        {history.length > 0 ? "Your wealth trajectory is looking solid." : "Start your financial journey by adding your first snapshot."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-2">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Last Synced</span>
                        <span className="text-xs text-white/60 font-medium">{lastUpdated || "Syncing..."}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refreshData()}
                        className="text-white/40 hover:text-primary hover:bg-primary/10 rounded-full h-10 w-10 transition-colors"
                        title="Manual Sync"
                    >
                        <Zap className="h-4 w-4" />
                    </Button>
                    <Link href="/dashboard/finance">
                        <Button variant="outline" className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95">
                            Manage Finances
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={item}>
                    <Card className="glass-card bg-gradient-to-br from-primary/20 via-primary/5 to-transparent h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Total Net Worth</CardTitle>
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                ${summary?.total_savings?.toLocaleString() ?? "0.00"}
                            </div>
                            <p className="text-xs text-primary/80 font-medium mt-1">Total combined balance</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Monthly Income</CardTitle>
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Wallet className="h-4 w-4 text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                ${summary?.monthly_income?.toLocaleString() ?? "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Monthly inflow</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Expenses</CardTitle>
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <ArrowUpRight className="h-4 w-4 text-orange-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                ${summary?.monthly_expenses?.toLocaleString() ?? "0.00"}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Monthly outflow</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Financial Freedom</CardTitle>
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Sparkles className="h-4 w-4 text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {summary?.monthly_expenses && summary?.monthly_expenses > 0
                                    ? Math.max(0, Math.min(Math.round((summary.total_savings / (summary.monthly_expenses * 300)) * 100), 100)).toFixed(1)
                                    : "0.0"}%
                            </div>
                            <Link href="/dashboard/recommendations" className="text-xs text-emerald-400/80 font-medium mt-1 hover:underline flex items-center gap-1">
                                View FIRE Plan <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>


            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <motion.div variants={item} className="col-span-4">
                    <Card className="glass-card border-white/10 h-full overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-white">Savings Trajectory</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2 h-[350px]">
                            {history.length > 0 ? (
                                <Overview data={chartData} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                                    <TrendingUp className="h-12 w-12 text-white/10" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white/60">No trajectory data yet</p>
                                        <p className="text-xs text-muted-foreground max-w-[200px]">Add at least two snapshots to see your growth trend.</p>
                                    </div>
                                    <Link href="/dashboard/finance">
                                        <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                                            Start Tracking
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={item} className="col-span-3">
                    <Card className="glass-card border-white/10 h-full">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RecentActivity data={activityData} />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

        </motion.div>
    )
}
