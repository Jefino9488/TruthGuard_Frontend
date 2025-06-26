import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import {
    Shield,
    Database,
    Search,
    BarChart3,
    TrendingUp,
    Zap,
    Home,
    Eye,
} from "lucide-react";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TruthGuard",
    description:
        "Real-time media bias and misinformation detection using MongoDB and Google AI",
    generator: "v0.dev",
    icons: {
        icon: "/top.ico",
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="light" style={{ colorScheme: "light" }}>
        <body className={inter.className}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <Suspense fallback={<div>Loading...</div>}>
                <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
                    <div className="container mx-auto px-4">
                        <div className="flex h-16 items-center justify-between">
                            <Link href="/" className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold">TruthGuard</span>
                                <span className="text-sm text-gray-500">× MongoDB</span>
                            </Link>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href="/"
                                    className="flex items-center space-x-1 text-sm hover:text-blue-600"
                                >
                                    <Home className="h-4 w-4" />
                                    <span>Home</span>
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-1 text-sm hover:text-blue-600"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    href="/search"
                                    className="flex items-center space-x-1 text-sm hover:text-blue-600"
                                >
                                    <Search className="h-4 w-4" />
                                    <span>Search</span>
                                </Link>
                                <Link
                                    href="/analyze"
                                    className="flex items-center space-x-1 text-sm hover:text-blue-600"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span>Analyze</span>
                                </Link>
                                <Link
                                    href="/trends"
                                    className="flex items-center space-x-1 text-sm hover:text-blue-600"
                                >
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Trends</span>
                                </Link>

                                <Link
                                    href="/media-verify"
                                    className="flex items-center space-x-1 text-sm hover:text-blue-600"
                                >
                                    <Eye className="h-4 w-4" />{" "}
                                    {/* Add Eye to your lucide-react imports */}
                                    <span>Media Verify</span>
                                </Link>
                                <Link
                                    href="/mongodb-showcase"
                                    className="flex items-center space-x-1 text-sm hover:text-green-600 font-medium"
                                >
                                    <Database className="h-4 w-4" />
                                    <span>MongoDB Demo</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>
                {children}
            </Suspense>
        </ThemeProvider>
        </body>
        </html>
    );
}