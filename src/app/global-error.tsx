'use client';

import { useEffect } from 'react';
import { ShieldX, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Critical Root Error:', error);
    }, [error]);

    return (
        <html>
            <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', background: '#f8fafc' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    padding: '20px',
                    color: '#0f172a'
                }}>
                    <div style={{
                        background: '#fff',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        maxWidth: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            background: '#fee2e2',
                            padding: '1rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ShieldX size={48} color="#dc2626" />
                        </div>

                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Critical System Error</h2>

                        <p style={{ margin: 0, color: '#64748b', lineHeight: 1.6 }}>
                            The application encountered a critical failure in the root layout.
                            We have logged this incident. Please try refreshing to recover.
                        </p>

                        <button
                            onClick={() => reset()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#0f172a',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <RefreshCw size={18} /> Reload Application
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}