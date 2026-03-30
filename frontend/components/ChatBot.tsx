"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, x, Send, Loader2, Bot, User, Minimize2, Maximize2, X } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<{ role: 'bot' | 'user', content: string }[]>([
        { role: 'bot', content: "Hello! I'm your AI Wealth Advisor. How can I help you with your financial planning today?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const res = await api.post("/chat/ask", { message: userMsg })
            setMessages(prev => [...prev, { role: 'bot', content: res.data.response }])
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || "Sorry, I'm having trouble connecting right now. Please try again later."
            setMessages(prev => [...prev, { role: 'bot', content: errorMsg }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="h-16 w-16 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform border-4 border-white/10"
                    >
                        <MessageSquare className="h-8 w-8 text-white" />
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-secondary rounded-full border-2 border-white animate-bounce" />
                    </motion.button>
                )}

                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.9 }}
                        className="w-[400px] h-[600px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-primary/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center border border-white/20">
                                    <Bot className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-none">Wealth Advisor AI</p>
                                    <p className="text-[10px] text-emerald-400 font-medium">● Online / Gemini 3 Flash</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-8 w-8 text-white/60 hover:text-white">
                                    <Minimize2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white/60 hover:text-white hover:bg-red-500/20">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {messages.map((msg, i) => {
                                const renderMessage = (content: string) => {
                                    if (msg.role === 'user') return content;
                                    
                                    return content.split('\n').map((line, blockIdx) => {
                                        if (!line.trim()) return <div key={blockIdx} className="h-2" />;
                                        
                                        const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                                        const styledLine = isBullet ? line.replace(/^[\*\-]\s/, '') : line;
                                        
                                        const parts = styledLine.split(/(\*\*.*?\*\*)/g);
                                        const renderedLine = parts.map((part, partIdx) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={partIdx} className="text-emerald-400 font-bold">{part.slice(2, -2)}</strong>;
                                            }
                                            return <span key={partIdx}>{part}</span>;
                                        });

                                        return (
                                            <div key={blockIdx} className={`mb-1.5 ${isBullet ? 'flex gap-2 ml-2' : 'leading-relaxed'}`}>
                                                {isBullet && <span className="text-emerald-400 font-bold mt-0.5">•</span>}
                                                <div>{renderedLine}</div>
                                            </div>
                                        );
                                    });
                                };

                                return (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white/10 text-white/90 border border-white/5 rounded-tl-none shadow-lg'
                                            }`}>
                                            {renderMessage(msg.content)}
                                        </div>
                                    </div>
                                );
                            })}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary h-10"
                                    placeholder="Ask anything about your wealth..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <Button size="icon" type="submit" disabled={loading} className="h-10 w-10 bg-primary">
                                    <Send className="h-4 w-4 text-white" />
                                </Button>
                            </form>
                            <p className="text-[9px] text-center text-white/30 mt-2">AI-generated advice should be verified with a professional.</p>
                        </div>
                    </motion.div>
                )}

                {isOpen && isMinimized && (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        onClick={() => setIsMinimized(false)}
                        className="w-[200px] bg-primary rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer shadow-xl border border-white/20"
                    >
                        <Bot className="h-4 w-4 text-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Expand Chat</span>
                        <Maximize2 className="h-3 w-3 text-white/70 ml-auto" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
