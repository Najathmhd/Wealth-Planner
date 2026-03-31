"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import api from "@/lib/api"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        country: "United States",
        employment_type: "Private Sector"
    })
    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await api.post("/auth/register", formData)
            // Redirect to login on success
            router.push("/login?registered=true")
        } catch (err: any) {
            console.error("Registration error:", err)
            setError(err.response?.data?.detail || "Something went wrong. Please try again.")
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
                Back
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px]"
            >
                <div className="glass rounded-2xl p-8 backdrop-blur-xl bg-white/40 dark:bg-black/40 border-white/20 shadow-2xl">
                    <div className="flex flex-col space-y-2 text-center mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                        <p className="text-sm text-muted-foreground">
                            Begin your journey to financial freedom
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
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        placeholder="John Doe"
                                        disabled={loading}
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="bg-white/50 border-white/30 focus:bg-white/70 transition-all"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={loading}
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="bg-white/50 border-white/30 focus:bg-white/70 transition-all"
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
                                        onChange={handleChange as any}
                                        className="bg-white/50 border-white/30 focus:bg-white/70 transition-all font-medium"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <select
                                        id="country"
                                        disabled={loading}
                                        value={formData.country}
                                        onChange={handleChange as any}
                                        className="w-full h-10 rounded-xl bg-white/50 border border-white/30 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        required
                                    >
                                        <option value="United States">United States</option>
                                        <option value="Sri Lanka">Sri Lanka</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Australia">Australia</option>
                                        <option value="India">India</option>
                                        <option value="Canada">Canada</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="employment_type">Employment Type</Label>
                                    <select
                                        id="employment_type"
                                        disabled={loading}
                                        value={formData.employment_type}
                                        onChange={handleChange as any}
                                        className="w-full h-10 rounded-xl bg-white/50 border border-white/30 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        required
                                    >
                                        <option value="Private Sector">Private Sector</option>
                                        <option value="Government">Government</option>
                                        <option value="Business Owner">Business Owner</option>
                                        <option value="Freelancer/Daily Wage">Freelancer/Daily Wage</option>
                                    </select>
                                </div>

                                <Button disabled={loading} className="w-full bg-primary hover:bg-primary/90 shadow-lg">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted-foreground/20" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" type="button" disabled={loading} className="bg-white/5 hover:bg-white/10 border-white/10 text-white hover:text-white" onClick={() => alert("Google Login not yet implemented via backend API.")}>
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground mt-6">
                        <Link
                            href="/login"
                            className="hover:text-primary underline underline-offset-4 font-medium"
                        >
                            Already have an account? Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
