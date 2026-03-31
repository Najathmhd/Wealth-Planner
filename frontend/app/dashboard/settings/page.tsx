"use client"

import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Settings, User, Bell, Shield, LogOut, Loader2 } from "lucide-react"
import api from "@/lib/api"

import { useFinance } from "@/context/FinanceContext"

export default function SettingsPage() {
    const router = useRouter()
    const { user, loading, refreshData } = useFinance()
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState("")
    const [editedCountry, setEditedCountry] = useState("United States")
    const [editedEmploymentType, setEditedEmploymentType] = useState("Private Sector")

    useEffect(() => {
        if (user) {
            setEditedName(user.full_name || "")
            setEditedCountry(user.country || "United States")
            setEditedEmploymentType(user.employment_type || "Private Sector")
        }
    }, [user])

    const handleSignOut = () => {
        localStorage.removeItem("token")
        router.push("/")
    }


    const handleUpdateProfile = async () => {
        try {
            await api.put("/auth/me", { 
                full_name: editedName,
                country: editedCountry,
                employment_type: editedEmploymentType
            })
            await refreshData()
            setIsEditing(false)
        } catch (error) {
            console.error("Failed to update profile:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 space-y-6 p-0"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/20 rounded-full">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white glow-text">Settings</h2>
                        <p className="text-sm text-muted-foreground">Manage your account preferences.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="glass-card border-white/10 bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <User className="h-5 w-5 text-primary" /> Profile Settings
                            </CardTitle>
                            <CardDescription>Manage your account info and preferences.</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                        >
                            {isEditing ? "Save Changes" : "Edit Profile"}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Display Name</label>
                                {isEditing ? (
                                    <input
                                        className="w-full h-10 rounded-xl bg-black/40 border border-primary/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <div className="h-10 rounded-xl bg-black/20 border border-white/10 px-4 py-2 text-white font-medium">
                                        {user?.full_name || "User"}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Email Address</label>
                                <div className="h-10 rounded-xl bg-black/10 border border-white/5 px-4 py-2 text-white/50 font-medium">
                                    {user?.email || ""}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Country</label>
                                {isEditing ? (
                                    <select
                                        className="w-full h-10 rounded-xl bg-black/40 border border-primary/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={editedCountry}
                                        onChange={(e) => setEditedCountry(e.target.value)}
                                    >
                                        <option value="United States">United States</option>
                                        <option value="Sri Lanka">Sri Lanka</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="Australia">Australia</option>
                                        <option value="India">India</option>
                                        <option value="Canada">Canada</option>
                                    </select>
                                ) : (
                                    <div className="h-10 rounded-xl bg-black/20 border border-white/10 px-4 py-2 text-white font-medium">
                                        {user?.country || "United States"}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Employment Type</label>
                                {isEditing ? (
                                    <select
                                        className="w-full h-10 rounded-xl bg-black/40 border border-primary/30 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={editedEmploymentType}
                                        onChange={(e) => setEditedEmploymentType(e.target.value)}
                                    >
                                        <option value="Private Sector">Private Sector</option>
                                        <option value="Government">Government</option>
                                        <option value="Business Owner">Business Owner</option>
                                        <option value="Freelancer/Daily Wage">Freelancer/Daily Wage</option>
                                    </select>
                                ) : (
                                    <div className="h-10 rounded-xl bg-black/20 border border-white/10 px-4 py-2 text-white font-medium">
                                        {user?.employment_type || "Private Sector"}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="ghost" className="text-white/60" onClick={() => {
                                    setIsEditing(false)
                                    setEditedName(user?.full_name || "")
                                    setEditedCountry(user?.country || "United States")
                                    setEditedEmploymentType(user?.employment_type || "Private Sector")
                                }}>
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-card border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Bell className="h-5 w-5 text-yellow-500" /> Notifications
                            </CardTitle>
                            <CardDescription>Configure how we alert you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full border-white/10 text-white/80 hover:bg-white/10 justify-start h-12 rounded-xl">
                                Manage Smart Alerts
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10 bg-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <Shield className="h-5 w-5 text-emerald-500" /> Security
                            </CardTitle>
                            <CardDescription>Password and 2FA settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full border-white/10 text-white/80 hover:bg-white/10 justify-start h-12 rounded-xl">
                                Change Security PIN
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end pt-8">
                    <Button variant="destructive" className="gap-2 px-8 h-12 rounded-xl bg-red-500/80 hover:bg-red-500" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" /> Sign Out Session
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

