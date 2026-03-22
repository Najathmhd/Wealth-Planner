"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Lock, Zap, TrendingUp, PieChart, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-white">

            {/* Navbar - Floating style */}
            <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <div className="glass rounded-full px-6 py-3 flex items-center justify-between gap-8 md:gap-12">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary/20 p-1.5 rounded-full">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold tracking-tight text-white/90">Wealth Planner</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
                        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="#demo" className="hover:text-white transition-colors">How it works</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Login</Link>
                        <Link href="/register">
                            <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90 font-semibold h-8 px-4">
                                Join
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 pt-32 pb-16 px-4 md:px-8">

                {/* Unique Hero Grid Layout */}
                <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">

                    {/* Main Hero Text Area (Span 7) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:col-span-7 flex flex-col justify-center p-8 lg:p-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-xs font-medium text-primary-foreground">AI Wealth Engine Live</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                            Financial clarity, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary animate-gradient-x">re-imagined.</span>
                        </h1>

                        {/* Simplified Importance/Value Prop */}
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Grow Wealth</h3>
                                    <p className="text-sm text-muted-foreground">Maximize returns with AI-driven strategies.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-secondary/20 p-2 rounded-lg">
                                    <Lock className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Secure Future</h3>
                                    <p className="text-sm text-muted-foreground">Risk-calibrated investments for peace of mind.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link href="/register">
                                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]">
                                    Start Planning <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Bento Grid Visuals (Span 5) */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full content-center">

                        {/* Card 1: Balance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card col-span-2 p-6 flex items-center justify-between"
                        >
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Net Worth</p>
                                <p className="text-3xl font-bold text-white">$124,592.00</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                <TrendingUp className="text-secondary h-6 w-6" />
                            </div>
                        </motion.div>

                        {/* Card 2: AI Suggestion */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6 bg-primary/10 border-primary/20"
                        >
                            <Zap className="text-primary h-8 w-8 mb-4" />
                            <p className="text-xs font-semibold text-primary mb-2">AI INSTANT TIP</p>
                            <p className="text-sm text-white/80">Shift 15% to Index Funds to optimize safety.</p>
                        </motion.div>

                        {/* Card 3: Spending */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-6"
                        >
                            <PieChart className="text-orange-400 h-8 w-8 mb-4" />
                            <p className="text-xs font-semibold text-orange-400 mb-2">SPENDING</p>
                            <p className="text-sm text-white/80">-12% vs last month. Good job!</p>
                        </motion.div>

                        {/* Card 4: Long Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card col-span-2 p-6 flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Savings Goal</p>
                                    <p className="text-xs text-muted-foreground">House Downpayment</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-sm font-bold text-white">42%</p>
                                </div>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                                <div className="bg-blue-400 h-2 rounded-full w-[42%]"></div>
                            </div>
                        </motion.div>

                    </div>
                </section>

                {/* How it Works / Process */}
                <section id="demo" className="max-w-7xl mx-auto mt-32 px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Your Path to <span className="text-secondary">Financial Freedom</span></h2>
                        <p className="text-muted-foreground">Three simple steps to an autonomous future.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 -z-10" />

                        {[
                            { step: "01", title: "Financial Mapping", desc: "Securely input your cash flow and assets. Our deep-tier engine builds your historical snapshot.", icon: Wallet },
                            { step: "02", title: "AI Stress Test", desc: "Run Monte Carlo simulations and AI stock forecasts to stress-test your wealth against market shifts.", icon: Zap },
                            { step: "03", title: "Autonomous Strategy", desc: "Receive a personalized roadmap with risk-adjusted asset allocations tailored to your DNA.", icon: TrendingUp },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-2xl font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="max-w-7xl mx-auto mt-40">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Autonomous <br /><span className="text-primary">Wealth Intelligence</span></h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">Traditional finance tools only show where your money *was*. We show you where it's *going*.</p>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            { title: "Stock Forecasting", desc: "Machine Learning models analyze historical trends and indicators to predict future stock trajectories.", icon: Zap, col: "md:col-span-2", bg: "bg-gradient-to-br from-primary/20 to-transparent" },
                            { title: "Risk DNA", desc: "Our risk profiler ensures your portfolio matches your psychological and financial comfort levels.", icon: Lock, col: "", bg: "bg-white/5" },
                            { title: "Asset Mapping", desc: "Modern Portfolio Theory applied automatically. Diversification isn't just a buzzword here.", icon: PieChart, col: "", bg: "bg-white/5" },
                            { title: "History Deep-Link", desc: "Track your trajectory over months and years, not just days. Real-time trend analysis.", icon: BarChart3, col: "md:col-span-2", bg: "bg-gradient-to-r from-secondary/20 to-transparent" },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariant}
                                className={`glass-card p-8 ${feature.col} ${feature.bg} relative overflow-hidden group`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                    <feature.icon className="w-32 h-32" />
                                </div>
                                <feature.icon className="w-10 h-10 mb-6 text-white/90" />
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

            </main>

            <footer className="border-t border-white/5 bg-black/20 backdrop-blur-lg mt-20 py-12 text-center">
                <p className="text-white/40 text-sm">
                    Built by{" "}
                    <a
                        href="https://najath.vercel.app"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary hover:underline underline-offset-4"
                    >
                        Najath
                    </a>
                </p>
            </footer>
        </div>
    );
}
