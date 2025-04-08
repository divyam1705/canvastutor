"use client";

import { useState, useEffect } from "react";
import { useGeneratedContent } from "@/context/GeneratedContentContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FlashcardViewer } from "@/components/FlashcardViewer";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";

interface ModuleContentProps {
    moduleId: string;
    moduleName: string;
    items: Array<{
        id: number;
        title: string;
        type: string;
        url: string;
    }>;
}

interface Flashcard {
    front: string;
    back: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

export function ModuleContent({ moduleId, moduleName, items }: ModuleContentProps) {
    const { generateContent, getContent, isLoading } = useGeneratedContent();
    const [pageContents, setPageContents] = useState<Record<number, string>>({});
    const [loadingPages, setLoadingPages] = useState<Record<number, boolean>>({});
    const [fetchedPages, setFetchedPages] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"flashcards" | "summary" | "quiz" | null>(null);

    // Fetch content from each page
    useEffect(() => {
        const fetchPageContents = async () => {
            const pageItems = items.filter(item => item.type === "Page");
            console.log("fetching page contents", pageItems);
            const apiKey = new URLSearchParams(window.location.search).get("apiKey") || "";

            for (const item of pageItems) {
                // Skip if already fetched or currently loading
                if (fetchedPages.includes(item.id) || loadingPages[item.id]) {
                    continue;
                }

                setLoadingPages(prev => ({ ...prev, [item.id]: true }));
                try {
                    const pageUrl = item.url;

                    if (!pageUrl) {
                        console.error(`No URL available for ${item.title}`);
                        toast.error(`Failed to fetch content for ${item.title}`);
                        continue;
                    }

                    // Use the backend API with pageUrl
                    const response = await fetch(`/api/content?apiKey=${encodeURIComponent(apiKey)}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            pageUrl
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || `Failed to fetch content: ${response.statusText}`);
                    }

                    const data = await response.json();

                    // Canvas API returns a 'body' field with the HTML content
                    const content = extractPageContent(data.body || "");
                    setPageContents(prev => ({ ...prev, [item.id]: content }));

                    // Mark this page as fetched
                    setFetchedPages(prev => [...prev, item.id]);
                } catch (error) {
                    console.error(`Error fetching page content for ${item.id}:`, error);
                    toast.error(`Failed to fetch content for ${item.title}`);
                } finally {
                    setLoadingPages(prev => ({ ...prev, [item.id]: false }));
                }
            }
        };

        fetchPageContents();
        // Only re-run if items or fetchedPages change
    }, [items, fetchedPages]);

    // Extract main content from HTML
    const extractPageContent = (html: string): string => {
        if (!html) return "";

        // Remove script and style tags
        const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

        // Extract text content
        const textContent = cleanHtml.replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return textContent;
    };

    // Combine all content for generation
    const getModuleContent = () => {
        const pageContent = Object.values(pageContents).join("\n\n");
        const itemContent = items
            .map((item) => `${item.title} (${item.type})`)
            .join("\n");
        return `${itemContent}\n\n${pageContent}`;
    };

    const handleGenerate = async (type: "flashcards" | "summary" | "quiz") => {
        try {
            const content = getModuleContent();
            await generateContent(moduleId, type, content);
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`);
            setModalType(type);
            setIsModalOpen(true);
        } catch (error) {
            console.error(`Error generating ${type}:`, error);
            toast.error(`Failed to generate ${type}`);
        }
    };

    const handleOpenModal = (type: "flashcards" | "summary" | "quiz") => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const renderContentPreview = (type: "flashcards" | "summary" | "quiz") => {
        const content = getContent(moduleId, type);
        const loading = isLoading[`${moduleId}-${type}`];

        if (loading) {
            return (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Generating...</span>
                </div>
            );
        }

        if (content) {
            return (
                <Button variant="outline" size="sm" onClick={() => handleOpenModal(type)}>
                    View {type}
                </Button>
            );
        }

        return (
            <Button variant="outline" size="sm" onClick={() => handleGenerate(type)}>
                Generate {type}
            </Button>
        );
    };

    const renderModalContent = () => {
        if (!modalType) return null;

        const content = getContent(moduleId, modalType);
        const loading = isLoading[`${moduleId}-${modalType}`];

        if (loading) {
            return (
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2">Generating {modalType}...</span>
                </div>
            );
        }

        if (!content) {
            return (
                <div className="text-center p-8">
                    <p className="mb-4">No {modalType} available for this module.</p>
                    <Button onClick={() => handleGenerate(modalType)}>Generate {modalType}</Button>
                </div>
            );
        }

        try {
            if (modalType === "flashcards") {
                // Clean and parse the content
                const cleanContent = content.replace(/```json\n|\n```/g, '').trim();
                const flashcards = JSON.parse(cleanContent) as Flashcard[];
                return <FlashcardViewer flashcards={flashcards} />;
            } else if (modalType === "quiz") {
                // Clean and parse the content
                const cleanContent = content.replace(/```json\n|\n```/g, '').trim();
                const questions = JSON.parse(cleanContent) as QuizQuestion[];
                return <InteractiveQuiz questions={questions} moduleName={moduleName} />;
            } else {
                // For summary, use markdown renderer
                return <MarkdownViewer content={content} />;
            }
        } catch (error) {
            console.error(`Error parsing ${modalType} content:`, error);
            return (
                <div className="text-center p-8">
                    <p className="mb-4">Error displaying {modalType}. Please try generating again.</p>
                    <Button onClick={() => handleGenerate(modalType)}>Regenerate {modalType}</Button>
                </div>
            );
        }
    };

    return (
        <>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>{moduleName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Get a comprehensive summary of the module content.
                                </p>
                                {renderContentPreview("summary")}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Flashcards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Study with interactive flashcards.
                                </p>
                                {renderContentPreview("flashcards")}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Quiz</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Test your knowledge with a quiz.
                                </p>
                                {renderContentPreview("quiz")}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            {/* Modal for displaying content */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalType ? `${moduleName} - ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}` : ""}
            >
                <Tabs value={modalType || "summary"} onValueChange={(value) => setModalType(value as "flashcards" | "summary" | "quiz")}>
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                        <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    </TabsList>
                    <div className="min-h-[500px]">
                        {renderModalContent()}
                    </div>
                </Tabs>
            </Modal>
        </>
    );
} 