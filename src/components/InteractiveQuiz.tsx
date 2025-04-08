"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface InteractiveQuizProps {
    questions: QuizQuestion[];
    moduleName: string;
}

export function InteractiveQuiz({ questions, moduleName }: InteractiveQuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswer = (answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        // Calculate score
        const correctAnswers = answers.reduce((acc, answer, index) => {
            return acc + (answer === questions[index].correctAnswer ? 1 : 0);
        }, 0);

        setScore(correctAnswers);

        setTimeout(() => {
            setIsSubmitting(false);
            setShowResults(true);
        }, 1000);
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setAnswers(Array(questions.length).fill(-1));
        setShowResults(false);
        setScore(0);
    };

    // Check if all questions are answered
    const allAnswered = answers.every(answer => answer !== -1);

    // Display result screen
    if (showResults) {
        const percentage = (score / questions.length) * 100;

        return (
            <Card className="w-full">
                <CardHeader className="text-center border-b pb-4">
                    <CardTitle>Quiz Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-2">Your Score</h3>
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32">
                                    <circle
                                        className="text-gray-200 dark:text-gray-700"
                                        strokeWidth="10"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="56"
                                        cx="64"
                                        cy="64"
                                    />
                                    <circle
                                        className={cn(
                                            "text-primary",
                                            percentage < 50 && "text-red-500",
                                            percentage >= 50 && percentage < 80 && "text-yellow-500",
                                            percentage >= 80 && "text-green-500"
                                        )}
                                        strokeWidth="10"
                                        strokeDasharray={360}
                                        strokeDashoffset={360 - (360 * percentage) / 100}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="56"
                                        cx="64"
                                        cy="64"
                                    />
                                </svg>
                                <span className="absolute text-3xl font-bold">{score}/{questions.length}</span>
                            </div>
                            <p className="text-lg mt-2">
                                {percentage.toFixed(0)}% -
                                {percentage >= 80 ? " Excellent!" :
                                    percentage >= 60 ? " Good job!" :
                                        percentage >= 40 ? " Keep practicing!" :
                                            " Need more study!"}
                            </p>
                        </div>

                        <div className="space-y-4 mt-6">
                            <h3 className="text-xl font-semibold">Question Review</h3>
                            {questions.map((question, index) => (
                                <Card key={index} className={cn(
                                    "border-l-4",
                                    answers[index] === question.correctAnswer
                                        ? "border-l-green-500"
                                        : "border-l-red-500"
                                )}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base">
                                                Question {index + 1}
                                            </CardTitle>
                                            <Badge variant={answers[index] === question.correctAnswer ? "outline" : "destructive"}>
                                                {answers[index] === question.correctAnswer ? (
                                                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Correct</span>
                                                ) : (
                                                    <span className="flex items-center"><XCircle className="h-3 w-3 mr-1" /> Incorrect</span>
                                                )}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium mb-2">{question.question}</p>
                                        <ul className="space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <li
                                                    key={optionIndex}
                                                    className={cn(
                                                        "p-2 rounded flex items-center",
                                                        optionIndex === question.correctAnswer && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                                                        optionIndex === answers[index] && optionIndex !== question.correctAnswer && "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                                    )}
                                                >
                                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                                    {optionIndex === question.correctAnswer && (
                                                        <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                                                    )}
                                                    {optionIndex === answers[index] && optionIndex !== question.correctAnswer && (
                                                        <XCircle className="h-4 w-4 ml-auto text-red-600" />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <Button onClick={resetQuiz}>Take Quiz Again</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Display quiz taking screen
    return (
        <Card className="w-full">
            <CardHeader className="border-b pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle>{moduleName} - Quiz</CardTitle>
                    <Badge variant="outline">
                        Question {currentQuestion + 1} of {questions.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <Progress
                        value={((currentQuestion + 1) / questions.length) * 100}
                    />

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            {questions[currentQuestion].question}
                        </h3>

                        <RadioGroup
                            value={answers[currentQuestion] === -1 ? undefined : answers[currentQuestion].toString()}
                            onValueChange={(value) => handleAnswer(parseInt(value))}
                            className="space-y-3"
                        >
                            {questions[currentQuestion].options.map((option, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center space-x-2 rounded-md border p-3 transition-colors",
                                        answers[currentQuestion] === index && "border-primary bg-primary/10"
                                    )}
                                >
                                    <RadioGroupItem
                                        value={index.toString()}
                                        id={`option-${index}`}
                                    />
                                    <Label
                                        htmlFor={`option-${index}`}
                                        className="flex-grow cursor-pointer font-normal"
                                    >
                                        {String.fromCharCode(65 + index)}. {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                >
                    Previous
                </Button>
                <div className="flex gap-2">
                    {currentQuestion === questions.length - 1 ? (
                        <Button
                            disabled={!allAnswered || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? "Calculating..." : "Submit Quiz"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={answers[currentQuestion] === -1}
                        >
                            Next Question
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
} 