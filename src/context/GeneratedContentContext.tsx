"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define types for our generated content
export interface GeneratedContent {
    flashcards?: string;
    summary?: string;
    quiz?: string;
}

// Define the context type
interface GeneratedContentContextType {
    generateContent: (moduleId: string, type: "flashcards" | "summary" | "quiz", content: string) => Promise<void>;
    getContent: (moduleId: string, type: "flashcards" | "summary" | "quiz") => string | null;
    getAllContent: () => Record<string, string>;
    isLoading: Record<string, boolean>;
}

// Create the context
const GeneratedContentContext = createContext<GeneratedContentContextType | undefined>(undefined);

// Create a provider component
export function GeneratedContentProvider({ children }: { children: React.ReactNode }) {
    const [content, setContent] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    // Load content from localStorage on mount
    useEffect(() => {
        const savedContent = localStorage.getItem("generatedContent");
        if (savedContent) {
            setContent(JSON.parse(savedContent));
        }
    }, []);

    // Save content to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("generatedContent", JSON.stringify(content));
    }, [content]);

    const generateContent = async (moduleId: string, type: "flashcards" | "summary" | "quiz", content: string) => {
        const key = `${moduleId}-${type}`;
        setIsLoading((prev) => ({ ...prev, [key]: true }));

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    moduleId,
                    type,
                    content,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate content");
            }

            const data = await response.json();
            setContent((prev) => ({ ...prev, [key]: data.content }));
        } catch (error) {
            console.error("Error generating content:", error);
            throw error;
        } finally {
            setIsLoading((prev) => ({ ...prev, [key]: false }));
        }
    };

    const getContent = (moduleId: string, type: "flashcards" | "summary" | "quiz") => {
        const key = `${moduleId}-${type}`;
        return content[key] || null;
    };

    const getAllContent = () => {
        return content;
    };

    return (
        <GeneratedContentContext.Provider
            value={{
                generateContent,
                getContent,
                getAllContent,
                isLoading,
            }}
        >
            {children}
        </GeneratedContentContext.Provider>
    );
}

// Create a hook to use the context
export function useGeneratedContent() {
    const context = useContext(GeneratedContentContext);
    if (context === undefined) {
        throw new Error("useGeneratedContent must be used within a GeneratedContentProvider");
    }
    return context;
} 