import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/layout/header/Navbar";
import Footer from "@/components/layout/footer/Footer";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "TrustBank - Banking for the Future",
    description: "Secure, fast, and modern banking for everyone.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable}`}>
                <ThemeProvider
                    attribute="data-theme" /* 👈 Matches our CSS [data-theme='dark'] */
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border)'
                            },
                            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
                            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
                        }}
                    />
                    <Navbar />
                    {children}
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}