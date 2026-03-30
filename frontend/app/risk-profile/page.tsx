"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function RiskProfilePage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const questions = [
        {
            id: "age",
            question: "What is your current age range?",
            options: [
                { value: "18-25", label: "18-25" },
                { value: "26-35", label: "26-35" },
                { value: "36-50", label: "36-50" },
                { value: "50+", label: "50+" },
            ]
        },
        {
            id: "goal",
            question: "What is your primary investment goal?",
            options: [
                { value: "growth", label: "Maximum Growth (High Risk)" },
                { value: "balanced", label: "Balanced Growth & Stability" },
                { value: "income", label: "Steady Income" },
                { value: "preservation", label: "Capital Preservation (Low Risk)" },
            ]
        },
        {
            id: "horizon",
            question: "How long do you plan to hold your investments?",
            options: [
                { value: "short", label: "Less than 3 years" },
                { value: "medium", label: "3-7 years" },
                { value: "long", label: "More than 7 years" },
            ]
        },
        {
            id: "reaction",
            question: "How would you react if your portfolio lost 20% in a month?",
            options: [
                { value: "sell_all", label: "Sell everything immediately" },
                { value: "sell_some", label: "Sell some to cut losses" },
                { value: "hold", label: "Do nothing and wait" },
                { value: "buy_more", label: "Buy more (Market is on sale!)" },
            ]
        }
    ]

    const handleOptionSelect = (value: string) => {
        setAnswers({ ...answers, [questions[step - 1].id]: value })
    }

    const handleNext = () => {
        if (step < questions.length) {
            setStep(step + 1)
        } else {
            // Calculate and submit risk profile
            console.log("Answers:", answers)
            // Ideally, send this to backend or store in context
            router.push("/dashboard/recommendations")
        }
    }

    const currentQuestion = questions[step - 1]
    const isLastStep = step === questions.length

    return (
        <div className="flex min-h-screen items-center justify-center bg-black/95 p-4 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black -z-10" />

            <Card className="w-full max-w-lg border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">Risk Profile Assessment</CardTitle>
                        <span className="text-sm text-slate-400">Step {step} of {questions.length}</span>
                    </div>
                    <CardDescription className="text-slate-400">
                        Help us tailor your investment strategy.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {currentQuestion.question}
                        </Label>
                        <RadioGroup
                            onValueChange={handleOptionSelect}
                            value={answers[currentQuestion.id]}
                            className="space-y-3"
                        >
                            {currentQuestion.options.map((option) => (
                                <div key={option.value} className="flex items-center space-x-3 rounded-lg border border-white/10 p-4 transition-all hover:bg-white/5 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-500/10">
                                    <RadioGroupItem value={option.value} id={option.value} className="border-white/50 text-purple-500" />
                                    <Label htmlFor={option.value} className="flex-1 cursor-pointer font-normal text-slate-200">
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={handleNext}
                        disabled={!answers[currentQuestion.id]}
                    >
                        {isLastStep ? "View Recommendations" : "Next Question"}
                        {isLastStep ? <CheckCircle2 className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
