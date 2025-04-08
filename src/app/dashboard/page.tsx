"use client";

import { useEffect, useState } from "react";
import { useGeneratedContent } from "@/context/GeneratedContentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { cn } from "@/lib/utils";

interface Flashcard {
    front: string;
    back: string;
}

interface CourseContent {
    courseId: string;
    courseName: string;
    modules: {
        moduleId: string;
        moduleName: string;
        content: {
            summary?: string;
            flashcards?: string;
            quiz?: string;
        };
    }[];
}

type ContentType = "summary" | "flashcards" | "quiz";

export default function DashboardPage() {
    const { getAllContent } = useGeneratedContent();
    const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ContentType>("summary");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = () => {
            const content = getAllContent();
            const organizedContent: CourseContent[] = [];

            // Organize content by course and module
            Object.entries(content).forEach(([key, value]) => {
                const [courseId, moduleId, type] = key.split("-");
                const courseIndex = organizedContent.findIndex(c => c.courseId === courseId);

                if (courseIndex === -1) {
                    organizedContent.push({
                        courseId,
                        courseName: `Course ${courseId}`,
                        modules: [{
                            moduleId,
                            moduleName: `Module ${moduleId}`,
                            content: { [type as ContentType]: value }
                        }]
                    });
                } else {
                    const moduleIndex = organizedContent[courseIndex].modules.findIndex(
                        m => m.moduleId === moduleId
                    );

                    if (moduleIndex === -1) {
                        organizedContent[courseIndex].modules.push({
                            moduleId,
                            moduleName: `Module ${moduleId}`,
                            content: { [type as ContentType]: value }
                        });
                    } else {
                        organizedContent[courseIndex].modules[moduleIndex].content[type as ContentType] = value;
                    }
                }
            });

            setCourseContent(organizedContent);
            setLoading(false);
        };

        loadContent();
    }, [getAllContent]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const renderCourseContent = (course: CourseContent) => {
        return (
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)} className="space-y-4">
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                        <TabsTrigger value="summary">Summaries</TabsTrigger>
                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                        <TabsTrigger value="quiz">Quizzes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-6">
                        {course.modules.map(module => (
                            <Card key={module.moduleId}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{module.moduleName}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {module.content.summary ? (
                                        <div className="prose dark:prose-invert max-w-none">
                                            <p className="whitespace-pre-line">{module.content.summary}</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No summary available</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="flashcards" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {course.modules.map(module => (
                                module.content.flashcards && (
                                    <Card key={module.moduleId}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{module.moduleName}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {JSON.parse(module.content.flashcards.replace(/```json\n|\n```/g, '').trim()).map((flashcard: Flashcard, index: number) => (
                                                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                                        <p className="font-medium">Front: {flashcard.front}</p>
                                                        <p className="text-gray-600 dark:text-gray-400">Back: {flashcard.back}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="quiz" className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {course.modules.map(module => (
                                module.content.quiz && (
                                    <Card key={module.moduleId}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{module.moduleName}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <InteractiveQuiz
                                                questions={JSON.parse(module.content.quiz.replace(/```json\n|\n```/g, '').trim())}
                                                moduleName={module.moduleName}
                                            />
                                        </CardContent>
                                    </Card>
                                )
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Learning Dashboard</h1>

            <div className="space-y-4">
                {courseContent.map(course => (
                    <Card key={course.courseId} className="overflow-hidden">
                        <CardHeader
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                            onClick={() => setSelectedCourse(selectedCourse === course.courseId ? null : course.courseId)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{course.courseName}</CardTitle>
                                    <CardDescription>
                                        {course.modules.length} modules available
                                    </CardDescription>
                                </div>
                                {selectedCourse === course.courseId ? (
                                    <ChevronDown className="h-5 w-5" />
                                ) : (
                                    <ChevronRight className="h-5 w-5" />
                                )}
                            </div>
                        </CardHeader>
                        <div className={cn(
                            "transition-all duration-200 ease-in-out",
                            selectedCourse === course.courseId ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                        )}>
                            <CardContent className="pt-0">
                                {renderCourseContent(course)}
                            </CardContent>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
} 