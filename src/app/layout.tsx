import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/components/ThemeProvider";
import CookieBanner from "@/components/layout/cookie/CookieBanner";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Trust Bank - Banking for the Future",
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
                    attribute="data-theme"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            className: 'toast-base',
                            success: {
                                iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' }
                            },
                            error: {
                                iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' }
                            },
                        }}
                    />

                    <NextTopLoader
                        color="var(--primary)"
                        initialPosition={0.08}
                        crawlSpeed={200}
                        height={3}
                        crawl={true}
                        showSpinner={false}
                        easing="ease"
                        speed={200}
                        shadow="0 0 10px var(--primary), 0 0 5px var(--primary-rgb)"
                    />

                    {children}

                    <CookieBanner />
                </ThemeProvider>
            </body>
        </html>
    );
}