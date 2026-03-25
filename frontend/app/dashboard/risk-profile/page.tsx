"use client"

import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, TrendingUp, Clock, Target, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import api from "@/lib/api"

const questions = [
    {
        id: "age",
        title: "Your Age",
        description: "Your investment horizon often scales with age.",
        icon: Clock,
        type: "slider",
        min: 18,
        max: 80,
        unit: "years",
        defaultValue: 30
    },
    {
        id: "investment_goal",
        title: "Primary Goal",
        description: "What are you primarily saving for?",
        icon: Target,
        type: "radio",
        options: [
            { label: "Retirement", value: "retirement" },
            { label: "Wealth Growth", value: "wealth_growth" },
            { label: "Safety / Emergency Fund", value: "safety" }
        ]
    },
    {
        id: "risk_appetite",
        title: "Risk Tolerance",
        description: "How comfortable are you with market volatility? (1: Very Low, 10: Very High)",
        icon: Shield,
        type: "slider",
        min: 1,
        max: 10,
        unit: "",
        defaultValue: 5
    },
    {
        id: "time_horizon",
        title: "Time Horizon",
        description: "When do you plan to need this capital?",
        icon: TrendingUp,
        type: "radio",
        options: [
            { label: "Short Term (< 3 years)", value: 2 },
            { label: "Medium Term (3-10 years)", value: 7 },
            { label: "Long Term (10+ years)", value: 15 }
        ]
    }
]

export default function RiskProfilePage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [formData, setFormData] = useState({
        age: 30,
        investment_goal: "wealth_growth",
        risk_appetite: 5,
        time_horizon: 10
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/recommendations/profile")
                if (response.data) {
                    setFormData({
                        age: response.data.age || 30,
                        investment_goal: response.data.investment_goal || "wealth_growth",
                        risk_appetite: response.data.risk_appetite || 5,
                        time_horizon: response.data.time_horizon || 10
                    })
                }
            } catch (error) {
                console.error("Failed to fetch existing profile:", error)
            } finally {
                setFetching(false)
            }
        }
        fetchProfile()
    }, [])

    if (fetching) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }


    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1)
        } else {
            submitProfile()
        }
    }

    const handleBack = () => {
        if (step > 0) setStep(step - 1)
    }

    const updateField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value })
    }

    const submitProfile = async () => {
        setLoading(true)
        try {
            // Ensure numeric values are actually numbers before sending
            const submissionData = {
                ...formData,
                age: parseInt(formData.age.toString()),
                risk_appetite: parseInt(formData.risk_appetite.toString()),
                time_horizon: parseInt(formData.time_horizon.toString())
            }
            console.log("Submitting Profile Data:", submissionData)
            await api.post("/recommendations/analyze", submissionData)
            // Redirect to recommendations to see the result
            router.push("/dashboard/recommendations")
        } catch (error) {
            console.error("Failed to save profile:", error)
            alert("Failed to save profile. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const currentQuestion = questions[step]

    return (
        <div className="container max-w-2xl py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Risk DNA Assessment</h1>
                    <p className="text-muted-foreground">
                        Help us understand your financial personality to build a perfect strategy.
                    </p>
                </div>

                <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden mb-12">
                    <motion.div
                        className="absolute h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 rounded-xl bg-primary/20 text-primary">
                                        <currentQuestion.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle>{currentQuestion.title}</CardTitle>
                                        <CardDescription>{currentQuestion.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {currentQuestion.type === "slider" ? (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center text-2xl font-bold text-white">
                                            <span>{currentQuestion.min}</span>
                                            <span className="text-primary bg-primary/10 px-4 py-1 rounded-full border border-primary/20">
                                                {(formData as any)[currentQuestion.id]} {currentQuestion.unit}
                                            </span>
                                            <span>{currentQuestion.max}</span>
                                        </div>
                                        <Slider
                                            defaultValue={[(formData as any)[currentQuestion.id]]}
                                            max={currentQuestion.max}
                                            min={currentQuestion.min}
                                            step={1}
                                            onValueChange={(val) => updateField(currentQuestion.id, val[0])}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                ) : (
                                    <RadioGroup
                                        defaultValue={(formData as any)[currentQuestion.id]}
                                        onValueChange={(val) => updateField(currentQuestion.id, val)}
                                        className="grid gap-4"
                                    >
                                        {currentQuestion.options?.map((opt) => (
                                            <div key={opt.value} className="relative">
                                                <RadioGroupItem
                                                    value={opt.value as any}
                                                    id={opt.value as any}
                                                    className="peer sr-only"
                                                />
                                                <Label
                                                    htmlFor={opt.value as any}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all cursor-pointer"
                                                >
                                                    <span className="font-medium text-white">{opt.label}</span>
                                                    <div className="h-4 w-4 rounded-full border border-white/20 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary" />
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between items-center pt-8">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 0 || loading}
                        className="text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : step === questions.length - 1 ? (
                            "Finish Profile"
                        ) : (
                            <>Next <ArrowRight className="ml-2 w-4 h-4" /></>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
