"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Home, PieChart, Settings, TrendingUp, Wallet, Menu } from "lucide-react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    const routes = [
        {
            label: "Overview",
            icon: Home,
            href: "/dashboard",
            active: pathname === "/dashboard",
        },
        {
            label: "Income & Expenses",
            icon: Wallet,
            href: "/dashboard/finance",
            active: pathname === "/dashboard/finance",
        },
        {
            label: "Investments",
            icon: TrendingUp,
            href: "/dashboard/recommendations",
            active: pathname === "/dashboard/recommendations",
        },
        {
            label: "Analytics",
            icon: BarChart3,
            href: "/dashboard/analytics",
            active: pathname === "/dashboard/analytics",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/dashboard/settings",
            active: pathname === "/dashboard/settings",
        },
    ]

    return (
        <div className={cn("pb-12 h-full", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-6 px-4 text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Wealth Planner
                    </h2>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Link key={route.href} href={route.href}>
                                <Button
                                    variant={route.active ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start text-sm transition-all duration-200",
                                        route.active
                                            ? "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
                                            : "text-muted-foreground hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <route.icon className={cn("mr-2 h-4 w-4", route.active ? "text-primary" : "")} />
                                    {route.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

import { FinanceProvider } from "@/context/FinanceContext"
import ChatBot from "@/components/ChatBot"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isAuthChecking, setIsAuthChecking] = useState(true)

    useEffect(() => {
        // Initial check to prevent flash of content
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token")
            if (!token) {
                router.push("/login")
            } else {
                setIsAuthChecking(false)
            }
        }
    }, [router])

    if (isAuthChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <TrendingUp className="h-12 w-12 text-primary animate-pulse" />
                    <p className="text-white/60 text-sm font-medium">Securing session...</p>
                </div>
            </div>
        )
    }


    return (
        <FinanceProvider>
            <div className="flex min-h-screen bg-background">
                {/* Desktop Sidebar */}
                <aside className="hidden w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl md:block fixed inset-y-0 z-50">
                    <Sidebar />
                </aside>

                {/* Mobile Header */}
                <div className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between p-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="flex items-center gap-2 font-bold text-white">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Wealth Planner
                    </div>
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] border-r border-white/10 bg-black/90 p-0">
                            <Sidebar className="px-2" />
                        </SheetContent>
                    </Sheet>
                </div>

                <main className="flex-1 md:pl-64">
                    <div className="container p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>

                {/* Global AI ChatBot */}
                <ChatBot />
            </div>
        </FinanceProvider>
    )
}
