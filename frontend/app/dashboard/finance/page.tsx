"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { PlusCircle, Save, Trash2, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useFinance } from "@/context/FinanceContext"

interface IncomeSource {
    name: string;
    amount: number;
}
interface ExpenseItem {
    category: string;
    amount: number;
}
interface SavingsGoal {
    name: string;
    target_amount: number;
    target_date: string | null;
}

export default function FinancePage() {
    const router = useRouter()
    const { latest, refreshData, currencySymbol } = useFinance()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [showSuccessNav, setShowSuccessNav] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const [incomes, setIncomes] = useState<IncomeSource[]>([{ name: "", amount: 0 }])
    const [expenses, setExpenses] = useState<ExpenseItem[]>([{ category: "", amount: 0 }])
    const [goals, setGoals] = useState<SavingsGoal[]>([{ name: "", target_amount: 0, target_date: "" }])

    useEffect(() => {
        if (latest) {
            if (latest.incomes?.length > 0) setIncomes(latest.incomes)
            if (latest.expenses?.length > 0) setExpenses(latest.expenses)
            if (latest.savings_goals?.length > 0) setGoals(latest.savings_goals)
            setFetching(false)
        }
    }, [latest])

    const handleAddIncome = () => setIncomes([...incomes, { name: "", amount: 0 }])
    const handleRemoveIncome = (index: number) => setIncomes(incomes.filter((_, i) => i !== index))
    const updateIncome = (index: number, field: keyof IncomeSource, value: any) => {
        const newIncomes = [...incomes]
        newIncomes[index] = { ...newIncomes[index], [field]: value }
        setIncomes(newIncomes)
    }

    const handleAddExpense = () => setExpenses([...expenses, { category: "", amount: 0 }])
    const handleRemoveExpense = (index: number) => setExpenses(expenses.filter((_, i) => i !== index))
    const updateExpense = (index: number, field: keyof ExpenseItem, value: any) => {
        const newExpenses = [...expenses]
        newExpenses[index] = { ...newExpenses[index], [field]: value }
        setExpenses(newExpenses)
    }

    const handleAddGoal = () => setGoals([...goals, { name: "", target_amount: 0, target_date: null }])
    const handleRemoveGoal = (index: number) => setGoals(goals.filter((_, i) => i !== index))
    const updateGoal = (index: number, field: keyof SavingsGoal, value: any) => {
        const newGoals = [...goals]
        newGoals[index] = { ...newGoals[index], [field]: value }
        setGoals(newGoals)
    }

    const handleSave = async () => {
        setLoading(true)
        setStatus(null)
        try {
            const payload = {
                incomes: incomes.map(i => ({ name: i.name, amount: Number(i.amount) || 0 })),
                expenses: expenses.map(e => ({ category: e.category, amount: Number(e.amount) || 0 })),
                savings_goals: goals.map(g => ({ name: g.name, target_amount: Number(g.target_amount) || 0, target_date: g.target_date })),
                date: new Date().toISOString().split('T')[0]
            }

            await api.post("/finance/save", payload)
            await refreshData()

            setStatus({ type: 'success', message: 'Financial data updated successfully!' })
            setShowSuccessNav(true)
        } catch (err: any) {
            console.error("Save error:", err)
            setStatus({ type: 'error', message: 'Failed to update data. Please try again.' })
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Finance Input</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-md flex flex-col gap-3 ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <div className="flex items-center">
                        {status.type === 'success' ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                        {status.message}
                    </div>
                    {status.type === 'success' && showSuccessNav && (
                        <div className="flex gap-2 ml-6">
                            <Link href="/dashboard/analytics">
                                <Button size="sm" variant="outline" className="h-8 text-[10px] border-green-500/20 hover:bg-green-500/10 text-green-500 hover:text-green-500 transition-all font-bold group uppercase tracking-widest px-3">
                                    View Analytics
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button size="sm" variant="outline" className="h-8 text-[10px] border-green-500/20 hover:bg-green-500/10 text-green-500 hover:text-green-500 transition-all font-bold group uppercase tracking-widest px-3">
                                    Back to Overview
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <Tabs defaultValue="income" className="space-y-4">
                <TabsList className="bg-black/20 border border-white/10">
                    <TabsTrigger value="income" className="data-[state=active]:bg-primary data-[state=active]:text-white">Income</TabsTrigger>
                    <TabsTrigger value="expenses" className="data-[state=active]:bg-primary data-[state=active]:text-white">Expenses</TabsTrigger>
                    <TabsTrigger value="savings" className="data-[state=active]:bg-primary data-[state=active]:text-white">Savings Goals</TabsTrigger>
                </TabsList>

                <TabsContent value="income" className="space-y-4">
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Income Sources</CardTitle>
                            <CardDescription>
                                Add your regular streams of income here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {incomes.map((income, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-5 space-y-2">
                                        <Label className="text-white">Source Name</Label>
                                        <Input
                                            value={income.name}
                                            onChange={(e) => updateIncome(index, 'name', e.target.value)}
                                            placeholder="e.g. Salary, Freelance"
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-5 space-y-2">
                                        <Label className="text-white">Monthly Amount ({currencySymbol})</Label>
                                        <Input
                                            type="number"
                                            value={income.amount || ''}
                                            onChange={(e) => updateIncome(index, 'amount', parseFloat(e.target.value))}
                                            placeholder="0.00"
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button variant="destructive" size="icon" onClick={() => handleRemoveIncome(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" onClick={handleAddIncome} className="border-white/10 text-white hover:bg-white/10">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Source
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Monthly Expenses</CardTitle>
                            <CardDescription>
                                Track your recurring bills and spending habits.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {expenses.map((expense, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-5 space-y-2">
                                        <Label className="text-white">Category</Label>
                                        <Input
                                            value={expense.category}
                                            onChange={(e) => updateExpense(index, 'category', e.target.value)}
                                            placeholder="e.g. Rent, Groceries"
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-5 space-y-2">
                                        <Label className="text-white">Estimated Amount ({currencySymbol})</Label>
                                        <Input
                                            type="number"
                                            value={expense.amount || ''}
                                            onChange={(e) => updateExpense(index, 'amount', parseFloat(e.target.value))}
                                            placeholder="0.00"
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button variant="destructive" size="icon" onClick={() => handleRemoveExpense(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" onClick={handleAddExpense} className="border-white/10 text-white hover:bg-white/10">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="savings" className="space-y-4">
                    <Card className="glass border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Savings & Investment Goals</CardTitle>
                            <CardDescription>
                                What are you saving for?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {goals.map((goal, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4 space-y-2">
                                        <Label className="text-white">Goal Name</Label>
                                        <Input
                                            value={goal.name}
                                            onChange={(e) => updateGoal(index, 'name', e.target.value)}
                                            placeholder="e.g. House, Car"
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-white">Target Amount ({currencySymbol})</Label>
                                        <Input
                                            type="number"
                                            value={goal.target_amount || ''}
                                            onChange={(e) => updateGoal(index, 'target_amount', parseFloat(e.target.value))}
                                            placeholder="10000.00"
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-white">Target Date</Label>
                                        <Input
                                            type="date"
                                            value={goal.target_date || ''}
                                            onChange={(e) => updateGoal(index, 'target_date', e.target.value)}
                                            className="bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Button variant="destructive" size="icon" onClick={() => handleRemoveGoal(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" onClick={handleAddGoal} className="border-white/10 text-white hover:bg-white/10">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
