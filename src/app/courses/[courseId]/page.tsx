"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanvasModule, CanvasModuleItem } from "@/types/canvas";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ModuleContent } from "@/components/ModuleContent";

export default function CoursePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const courseId = params.courseId as string;
    const apiKey = searchParams.get("apiKey");
    const [modules, setModules] = useState<CanvasModule[]>([]);
    const [moduleItems, setModuleItems] = useState<Record<number, CanvasModuleItem[]>>({});
    const [loading, setLoading] = useState(true);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            if (!apiKey) {
                toast.error("API key is required");
                return;
            }

            try {
                const response = await fetch(
                    `/api/courses/${courseId}/modules?apiKey=${encodeURIComponent(
                        apiKey
                    )}`
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch modules");
                }

                setModules(data);

                // Fetch items for each module
                const itemsPromises = data.map(async (module: CanvasModule) => {
                    try {
                        const itemsResponse = await fetch(
                            `/api/courses/${courseId}/modules/${module.id}/items?apiKey=${encodeURIComponent(
                                apiKey
                            )}`
                        );
                        const itemsData = await itemsResponse.json();

                        if (!itemsResponse.ok) {
                            throw new Error(itemsData.error || "Failed to fetch module items");
                        }

                        return { moduleId: module.id, items: itemsData };
                    } catch (error) {
                        console.error(`Error fetching items for module ${module.id}:`, error);
                        return { moduleId: module.id, items: [] };
                    }
                });

                const itemsResults = await Promise.all(itemsPromises);
                const itemsMap: Record<number, CanvasModuleItem[]> = {};

                itemsResults.forEach(result => {
                    itemsMap[result.moduleId] = result.items;
                });

                setModuleItems(itemsMap);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to fetch modules"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [apiKey, courseId]);

    const handleBack = () => {
        router.push(`/?apiKey=${encodeURIComponent(apiKey || "")}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center">Loading modules...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <Toaster />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Course Modules</h1>
                    <Button onClick={handleBack} variant="outline">
                        Back to Courses
                    </Button>
                </div>
                <div className="grid gap-4">
                    {modules.map((module) => (
                        <Card key={module.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl">{module.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {moduleItems[module.id]?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <span className="text-sm text-gray-500">
                                                {item.type === "Page" && "📄"}
                                                {item.type === "Assignment" && "📝"}
                                                {item.type === "Quiz" && "❓"}
                                                {item.type === "Discussion" && "💬"}
                                                {item.type === "File" && "📎"}
                                                {item.type === "ExternalUrl" && "🔗"}
                                            </span>
                                            <a
                                                href={item.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                {item.title}
                                            </a>
                                        </div>
                                    )) || (
                                            <div className="text-sm text-gray-500">
                                                No items available in this module
                                            </div>
                                        )}
                                </div>
                                <div className="mt-4">
                                    <Button
                                        onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {selectedModule === module.id ? "Hide Content" : "Generate Content"}
                                    </Button>
                                </div>
                                {selectedModule === module.id && moduleItems[module.id] && (
                                    <ModuleContent
                                        moduleId={module.id.toString()}
                                        moduleName={module.name}
                                        items={moduleItems[module.id]}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
} 