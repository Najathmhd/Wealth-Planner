"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { downloadCSV } from "@/lib/export"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Users, DollarSign, Activity, Calendar, Shield,
    Filter, LogOut, Briefcase, MapPin, Search, Download, Target, Brain, AlertTriangle, PlusCircle, Save, X, Edit3, Trash2
} from "lucide-react"
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

interface Financials {
    total_savings: number;
    monthly_income: number;
    monthly_expenses: number;
    hidden_wealth: number;
}

interface RiskProfile {
    age?: any;
    investment_goal?: string;
    risk_appetite?: any;
    risk_category?: string;
}

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    country: string;
    employment_type: string;
    created_at: string | null;
    is_active: boolean;
    financials: Financials;
    risk_profile?: RiskProfile | null;
    last_login: string | null;
}

const COLORS = ['var(--chart-1, #3b82f6)', 'var(--chart-2, #10b981)', 'var(--chart-3, #f59e0b)', 'var(--chart-4, #ef4444)', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>([])
    const [metrics, setMetrics] = useState({ total_portfolios: 0, total_savings_goals: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Side Sheet Deep Dive
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    
    // UI Feedback State
    const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null)

    // Sandbox Editor
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({ full_name: "", employment_type: "" })

    // Modals
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

    // Provision Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createForm, setCreateForm] = useState({ email: "", full_name: "", password: "", employment_type: "Private Sector" })

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [empTypeFilter, setEmpTypeFilter] = useState("All")
    const [activityFilter, setActivityFilter] = useState("All") // New state

    // Immediate Security Check (Run once on mount)
    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const meRes = await api.get("/auth/me")
                if (meRes.data.role !== "admin") {
                    router.push("/admin/login")
                }
            } catch (err) {
                router.push("/admin/login")
            }
        }
        verifyAdmin()
    }, [])

    useEffect(() => {
        const debounceId = setTimeout(() => {
            fetchAdminData()
        }, 500)
        return () => clearTimeout(debounceId)
    }, [startDate, endDate, empTypeFilter])
    
    useEffect(() => {
        if(selectedUser) {
            setEditForm({
                full_name: selectedUser.full_name || "",
                employment_type: selectedUser.employment_type || ""
            })
            setIsEditing(false)
        }
    }, [selectedUser])

    const fetchAdminData = async () => {
        // Data is always fetched, but security redirect is handled by immediate useEffect
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (startDate) params.append("start_date", startDate)
            if (endDate) params.append("end_date", endDate)
            if (empTypeFilter && empTypeFilter !== "All") params.append("employment_type", empTypeFilter)

            const res = await api.get(`/admin/users?${params.toString()}`)
            setUsers(res.data.users)
            if(res.data.metrics) setMetrics(res.data.metrics)
            
            if(selectedUser) {
                const refreshed = res.data.users.find((u: UserData) => u.id === selectedUser.id)
                setSelectedUser(refreshed || null)
            }
        } catch (err: any) {
            console.error("Failed to load admin data:", err)
            if (err.response?.status === 401 || err.response?.status === 403) {
                router.push("/admin/login")
            } else {
                setError("Failed to load dashboard data.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
        router.push("/")
    }

    // Provision Boarder Logic
    const handleProvision = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading(true)
        try {
            await api.post("/admin/users", createForm)
            setNotification({ message: "Boarder provisioned successfully! They can now log in.", type: "success" })
            setTimeout(() => setNotification(null), 4000)
            setIsCreateOpen(false)
            setCreateForm({ email: "", full_name: "", password: "", employment_type: "Private Sector" })
            await fetchAdminData()
        } catch(err: any) {
            console.error(err)
            setNotification({ message: err.response?.data?.detail || "Failed to provision user.", type: "error" })
            setTimeout(() => setNotification(null), 4000)
        }
        setActionLoading(false)
    }

    // Sandbox Update Logic
    const handleSaveEdits = async () => {
        if(!selectedUser) return;
        setActionLoading(true)
        try {
            await api.put(`/admin/users/${selectedUser.id}/details`, editForm)
            setIsEditing(false)
            setNotification({ message: "User context synchronized.", type: "success" })
            setTimeout(() => setNotification(null), 4000)
            await fetchAdminData()
        } catch(err: any) {
            console.error(err)
            setNotification({ message: "Failed to synchronize sandbox updates.", type: "error" })
            setTimeout(() => setNotification(null), 4000)
        }
        setActionLoading(false)
    }

    // Delete Logic
    const handleDeleteClick = () => {
        setDeleteConfirmText("")
        setIsDeleteModalOpen(true)
    }

    const executeDelete = async () => {
        if(!selectedUser) return;
        if(deleteConfirmText !== 'DELETE') return;
        
        setActionLoading(true)
        try {
            await api.delete(`/admin/users/${selectedUser.id}`)
            setIsDeleteModalOpen(false)
            setDeleteConfirmText("")
            setIsSheetOpen(false)
            setSelectedUser(null)
            
            setNotification({ message: "Nuclear scrub executed. Target neutralized.", type: "success" })
            setTimeout(() => setNotification(null), 5000)
            await fetchAdminData()
        } catch(err: any) {
            console.error(err)
            setNotification({ message: err.response?.data?.detail || "Delete operation failed.", type: "error" })
            setTimeout(() => setNotification(null), 5000)
        }
        setActionLoading(false)
    }

    const toggleUserStatus = async () => {
        if (!selectedUser) return;
        const new_status = !selectedUser.is_active;

        setActionLoading(true)
        try {
            await api.put(`/admin/users/${selectedUser.id}/status`, { is_active: new_status })
            setIsStatusModalOpen(false)
            setNotification({ message: `Account ${new_status ? 'activated' : 'suspended'} successfully.`, type: "success" })
            setTimeout(() => setNotification(null), 4000)
            await fetchAdminData()
        } catch(err) {
            console.error(err)
            setNotification({ message: "Failed to update account status.", type: "error" })
            setTimeout(() => setNotification(null), 4000)
        }
        setActionLoading(false)
    }

    // Front-end Filtering for Activity
    const filteredUsers = users.filter(u => {
        if (activityFilter === "Inactive") {
            if (!u.last_login) return true; // Never logged in counts as inactive
            const lastLog = new Date(u.last_login);
            const daysDiff = (new Date().getTime() - lastLog.getTime()) / (1000 * 3600 * 24);
            return daysDiff >= 30;
        }
        return true;
    });

    // Aggregations
    const totalUsers = filteredUsers.length
    const totalSavings = filteredUsers.reduce((acc, u) => acc + (u.financials?.total_savings || 0) + (u.financials?.hidden_wealth || 0), 0)
    const avgIncome = totalUsers > 0 ? filteredUsers.reduce((acc, u) => acc + (u.financials?.monthly_income || 0), 0) / totalUsers : 0

    const empDistributionMap: Record<string, number> = {}
    filteredUsers.forEach(u => {
        const t = u.employment_type || "Unknown"
        empDistributionMap[t] = (empDistributionMap[t] || 0) + 1
    })
    const empChartData = Object.keys(empDistributionMap).map(key => ({
        name: key,
        value: empDistributionMap[key]
    }))

    if (loading && users.length === 0) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-[0.2em] animate-pulse">
                    Validating Administrative Credentials...
                </p>
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen bg-transparent w-full">
            <motion.div variants={container} initial="hidden" animate="show" className="container mx-auto p-4 md:p-8 flex-1 space-y-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-text leading-tight">Admin Environment</h2>
                    <p className="text-sm text-muted-foreground font-medium">
                        Monitor and manipulate the system infrastructure.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all font-medium rounded-xl"
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
                        <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 transition-all font-medium rounded-lg h-9" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <motion.div variants={item} className="glass-card bg-white/5 border-white/10 p-5 rounded-2xl shadow-sm backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-4 items-end w-full">
                    <div className="flex-1 w-full space-y-1 text-left">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-md py-2 pl-10 pr-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-1 text-left">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">End Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-md py-2 pl-10 pr-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-1 text-left">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Employment Filter</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <select 
                                value={empTypeFilter}
                                onChange={(e) => setEmpTypeFilter(e.target.value)}
                                className="w-full bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded-md py-2 pl-10 pr-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [&>option]:bg-slate-900 [&>option]:text-white"
                            >
                                <option value="All">All Types</option>
                                <option value="Private Sector">Private Sector</option>
                                <option value="Public Sector">Public Sector</option>
                                <option value="Self-Employed">Self-Employed</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-1 text-left">
                        <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Activity Status</label>
                        <select 
                            value={activityFilter}
                            onChange={(e) => setActivityFilter(e.target.value)}
                            className="w-full bg-slate-900/80 hover:bg-slate-900 border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [&>option]:bg-slate-900 [&>option]:text-white"
                        >
                            <option value="All">All Activity</option>
                            <option value="Inactive">🔴 Dormant (30+ Days)</option>
                        </select>
                    </div>
                    <Button 
                        onClick={() => downloadCSV(users, 'WealthPlanner_Boarders')}
                        variant="outline"
                        className="bg-transparent border-white/20 text-white hover:bg-white/10 transition-all w-full md:w-auto px-6 h-10"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={item}>
                    <Card className="glass-card bg-gradient-to-br from-primary/20 via-primary/5 to-transparent h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Users className="h-16 w-16" /></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{totalUsers}</div>
                            <p className="text-xs text-primary/80 font-medium mt-1">Registered platform accounts</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign className="h-16 w-16" /></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Total Savings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">LKR {totalSavings.toLocaleString()}</div>
                            <p className="text-xs text-blue-400 font-medium mt-1">Aggregate user savings (LKR)</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Target className="h-16 w-16" /></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">Savings Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{metrics.total_savings_goals}</div>
                            <p className="text-xs text-emerald-400 font-medium mt-1">Global goals tracked</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="glass-card bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Brain className="h-16 w-16" /></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white/90">AI Portfolios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{metrics.total_portfolios}</div>
                            <p className="text-xs text-purple-400 font-medium mt-1">Generated by roadmap</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Users Table */}
            <motion.div variants={item}>
                <Card className="glass-card border-white/10 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                        <CardTitle className="text-white text-lg">Platform Users</CardTitle>
                        <div className="text-sm text-muted-foreground">{users.length} retrieved</div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-black/20 text-xs uppercase font-semibold text-muted-foreground border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Details</th>
                                        <th className="px-6 py-4 text-right">Income</th>
                                        <th className="px-6 py-4 text-right">Joined</th>
                                        <th className="px-6 py-4 text-right">Last Seen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((user) => (
                                        <tr 
                                            key={user.id} 
                                            onClick={() => { setSelectedUser(user); setIsSheetOpen(true); }}
                                            className="hover:bg-white/5 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white group-hover:text-primary transition-colors">{user.full_name || "N/A"}</div>
                                                <div className="text-muted-foreground text-xs">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    {!user.is_active && (
                                                        <span className="w-fit px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/20">
                                                            Suspended
                                                        </span>
                                                    )}
                                                    {user.is_active && (
                                                        <span className="w-fit px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 items-start">
                                                <div className="text-sm text-slate-300 flex items-center mb-1">
                                                    <Brain className="h-3 w-3 mr-1 text-primary" />
                                                    {user.risk_profile?.risk_category || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-emerald-400">
                                                LKR {(user.financials?.monthly_income || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-muted-foreground text-xs whitespace-nowrap">
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Legacy"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-xs text-white">
                                                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                                                </div>
                                                {user.last_login && (
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {new Date(user.last_login).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Provision Modal (CREATE) */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsCreateOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-950 border border-white/10 p-6 rounded-2xl w-full max-w-md z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-primary" /> Add New User</h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleProvision} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground font-semibold">Email Address</label>
                                    <input type="email" required value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground font-semibold">Full Name</label>
                                    <input type="text" required value={createForm.full_name} onChange={e => setCreateForm({...createForm, full_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground font-semibold">Password</label>
                                    <input type="password" required value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white focus:border-primary outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground font-semibold">Employment</label>
                                    <select value={createForm.employment_type} onChange={e => setCreateForm({...createForm, employment_type: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-md p-2 text-sm text-white focus:border-primary outline-none">
                                        <option>Private Sector</option>
                                        <option>Government</option>
                                        <option>Self-Employed</option>
                                        <option>Student</option>
                                    </select>
                                </div>
                                <Button disabled={actionLoading} type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2">
                                    Create Account
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                            onClick={() => setIsDeleteModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-black border border-red-900/50 p-6 rounded-2xl w-full max-w-md z-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertTriangle className="h-24 w-24 text-red-500" />
                            </div>
                            <div className="relative">
                                <h3 className="text-xl font-black text-red-500 mb-2 uppercase tracking-widest flex items-center">
                                    <AlertTriangle className="mr-2 h-5 w-5" /> Delete User Account
                                </h3>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                                    You are about to <strong className="text-red-400">permanently delete</strong> this account. 
                                    This action will completely remove all financial records, savings goals, and data associated with <strong>{selectedUser.email}</strong>. 
                                    This cannot be undone.
                                </p>
                                
                                <div className="space-y-2 mb-6">
                                    <label className="text-[10px] text-red-400/80 font-bold uppercase tracking-widest">Type &apos;DELETE&apos; to confirm</label>
                                    <input 
                                        type="text" 
                                        placeholder="DELETE"
                                        value={deleteConfirmText} 
                                        onChange={e => setDeleteConfirmText(e.target.value)} 
                                        className="w-full bg-red-950/20 border border-red-900/50 focus:border-red-500 rounded-md p-3 text-white text-center font-bold tracking-widest outline-none"
                                    />
                                </div>
                                
                                <div className="flex gap-3">
                                    <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white">Cancel</Button>
                                    <Button 
                                        disabled={actionLoading || deleteConfirmText !== "DELETE"} 
                                        onClick={executeDelete} 
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50"
                                    >
                                        Delete User
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Status Modal */}
            <AnimatePresence>
                {isStatusModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsStatusModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-black border border-white/10 p-6 rounded-2xl w-full max-w-sm z-10 shadow-2xl relative overflow-hidden"
                        >
                            <h3 className={`text-xl font-bold mb-2 flex items-center ${selectedUser.is_active ? 'text-orange-400' : 'text-emerald-400'}`}>
                                {selectedUser.is_active ? <AlertTriangle className="mr-2 h-5 w-5" /> : <Shield className="mr-2 h-5 w-5 text-emerald-400" />} 
                                {selectedUser.is_active ? 'Suspend Account' : 'Activate Account'}
                            </h3>
                            <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                                {selectedUser.is_active 
                                    ? `Are you sure you want to revoke system privileges for ${selectedUser.email}? They will instantly lose access to the platform.`
                                    : `Are you sure you want to restore system privileges for ${selectedUser.email}? They will regain full access to their dashboard.`
                                }
                            </p>
                            
                            <div className="flex gap-3">
                                <Button onClick={() => setIsStatusModalOpen(false)} variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white">Cancel</Button>
                                <Button 
                                    disabled={actionLoading} 
                                    onClick={toggleUserStatus} 
                                    className={`flex-1 text-white shadow-lg ${selectedUser.is_active ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/50' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/50'}`}
                                >
                                    {selectedUser.is_active ? "Suspend" : "Activate"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deep-Dive Slide Over (READ / UPDATE / DELETE) */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-slate-950 border-white/10 overflow-y-auto">
                    <SheetHeader className="mb-6 border-b border-white/10 pb-4">
                        <SheetTitle className="text-white text-2xl flex items-center justify-between">
                            <span className="flex items-center">
                                {selectedUser?.full_name || "User Details"}
                                {selectedUser?.role === 'admin' && <Shield className="ml-2 h-4 w-4 text-primary" />}
                                {!selectedUser?.is_active && <AlertTriangle className="ml-3 h-5 w-5 text-red-500" />}
                            </span>
                        </SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            {selectedUser?.email} • Registered {selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "Legacy"}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedUser && (
                        <div className="space-y-6 pb-20">
                            
                            {/* Sandbox Edit Toggle */}
                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                                <div>
                                    <p className="text-sm font-semibold text-white">Edit User Context</p>
                                    <p className="text-xs text-muted-foreground">Update user attributes and location details.</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className={isEditing ? 'text-primary' : 'text-slate-400'}>
                                    {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                </Button>
                            </div>

                            {/* Context Inputs (UPDATE) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Full Name</p>
                                    {isEditing ? (
                                         <input type="text" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:border-primary outline-none" />
                                    ) : (
                                        <p className="text-white">{selectedUser.full_name}</p>
                                    )}
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase mb-2">Employment Type</p>
                                    {isEditing ? (
                                        <select value={editForm.employment_type} onChange={e => setEditForm({...editForm, employment_type: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:border-primary outline-none">
                                            <option>Private Sector</option>
                                            <option>Government</option>
                                            <option>Self-Employed</option>
                                            <option>Student</option>
                                        </select>
                                    ) : (
                                        <p className="text-white">{selectedUser.employment_type}</p>
                                    )}
                                </div>
                            </div>

                            {/* Save Edits button */}
                            <AnimatePresence>
                                {isEditing && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <Button disabled={actionLoading} onClick={handleSaveEdits} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
                                            <Save className="h-4 w-4 mr-2" /> Save Changes
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Data Snapshot */}
                            <div className="opacity-80">
                                <h3 className="text-white text-sm font-semibold flex items-center mb-3">
                                    <Activity className="h-4 w-4 mr-2 text-primary" />
                                    Financial Activity
                                </h3>
                                <div className="space-y-3 bg-black/20 p-4 rounded-lg border border-white/5">
                                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                        <span className="text-muted-foreground text-sm">Monthly Income</span>
                                        <span className="text-emerald-400 font-medium">LKR {selectedUser.financials?.monthly_income.toLocaleString()}</span>
                                    </div>
                                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-muted-foreground text-sm">Monthly Expenses</span>
                                        <span className="text-orange-400 font-medium">LKR {selectedUser.financials?.monthly_expenses.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-muted-foreground text-sm flex items-center">
                                            Hidden Wealth <Sparkles className="h-3 w-3 ml-1 text-emerald-400" />
                                        </span>
                                        <span className="text-emerald-400 font-medium">LKR {selectedUser.financials?.hidden_wealth.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-muted-foreground text-sm">Economic DNA Total</span>
                                        <span className="text-primary font-bold">LKR {(selectedUser.financials?.total_savings + selectedUser.financials?.hidden_wealth).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Intelligence */}
                            <div className="opacity-80">
                                <h3 className="text-white text-sm font-semibold flex items-center mb-3">
                                    <Shield className="h-4 w-4 mr-2 text-indigo-400" />
                                    Risk DNA Assessment
                                </h3>
                                <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Designation</span>
                                        <span className="text-white font-bold">{selectedUser.risk_profile?.risk_category || "UNASSESSED"}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${selectedUser.risk_profile?.risk_category === 'Conservative' ? 'bg-blue-500 w-[30%]' : selectedUser.risk_profile?.risk_category === 'Moderate' ? 'bg-indigo-500 w-[60%]' : selectedUser.risk_profile?.risk_category === 'Aggressive' ? 'bg-rose-500 w-[90%]' : 'w-0'}`} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* System Actions */}
                            <div className="pt-8 border-t border-white/10 space-y-4">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Admin Actions</h3>
                                <div className="space-y-3">
                                    <Button 
                                        className={`w-full transition-all shadow-md ${selectedUser.is_active ? 'bg-orange-900/40 text-orange-400 hover:bg-orange-900/60 border border-orange-900/50' : 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/50'}`}
                                        onClick={() => setIsStatusModalOpen(true)}
                                        disabled={actionLoading}
                                    >
                                        {selectedUser.is_active ? "Suspend User" : "Activate User"}
                                    </Button>
                                </div>
                                
                                {/* DELETE ACTION */}
                                <Button 
                                    variant="destructive" 
                                    className="w-full bg-red-950/50 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-all shadow-lg shadow-red-950"
                                    onClick={handleDeleteClick}
                                    disabled={actionLoading}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User (Permanent)
                                </Button>
                            </div>

                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Global Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center space-x-3 
                        ${notification.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100 shadow-emerald-900/20' : 'bg-red-950/80 border-red-500/50 text-red-100 shadow-red-900/20'}`}
                    >
                        {notification.type === 'success' ? <Shield className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
                        <span className="font-medium tracking-wide">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            </motion.div>
        </div>
    )
}
