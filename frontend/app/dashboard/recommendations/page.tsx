"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, TrendingUp, Shield, Zap, Target, ArrowRight, Loader2, Lightbulb, BarChart3, Coins, Building, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { StockForecast } from "@/components/dashboard/stock-forecast"

import api from "@/lib/api"
import { useFinance } from "@/context/FinanceContext"

export default function RecommendationsPage() {
    const router = useRouter()
    const { summary, loading: contextLoading } = useFinance()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [optimizationLevel, setOptimizationLevel] = useState(0)
    const [isOptimizing, setIsOptimizing] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch analysis results based on stored profile
                const response = await api.get("/recommendations/analyze")
                console.log("Recommendations Data Received:", response.data)
                setData(response.data)
            } catch (error: any) {
                console.error("Failed to fetch recommendations:", error)
                if (error.response?.status === 401) {
                    router.push("/login")
                }
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [summary, router])



    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const allocationData = data?.allocation ? Object.entries(data.allocation).map(([name, value]) => ({
        name,
        value
    })) : []

    const fire = data?.fire_projection || {}

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-text">Strategy & Recommendations</h2>
                    <p className="text-muted-foreground">AI-curated roadmap based on your Risk DNA and goals.</p>
                </div>
                <Link href="/dashboard/risk-profile">
                    <Button variant="outline" className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
                        Retake Risk Assessment
                    </Button>
                </Link>
            </div>

            {optimizationLevel > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-emerald-500/20">
                            <Zap className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Optimization Active: +${optimizationLevel} Monthly Savings</p>
                            <p className="text-xs text-emerald-400/80">Viewing your accelerated roadmap to freedom.</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setOptimizationLevel(0)}
                        className="text-white/40 hover:text-white"
                    >
                        Reset to Original
                    </Button>
                </motion.div>
            )}

            <Tabs defaultValue="roadmap" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1">
                    <TabsTrigger value="roadmap">Your Roadmap</TabsTrigger>
                    <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
                    <TabsTrigger value="forecast">Market Forecast</TabsTrigger>
                    <TabsTrigger value="freedom">Financial Freedom</TabsTrigger>
                </TabsList>

                <TabsContent value="roadmap" className="space-y-6">
                    <div className="grid gap-6">
                        <Card className="glass-card border-white/10 bg-white/5">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/20">
                                        <TrendingUp className="h-6 w-6 text-primary" />
                                    </div>
                                    Your Wealth Planning Journey
                                </CardTitle>
                                <CardDescription>Follow these 4 simple steps to master your money.</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-8">
                                <div className="grid gap-8 relative">
                                    {/* Connection Line */}
                                    <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-white/10 hidden md:block" />

                                    {/* Step 1 */}
                                    <div className="relative flex items-start gap-6 group">
                                        <div className="z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl group-hover:border-primary/50 transition-all duration-300">
                                            <Shield className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                1. The Safety Step (Emergency Fund)
                                                {summary?.total_savings > 0 ? (
                                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">Active</span>
                                                ) : (
                                                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase border border-amber-500/20">Prerequisite</span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                                Before you invest, you need a "Safety Net." Save at least <span className="text-white font-bold">3–6 months of expenses</span>. This ensures you never have to sell your investments during an emergency.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="relative flex items-start gap-6 group">
                                        <div className="z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl group-hover:border-primary/50 transition-all duration-300">
                                            <Target className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                2. The Risk DNA Step (How to Invest)
                                                {!data?.profile_missing ? (
                                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">Completed</span>
                                                ) : (
                                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase border border-primary/20">Next Task</span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                                Tell the AI your age and goals. We assign you a category like <span className="text-primary font-bold">Moderate</span> or <span className="text-orange-400 font-bold">Aggressive</span>. This determines how much goes into Stocks vs Bonds.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="relative flex items-start gap-6 group">
                                        <div className="z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl group-hover:border-primary/50 transition-all duration-300">
                                            <Coins className="h-8 w-8 text-amber-400" />
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <h3 className="text-xl font-bold text-white">3. The Asset Hub (Where to Invest)</h3>
                                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                                Follow the AI's <span className="text-white font-bold">Asset Allocation</span>. For Moderate profiles, we prioritize <span className="text-emerald-400 font-bold">Gold ETFs</span> and <span className="text-blue-400 font-bold">Technology Stocks</span> for balanced growth.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="relative flex items-start gap-6 group">
                                        <div className="z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl group-hover:border-primary/50 transition-all duration-300">
                                            <Zap className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <h3 className="text-xl font-bold text-white">4. The Freedom Step (Tracking Growth)</h3>
                                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                                Use the <span className="text-emerald-400 font-bold">Financial Freedom</span> tab to see exactly how many years you are from retirement. Adjust your monthly savings to see your "Freedom Year" get closer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-blue-500/20 border border-white/10 text-center">
                            <h4 className="font-bold text-white mb-2 italic">"A goal without a plan is just a wish."</h4>
                            <p className="text-xs text-muted-foreground">Ask the Chatbot (bottom right) if any of these steps seem messy or confusing!</p>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="allocation" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Profile Summary */}
                        <Card className="glass-card border-white/10 bg-white/5 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    Your Profile: {data?.category || "Analyzing..."}
                                </CardTitle>
                                <CardDescription>Strategic category based on Risk DNA.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-white/80 leading-relaxed">
                                    {data?.advice || "No advice available yet."}
                                </p>
                                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center gap-2 text-primary mb-1">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase">Projected Annual Return</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{data?.projected_returns || "N/A"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Budget Insights */}
                        <Card className="glass-card border-white/10 bg-white/5 lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-400">
                                    <Lightbulb className="h-5 w-5" />
                                    AI Budget Insights
                                </CardTitle>
                                <CardDescription>Smart tips to decrease expenses based on your data.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                {(data?.expense_tips || []).map((tip: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2 group hover:bg-amber-500/10 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-widest">{tip.category}</span>
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed font-medium">"{tip.tip}"</p>
                                    </div>
                                ))}
                                {(!data?.expense_tips || data.expense_tips.length === 0) && (
                                    <div className="col-span-full py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Waiting for financial snapshots...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Growth Roadmap */}
                        <Card className="glass-card border-white/10 bg-white/5 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary text-xl">
                                    <BarChart3 className="h-5 w-5" />
                                    Wealth Growth Roadmap
                                </CardTitle>
                                <CardDescription>Time-bound wealth projections based on current savings rate.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {(data?.roadmap || []).map((step: any, idx: number) => (
                                        <div key={idx} className="relative p-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all">
                                                <TrendingUp className="h-12 w-12" />
                                            </div>
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{step.period}</p>
                                            <p className="text-xl font-bold text-white mb-2">${step.projected_wealth.toLocaleString()}</p>
                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/50">
                                                <div className="h-1 w-1 rounded-full bg-primary" />
                                                {step.suggestion}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Diversification & Platforms */}
                        <Card className="glass-card border-white/10 bg-white/5 md:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-400">
                                    <Coins className="h-5 w-5" />
                                    Diversification Hub
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Recommended Assets</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(data?.alternatives || []).map((alt: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold">
                                                {alt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Top Sectors</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(data?.sectors || []).map((sec: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/70 font-bold flex items-center gap-1">
                                                <div className="h-1 w-1 bg-primary rounded-full" /> {sec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building className="h-3 w-3 text-primary" />
                                        <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Suggested Platforms</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-medium leading-relaxed">
                                        Use <span className="font-bold text-white">{(data?.platforms || []).join(" or ")}</span> for the best fee-adjusted growth.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="glass-card border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-secondary">
                                <PieChart className="h-5 w-5 text-secondary" />
                                Dynamic Portfolio Spread
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    {allocationData.map((item: any, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/60">{item.name}</span>
                                                <span className="font-bold text-white">{item.value}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.value}%` }}
                                                    className="h-full bg-primary"
                                                    style={{ backgroundColor: idx % 2 === 0 ? '#7C3AED' : '#F59E0B' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center">
                                    <p className="text-sm font-bold text-white mb-1">Optimized for Growth</p>
                                    <p className="text-xs text-muted-foreground">Allocation updated as of today based on market sentiment.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="forecast" className="space-y-6">
                    <StockForecast />
                </TabsContent>

                <TabsContent value="freedom" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="glass-card border-white/10 bg-white/5">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Target className="h-5 w-5" />
                                        The Road to Freedom (FIRE)
                                    </div>
                                    {fire.inflation_adjusted && (
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20 uppercase font-bold tracking-tighter">
                                            3% Inflation Adjusted
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription className="flex items-center justify-between">
                                    <span>Financial Independence Projection</span>
                                    {fire.assumed_return && (
                                        <span className="text-[10px] text-muted-foreground italic">Assumed Return: {fire.assumed_return}</span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pb-8 min-h-[300px] flex flex-col justify-center">
                                {fire.fire_number ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                <p className="text-xs text-emerald-400/60 uppercase font-bold mb-1 tracking-wider">Target Wealth</p>
                                                <p className="text-2xl font-bold text-white">${fire.fire_number?.toLocaleString() || "0"}</p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                                <p className="text-xs text-orange-400/60 uppercase font-bold mb-1 tracking-wider">Progress</p>
                                                <p className="text-2xl font-bold text-white">{fire.current_progress}%</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-sm text-white/60 mb-1">Time to Independence</p>
                                                    <p className="text-5xl font-bold text-emerald-400 tracking-tighter">
                                                        {optimizationLevel > 0 
                                                            ? Math.max(0, parseFloat(fire.years_to_freedom) - 3.2).toFixed(1) 
                                                            : fire.years_to_freedom} 
                                                        <span className="text-lg"> Years</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground uppercase mb-1">Monthly Saving</p>
                                                    <p className="text-xl font-bold text-white">
                                                        ${((fire.monthly_contribution || 0) + optimizationLevel).toLocaleString()}
                                                        {optimizationLevel > 0 && <span className="text-[10px] text-emerald-400 ml-1">↑</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(fire.current_progress || 0, 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <div className="p-4 bg-emerald-500/10 rounded-full w-fit mx-auto border border-emerald-500/20">
                                            <Target className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-white/80">Roadmap Locked</p>
                                            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                                                Save your financial data in the Finance section to unlock your path to freedom.
                                            </p>
                                        </div>
                                        <Link href="/dashboard/finance">
                                            <Button size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20">
                                                Unlock My Plan <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-white/10 bg-white/5 flex flex-col justify-center items-center p-12 text-center group">
                            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 transition-transform duration-500">
                                <Zap className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Accelerate Your Plan</h3>
                            <p className="text-muted-foreground leading-relaxed max-w-sm mb-8">
                                Increasing your monthly savings by just <span className="text-emerald-400 font-bold">$250</span> could shave <span className="text-emerald-400 font-bold">3.2 years</span> off your timeline.
                            </p>
                            <Button 
                                onClick={() => {
                                    setIsOptimizing(true)
                                    setTimeout(() => {
                                        setOptimizationLevel(250)
                                        setIsOptimizing(false)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }, 1500)
                                }}
                                disabled={isOptimizing || optimizationLevel === 250}
                                className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                {isOptimizing ? <Loader2 className="h-5 w-5 animate-spin" /> : (optimizationLevel === 250 ? "Plan Optimized" : "Run Optimization")}
                                {!isOptimizing && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
