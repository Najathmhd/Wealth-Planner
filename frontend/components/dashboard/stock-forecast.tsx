"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, AlertTriangle, Zap, TrendingUp, BarChart, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from "@/lib/api"
import { motion } from "framer-motion"

export function StockForecast() {
    const [symbol, setSymbol] = useState("AAPL")
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const popularAssets = [
        { name: "Apple", symbol: "AAPL" },
        { name: "Tesla", symbol: "TSLA" },
        { name: "Microsoft", symbol: "MSFT" },
        { name: "Bitcoin", symbol: "BTC-USD" },
        { name: "S&P 500", symbol: "^GSPC" },
        { name: "Nvidia", symbol: "NVDA" }
    ]

    const handlePredict = async (searchSymbol = symbol) => {
        if (!searchSymbol) return
        setLoading(true)
        setSymbol(searchSymbol.toUpperCase())
        setError("")
        try {
            const res = await api.get(`/stocks/predict/${searchSymbol}?days=30`)
            setData(res.data)
        } catch (err) {
            console.error(err)
            setError(`Failed to fetch prediction for ${searchSymbol}. Valid symbol?`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-white/10 bg-white/5 shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Neural Market Forecast
                </CardTitle>
                <CardDescription>Enter a ticker symbol to unleash LSTM deep learning models on historical market data.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4 mb-10">
                    <div className="flex space-x-2 max-w-sm">
                        <Input
                            placeholder="Symbol (e.g. AAPL)"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            className="bg-black/30 border-white/10 text-white focus:ring-primary h-12"
                        />
                        <Button onClick={() => handlePredict()} disabled={loading} className="bg-primary hover:bg-primary/90 h-12 w-14 shadow-lg shadow-primary/20">
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Popular Quick-Lookup</p>
                        <div className="flex flex-wrap gap-2">
                            {popularAssets.map((asset) => (
                                <button
                                    key={asset.symbol}
                                    onClick={() => handlePredict(asset.symbol)}
                                    disabled={loading}
                                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-all font-bold flex items-center gap-1.5"
                                >
                                    <div className="h-1 w-1 bg-primary/40 rounded-full" />
                                    {asset.name} ({asset.symbol})
                                </button>
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                                    <TrendingUp className="h-10 w-10" />
                                </div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Current Price</p>
                                <p className="text-2xl font-bold text-white">${data.current_price?.toFixed(2)}</p>
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
                                <p className="text-sm font-bold text-white">${data.indicators?.SMA_20.toFixed(1)} / ${data.indicators?.SMA_50.toFixed(1)}</p>
                            </div>
                        </div>

                        <div className="h-[450px] w-full bg-white/5 rounded-3xl border border-white/10 p-6 shadow-inner">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.prediction}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#666" fontSize={11} tickFormatter={(val) => val.slice(5)} dy={10} />
                                    <YAxis stroke="#666" fontSize={11} domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} />
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
