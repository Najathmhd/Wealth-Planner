"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import api, { setAuthToken } from "@/lib/api"

export default function AdminLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })
    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.id === "email") {
            setFormData({ ...formData, username: e.target.value })
        } else {
            setFormData({ ...formData, [e.target.id]: e.target.value })
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const params = new URLSearchParams()
            params.append('username', formData.username)
            params.append('password', formData.password)

            const response = await api.post("/auth/login", params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })

            const { access_token } = response.data
            setAuthToken(access_token)
            
            const userResponse = await api.get("/auth/me");
            if (userResponse.data.role !== "admin") {
                setAuthToken("");
                setError("Access Denied: You do not have admin permissions.");
                setLoading(false);
                return;
            }

            router.push("/admin/dashboard")
        } catch (err: any) {
            console.error("Admin Login error:", err)
            setError(err.response?.data?.detail || "Invalid credentials. Please try again.")
            setAuthToken("");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
            <Link
                href="/"
                className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground z-10"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Public
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px] z-10"
            >
                <div className="glass rounded-2xl p-8 backdrop-blur-xl bg-white/40 dark:bg-black/40 border-white/20 shadow-2xl">
                    <div className="flex flex-col items-center space-y-2 text-center mb-6">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
                        <p className="text-sm text-muted-foreground">
                            Secure access for authorized personnel
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-4">
                                {error && (
                                    <div className="flex items-center text-red-500 text-sm p-3 bg-red-500/10 rounded-md border border-red-500/20">
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        {error}
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Admin Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@domain.com"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={loading}
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="bg-white/50 border-white/30 focus:bg-white/70 transition-all text-black dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        disabled={loading}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="bg-white/50 border-white/30 focus:bg-white/70 transition-all text-black dark:text-white"
                                        required
                                    />
                                </div>
                                <Button disabled={loading} className="w-full bg-primary hover:bg-primary/90 shadow-lg transition-all">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Authenticate
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
