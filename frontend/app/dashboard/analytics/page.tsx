"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BarChart3, Activity, PieChart, Target, Shield, Zap, TrendingUp, Loader2 } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart as RePieChart, Pie } from "recharts"
import api from "@/lib/api"
import { useFinance } from "@/context/FinanceContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AnalyticsPage() {
    const router = useRouter()
    const { history, latest, loading: contextLoading, currencySymbol } = useFinance()
    const [riskProfile, setRiskProfile] = useState<any>(null)
    const [profileLoading, setProfileLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileRes = await api.get("/recommendations/profile")
                setRiskProfile(profileRes.data)
            } catch (error: any) {
                console.error("Failed to fetch risk profile:", error)
            } finally {
                setProfileLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const loading = contextLoading || profileLoading


    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Format history for charts
    const cashFlowData = history.filter(h => h && h.date).map((h: any) => ({
        month: new Date(h.date).toLocaleDateString('default', { month: 'short' }),
        income: Number(h.income || 0),
        expenses: Number(h.expenses || 0)
    }))

    // Group expenses by category
    const categoryColors: Record<string, string> = {
        "Housing": "#8b5cf6",
        "Food": "#ec4899",
        "Utilities": "#3b82f6",
        "Leisure": "#f59e0b",
        "Transport": "#10b981",
        "Other": "#6b7280"
    }

    const defaultExpenses = [
        { name: "Housing", value: 1200, color: "#8b5cf6" },
        { name: "Food", value: 500, color: "#ec4899" },
        { name: "Utilities", value: 200, color: "#3b82f6" },
        { name: "Leisure", value: 300, color: "#f59e0b" },
        { name: "Transport", value: 250, color: "#10b981" },
    ]

    let expenseData = defaultExpenses

    if (latest?.expenses?.length > 0) {
        const grouped = latest.expenses.reduce((acc: any, curr: any) => {
            const cat = curr.category || "Other"
            acc[cat] = (Number(acc[cat]) || 0) + Number(curr.amount || 0)
            return acc
        }, {})

        expenseData = Object.entries(grouped).map(([name, value]) => ({
            name,
            value: Number(value),
            color: categoryColors[name] || categoryColors["Other"]
        }))
    }



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 space-y-8 p-0"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/20 rounded-xl">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white glow-text">Wealth Intelligence</h2>
                        <p className="text-sm text-muted-foreground">Deep analysis of your financial DNA and trajectory.</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Zap className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-medium text-white/80">AI Model: Financial-Llama v2</span>
                </div>
            </div>

            {history.length > 0 ? (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        {/* Cash Flow Analysis */}
                        <Card className="glass-card border-white/10 bg-white/5 lg:col-span-4">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Income vs Expenses
                                </CardTitle>
                                <CardDescription>Historical cash flow performance over the last {history.length} snapshots.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowData}>
                                        <XAxis dataKey="month" stroke="#666" fontSize={12} />
                                        <YAxis 
                                            stroke="#666" 
                                            fontSize={12} 
                                            tickFormatter={(value) => `${currencySymbol}${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="income" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Income" />
                                        <Bar dataKey="expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expenses" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Expense Breakdown */}
                        <Card className="glass-card border-white/10 bg-white/5 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-secondary" />
                                    Spending DNA
                                </CardTitle>
                                <CardDescription>Top spending categories from your latest input.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex flex-col items-center">
                                <ResponsiveContainer width="100%" height="80%">
                                    <RePieChart>
                                        <Pie
                                            data={expenseData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 w-full px-4">
                                    {expenseData.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-[10px]">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-white/60 uppercase">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Advanced Wealth Intelligence Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="glass-card border-white/10 bg-gradient-to-br from-indigo-500/10 to-transparent">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-400">
                                    <Shield className="h-5 w-5" />
                                    Risk DNA Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Risk Score</span>
                                    <span className="text-white font-bold">{riskProfile?.risk_appetite || "N/A"}/10</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/60">Horizon</span>
                                    <span className="text-white font-bold">{riskProfile?.time_horizon || "N/A"} Years</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full">
                                    <motion.div
                                        className="h-full bg-indigo-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(riskProfile?.risk_appetite || 0) * 10}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground italic">
                                    "{riskProfile?.investment_goal === 'retirement' ? 'Your focus is on long-term security.' : 'You are aiming for active wealth growth.'}"
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-400">
                                    <Target className="h-5 w-5" />
                                    Financial Independence Roadmap
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-white/60">Current Trajectory</p>
                                        <p className="text-4xl font-bold text-white tracking-tighter">
                                            {history.length > 0 ? "Analyzing" : "Awaiting Data"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Snapshot Coverage</span>
                                            <span className="text-emerald-400 font-bold">{history.length} Points</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-emerald-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(history.length * 10, 100)}%` }}
                                                transition={{ duration: 1.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/70 leading-relaxed italic relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                                        <Zap className="h-12 w-12" />
                                    </div>
                                    <span className="text-emerald-400 font-bold">Pro Tip:</span>
                                    {history.length < 3
                                        ? " Keep saving consistently to unlock deeper predictive insights."
                                        : " Your savings rate is stable. Consider diversifying into the suggested portfolio."}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 glass-card bg-white/5 border-white/10 rounded-3xl space-y-6">
                    <div className="p-6 bg-primary/20 rounded-full border border-primary/30">
                        <BarChart3 className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">No Intelligence Data Found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Our AI needs a baseline to analyze your financial DNA. Save your first income and expense ledger to generate insights.
                        </p>
                    </div>
                    <Link href="/dashboard/finance">
                        <Button className="h-12 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-xl">
                            Setup Your Ledger <Activity className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )}
        </motion.div>
    )
}

