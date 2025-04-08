"use client";

import Link from "next/link";
import { ThemeToggle } from "./ui/theme-toggle";

export function Navbar() {
    return (
        <nav className="border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                    Canvas Tutor
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
} 