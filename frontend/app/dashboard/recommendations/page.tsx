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

            <Tabs defaultValue="allocation" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/10 p-1">
                    <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
                    <TabsTrigger value="forecast">Market Forecast</TabsTrigger>
                    <TabsTrigger value="freedom">Financial Freedom</TabsTrigger>
                </TabsList>

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
                                {data?.roadmap && data.roadmap.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {data.roadmap.map((step: any, idx: number) => (
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
                                ) : (
                                    <div className="py-8 text-center space-y-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto border border-primary/20">
                                            <BarChart3 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-white/80">Roadmap Locked</p>
                                            <p className="text-xs text-muted-foreground mx-auto max-w-sm">
                                                Save your financial data in the Finance section to project your wealth growth accurately.
                                            </p>
                                        </div>
                                        <Link href="/dashboard/finance">
                                            <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                                                Unlock Roadmap <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}
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
                                <CardTitle className="flex items-center gap-2 text-emerald-400">
                                    <Target className="h-5 w-5" />
                                    The Road to Freedom (FIRE)
                                </CardTitle>
                                <CardDescription>Financial Independence Projection</CardDescription>
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
                                                    <p className="text-5xl font-bold text-emerald-400 tracking-tighter">{fire.years_to_freedom} <span className="text-lg">Years</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground uppercase mb-1">Monthly Saving</p>
                                                    <p className="text-xl font-bold text-white">${fire.monthly_contribution?.toLocaleString()}</p>
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
                            <Button className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                Run Optimization <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
