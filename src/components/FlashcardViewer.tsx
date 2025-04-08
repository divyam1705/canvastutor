"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardViewerProps {
    flashcards: Flashcard[];
}

export function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState<"next" | "prev" | null>(null);

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setIsFlipped(false);
            setDirection("next");
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setDirection(null);
            }, 300);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setDirection("prev");
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1);
                setDirection(null);
            }, 300);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    if (!flashcards.length) {
        return <div>No flashcards available.</div>;
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="flex flex-col items-center">
            <div className="w-full mb-4 text-center">
                <p className="text-sm text-gray-500">
                    Card {currentIndex + 1} of {flashcards.length}
                </p>
            </div>

            <div
                className={cn(
                    "relative h-[300px] w-full max-w-lg mb-6 cursor-pointer perspective-1000",
                    {
                        "animate-slide-right": direction === "next",
                        "animate-slide-left": direction === "prev",
                    }
                )}
                onClick={handleFlip}
            >
                <div
                    className={cn(
                        "absolute inset-0 transform-style-3d transition-transform duration-300",
                        isFlipped ? "rotate-y-180" : ""
                    )}
                >
                    {/* Front side */}
                    <div
                        className={cn(
                            "absolute inset-0 flex items-center justify-center p-8 backface-hidden rounded-lg border bg-white dark:bg-gray-800 shadow-md"
                        )}
                    >
                        <div className="text-center">
                            <p className="text-lg font-medium">{currentCard.front}</p>
                            <p className="mt-4 text-sm text-gray-500">Click to flip</p>
                        </div>
                    </div>

                    {/* Back side */}
                    <div
                        className={cn(
                            "absolute inset-0 flex items-center justify-center p-8 backface-hidden rotate-y-180 rounded-lg border bg-white dark:bg-gray-800 shadow-md"
                        )}
                    >
                        <p className="text-lg">{currentCard.back}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-4">
                <Button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    variant="outline"
                    size="icon"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                    {isFlipped ? "Showing Answer" : "Show Answer"}
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={currentIndex === flashcards.length - 1}
                    variant="outline"
                    size="icon"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="mt-4 w-full">
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full">
                    <div
                        className="bg-primary h-1 rounded-full"
                        style={{
                            width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
} 