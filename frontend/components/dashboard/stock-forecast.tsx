"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, AlertTriangle, Zap, TrendingUp, BarChart, Activity, Building, Globe, Coins, ArrowUpRight, ShieldCheck, ShoppingCart, Users, Play, Info, Target } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { useFinance } from "@/context/FinanceContext"

const AssetLogo = ({ symbol, domain }: { symbol: string, domain?: string }) => {
    const [error, setError] = useState(false);
    if (error || !domain) {
        return (
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary border border-primary/30 shrink-0">
                {symbol.split('.')[0].slice(0, 2).toUpperCase()}
            </div>
        )
    }
    return (
        <img 
            src={`https://logo.clearbit.com/${domain}`} 
            alt={symbol} 
            className="h-6 w-6 rounded-full object-contain bg-white shrink-0 shadow-sm border border-white/10"
            onError={() => setError(true)}
        />
    )
}

export function StockForecast({ platforms = [] }: { platforms?: string[] }) {
    const { currencySymbol, forecastData, setForecastData } = useFinance()
    const [symbol, setSymbol] = useState(forecastData?.symbol || "AAPL")
    const [data, setData] = useState<any>(forecastData)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handlePredict = async (overrideSymbol?: string) => {
        const targetSymbol = (typeof overrideSymbol === 'string' ? overrideSymbol : symbol).trim();
        if (!targetSymbol) return
        setLoading(true)
        setError("")
        try {
            const res = await api.get(`/stocks/predict/${targetSymbol}?days=30&window=60`)
            setData(res.data)
            setForecastData(res.data)
        } catch (err: any) {
            console.error(err)
            const detail = err.response?.data?.detail
            setError(detail ? `API Error: ${detail}` : "Failed to fetch prediction. Valid symbol?")
        } finally {
            setLoading(false)
        }
    }

    const getPlatformIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("stock") || lowerName.includes("cse") || lowerName.includes("exchange")) return <BarChart className="h-4 w-4" />;
        if (lowerName.includes("trust") || lowerName.includes("bank")) return <Building className="h-4 w-4" />;
        if (lowerName.includes("crypto") || lowerName.includes("binance") || lowerName.includes("p2p")) return <Coins className="h-4 w-4" />;
        return <ShieldCheck className="h-4 w-4" />;
    }

    const getPlatformLink = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("cal") || lowerName.includes("capital alliance")) return "https://cal.lk/";
        if (lowerName.includes("softlogic")) return "https://softlogicstockbrokers.lk/";
        if (lowerName.includes("binance")) return "https://www.binance.com/";
        if (lowerName.includes("interactive brokers")) return "https://www.interactivebrokers.com/";
        if (lowerName.includes("asia securities")) return "https://asiasecurities.lk/";
        if (lowerName.includes("ndb")) return "https://www.ndbsecurities.com/";
        return "https://www.cse.lk/"; // fallback
    };

    return (
        <Card className="border-white/10 bg-white/5 shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Stock Price Prediction (AI)
                </CardTitle>
                <CardDescription className="text-white/60">
                    See where a stock price might go next using our AI helper.
                </CardDescription>
                <CardDescription>Prediction based on last 60 days of market data.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex space-x-2 mb-6 max-w-sm">
                    <Input
                        placeholder="Symbol (e.g. AAPL)"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
                        className="bg-black/30 border-white/10 text-white focus:ring-primary h-12"
                    />
                    <Button onClick={() => handlePredict()} disabled={loading} className="bg-primary hover:bg-primary/90 h-12 w-14 shadow-lg shadow-primary/20">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </Button>
                </div>

                <div className="mb-10 space-y-6">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Trending Local Assets (Sri Lanka)</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { symbol: "JKH.N0000", domain: "keells.com", name: "John Keells Holdings" },
                                { symbol: "SAMP.N0000", domain: "sampath.lk", name: "Sampath Bank" },
                                { symbol: "LOLC.N0000", domain: "lolc.com", name: "LOLC Holdings" },
                                { symbol: "COMB.N0000", domain: "combank.lk", name: "Commercial Bank" },
                                { symbol: "HAYL.N0000", domain: "hayleys.com", name: "Hayleys" },
                            ].map((asset) => (
                                <Button
                                    key={asset.symbol}
                                    title={asset.name}
                                    variant="outline"
                                    size="sm"
                                    disabled={loading}
                                    onClick={() => {
                                        setSymbol(asset.symbol);
                                        handlePredict(asset.symbol);
                                    }}
                                    className={`bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all font-bold tracking-wider flex items-center gap-2 px-3 py-6 rounded-2xl group min-w-[120px]`}
                                >
                                    <AssetLogo symbol={asset.symbol} domain={asset.domain} />
                                    {asset.symbol.split('.')[0]}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Trending Global Assets</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { symbol: "AAPL", domain: "apple.com", name: "Apple Inc." },
                                { symbol: "NVDA", domain: "nvidia.com", name: "NVIDIA Corporation" },
                                { symbol: "TSLA", domain: "tesla.com", name: "Tesla, Inc." },
                                { symbol: "MSFT", domain: "microsoft.com", name: "Microsoft Corporation" },
                                { symbol: "GOOGL", domain: "google.com", name: "Alphabet (Google)" },
                                { symbol: "AMZN", domain: "amazon.com", name: "Amazon.com, Inc." },
                                { symbol: "BTC-USD", domain: "bitcoin.org", name: "Bitcoin" },
                                { symbol: "ETH-USD", domain: "ethereum.org", name: "Ethereum" },
                            ].map((asset) => (
                                <Button
                                    key={asset.symbol}
                                    title={asset.name}
                                    variant="outline"
                                    size="sm"
                                    disabled={loading}
                                    onClick={() => {
                                        setSymbol(asset.symbol);
                                        handlePredict(asset.symbol);
                                    }}
                                    className={`bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all font-bold tracking-wider flex items-center gap-2 px-3 py-6 rounded-2xl group min-w-[120px]`}
                                >
                                    <AssetLogo symbol={asset.symbol} domain={asset.domain} />
                                    {asset.symbol.split('.')[0]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 mb-6 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                        <AlertTriangle className="h-5 w-5" /> {error}
                    </div>
                )}

                {data && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        {/* AI Strategy Insight */}
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                            data.recommendation?.action === 'BUY' ? 'bg-emerald-500 text-white' :
                                            data.recommendation?.action === 'SELL' ? 'bg-orange-500 text-white' :
                                            'bg-blue-500 text-white'
                                        }`}>
                                            {data.recommendation?.action}
                                        </span>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-widest opacity-80">AI Strategy Insight</h4>
                                    </div>
                                    <p className="text-xs text-white/70 font-medium leading-relaxed max-w-lg">
                                        {data.recommendation?.summary}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-auto px-5 py-3 rounded-xl bg-black/20 border border-white/5 text-center md:text-right">
                                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-0.5">Projected Momentum</p>
                                <p className={`text-xl font-black ${data.recommendation?.predicted_change_pct > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {data.recommendation?.predicted_change_pct > 0 ? '+' : ''}{data.recommendation?.predicted_change_pct}%
                                </p>
                            </div>
                        </div>

                        {/* Personalized Strategy Insight */}
                        {data.recommendation?.personalized_amount > 0 && (
                            <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-6 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Target className="h-16 w-16 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] items-center gap-1 flex uppercase font-bold text-indigo-400 tracking-widest mb-1">
                                        <Target className="h-3 w-3" /> Personalized Investment Suggestion
                                    </h4>
                                    <p className="text-sm text-white/70 max-w-md">Based on your current monthly surplus, we suggest allocating a high-confidence position here.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Recommended Amount</p>
                                    <p className="text-3xl font-black text-white">{currencySymbol}{data.recommendation.personalized_amount.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {/* Direct Investing Access */}
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 border-dashed">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Localized Trading Hubs</h4>
                                    <p className="text-[10px] text-white/50">Brokerages recommended for {symbol.split('.')[0]} in your region.</p>
                                </div>
                                <ShieldCheck className="h-6 w-6 text-primary opacity-50" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {platforms.length > 0 ? (
                                    platforms.map((platform, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => window.open(getPlatformLink(platform), '_blank', 'noopener,noreferrer')}
                                            className={`flex items-center justify-between p-4 rounded-2xl bg-black/40 border group transition-all cursor-pointer relative ${
                                                platform === data.recommendation?.best_platform ? 'border-primary/60 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-primary/5' : 'border-white/5 hover:border-primary/50'
                                            }`}
                                        >
                                            {platform === data.recommendation?.best_platform && (
                                                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-[8px] font-black rounded text-white shadow-lg">#1 BEST MATCH</span>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary group-hover:scale-110 transition-transform">
                                                    {getPlatformIcon(platform)}
                                                </div>
                                                <p className="text-xs font-bold text-white">{platform}</p>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-primary transition-colors" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-4 text-center">
                                        <p className="text-xs text-white/30 italic">No localized platforms suggested for your current profile.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                                    <TrendingUp className="h-10 w-10" />
                                </div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">AI Prediction Confidence</div>
                                <p className="text-2xl font-bold text-white">{currencySymbol}{data.current_price?.toFixed(2)}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform text-primary">
                                    <Zap className="h-10 w-10 text-primary" />
                                </div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">AI Engine</p>
                                <p className="text-lg font-bold text-primary">LSTM Neural Net</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform ${data.market_sentiment === 'Bullish' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    <Activity className="h-10 w-10" />
                                </div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Market Mood</p>
                                <p className={`text-xl font-bold ${data.market_sentiment === 'Bullish' ? 'text-emerald-400' : data.market_sentiment === 'Bearish' ? 'text-orange-400' : 'text-white'}`}>
                                    {data.market_sentiment}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                                    <BarChart className="h-10 w-10" />
                                </div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">SMA (20/50)</p>
                                <p className="text-sm font-bold text-white">{currencySymbol}{data.indicators?.SMA_20.toFixed(1)} / {currencySymbol}{data.indicators?.SMA_50.toFixed(1)}</p>
                            </div>
                        </div>

                        <div className="h-[450px] w-full bg-white/5 rounded-3xl border border-white/10 p-6 shadow-inner">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.prediction}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#666" fontSize={11} tickFormatter={(val) => val.slice(5)} dy={10} />
                                    <YAxis stroke="#666" fontSize={11} domain={['auto', 'auto']} tickFormatter={(val) => `${currencySymbol}${val}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', borderColor: '#333', color: '#fff', backdropFilter: 'blur(4px)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="predicted_price"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                        name="LSTM Prediction"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    )
}
