'use client';

import { useState, useRef, MouseEvent } from 'react';
import styles from './DebitCard3D.module.css';
import { Wifi, Aperture } from 'lucide-react';

// 1. Accept Props
interface DebitCard3DProps {
    bankName?: string;
}

export default function DebitCard3D({ bankName = "TrustBank" }: DebitCard3DProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const rotateY = ((mouseX / width) - 0.5) * 30;
        const rotateX = ((mouseY / height) - 0.5) * -30;

        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    return (
        <div className={styles.perspectiveContainer}>
            <div
                className={styles.card}
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`
                }}
            >
                {/* GLOSS EFFECT */}
                <div
                    className={styles.gloss}
                    style={{
                        transform: `translateZ(1px) translateX(${rotate.y * -2}px) translateY(${rotate.x * -2}px)`,
                        opacity: Math.abs(rotate.x) / 30 + Math.abs(rotate.y) / 30
                    }}
                ></div>

                {/* CARD CONTENT */}
                <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                        {/* 2. Use Dynamic Bank Name */}
                        <span className={styles.bankName}>{bankName}</span>
                        <Wifi size={24} className={styles.contactless} />
                    </div>

                    <div className={styles.chipWrapper}>
                        <div className={styles.chip}></div>
                        <Aperture size={32} className={styles.logoIcon} />
                    </div>

                    <div className={styles.cardBottom}>
                        <div className={styles.number}>
                            <span>••••</span> <span>••••</span> <span>••••</span> <span>4289</span>
                        </div>
                        <div className={styles.details}>
                            <div className={styles.holder}>
                                <small>Card Holder</small>
                                <span>ALEX MORGAN</span>
                            </div>
                            <div className={styles.expiry}>
                                <small>Expires</small>
                                <span>12/29</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD TEXTURE */}
                <div className={styles.texture}></div>
            </div>
        </div>
    );
}