"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
    content: string;
    className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
    return (
        <div className={cn("prose dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                components={{
                    h1: ({ className, children, ...props }) => (
                        <h1
                            className={cn(
                                "text-2xl font-bold tracking-tight mt-8 mb-4",
                                className
                            )}
                            {...props}
                        >
                            {children}
                        </h1>
                    ),
                    h2: ({ className, children, ...props }) => (
                        <h2
                            className={cn(
                                "text-xl font-bold tracking-tight mt-6 mb-3",
                                className
                            )}
                            {...props}
                        >
                            {children}
                        </h2>
                    ),
                    h3: ({ className, children, ...props }) => (
                        <h3
                            className={cn("text-lg font-semibold mt-4 mb-2", className)}
                            {...props}
                        >
                            {children}
                        </h3>
                    ),
                    p: ({ className, children, ...props }) => (
                        <p className={cn("my-4 leading-7", className)} {...props}>
                            {children}
                        </p>
                    ),
                    ul: ({ className, children, ...props }) => (
                        <ul
                            className={cn("list-disc list-outside pl-8 my-4 space-y-2", className)}
                            {...props}
                        >
                            {children}
                        </ul>
                    ),
                    ol: ({ className, children, ...props }) => (
                        <ol
                            className={cn("list-decimal list-outside pl-8 my-4 space-y-2", className)}
                            {...props}
                        >
                            {children}
                        </ol>
                    ),
                    li: ({ className, children, ...props }) => (
                        <li className={cn("my-1", className)} {...props}>
                            {children}
                        </li>
                    ),
                    blockquote: ({ className, children, ...props }) => (
                        <blockquote
                            className={cn(
                                "border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic",
                                className
                            )}
                            {...props}
                        >
                            {children}
                        </blockquote>
                    ),
                    code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md my-4"
                                {...props}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        ) : (
                            <code
                                className={cn(
                                    "bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm",
                                    className
                                )}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    a: ({ className, children, ...props }) => (
                        <a
                            className={cn(
                                "text-blue-600 dark:text-blue-400 hover:underline",
                                className
                            )}
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    table: ({ className, children, ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table
                                className={cn(
                                    "min-w-full divide-y divide-gray-300 dark:divide-gray-700",
                                    className
                                )}
                                {...props}
                            >
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ className, children, ...props }) => (
                        <th
                            className={cn(
                                "px-3 py-3.5 text-left font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800",
                                className
                            )}
                            {...props}
                        >
                            {children}
                        </th>
                    ),
                    td: ({ className, children, ...props }) => (
                        <td
                            className={cn(
                                "px-3 py-4 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800",
                                className
                            )}
                            {...props}
                        >
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
} 