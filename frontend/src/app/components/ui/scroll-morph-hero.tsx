"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

export interface TechSolutionCard {
    id: string;
    targetId: string;
    number: string;
    badge: string;
    title: string;
    subtitle: string;
    specs: string;
    tech: string[];
    src: string;
}

// Exactly 4 Solution Cards mapping 1:1 to the 4 solutions below
export const FOUR_SOLUTION_CARDS: TechSolutionCard[] = [
    {
        id: "frontend-engineering",
        targetId: "solution-frontend-engineering",
        number: "01",
        badge: "FRONTEND MASTERY",
        title: "Modern Frontend",
        subtitle: "React 19 & Angular 20",
        specs: "TypeScript · Signals · 60fps",
        tech: ["React 19", "Angular 20", "Tailwind", "Vite"],
        src: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "backend-apis",
        targetId: "solution-backend-apis",
        number: "02",
        badge: "BACKEND POWER",
        title: "Cloud APIs & Microservices",
        subtitle: "Node.js & Python FastAPI",
        specs: "Async · WebSockets · <25ms",
        tech: ["Python 3.12", "FastAPI", "Node.js", "Docker"],
        src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "databases-data",
        targetId: "solution-databases-data",
        number: "03",
        badge: "DATA INTEGRITY",
        title: "Relational Data Architecture",
        subtitle: "PostgreSQL & MySQL",
        specs: "100% ACID · Indexing · Pooling",
        tech: ["PostgreSQL", "MySQL", "Prisma", "SQLAlchemy"],
        src: "https://images.unsplash.com/photo-1597852074816-d933c4d2b988?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: "smart-ai-integration",
        targetId: "solution-smart-ai-integration",
        number: "04",
        badge: "SMART CAPABILITIES",
        title: "Smart AI & Automation",
        subtitle: "LLMs & Intelligent Workflows",
        specs: "Semantic RAG · Auto Extraction",
        tech: ["OpenAI / Gemini", "LangChain", "FastAPI", "pgvector"],
        src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
    },
];

const TOTAL_CARDS = FOUR_SOLUTION_CARDS.length;
const MAX_SCROLL = 2400;

interface FlipCardProps {
    card: TechSolutionCard;
    index: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
    onScrollToCard: (targetId: string, ev?: React.MouseEvent) => void;
}

const IMG_WIDTH = 148;
const IMG_HEIGHT = 205;

function FlipCard({
    card,
    index,
    phase,
    target,
    onScrollToCard,
}: FlipCardProps) {
    return (
        <motion.div
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity,
            }}
            transition={{
                type: "spring",
                stiffness: 40,
                damping: 15,
            }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group select-none"
            onClick={(e) => onScrollToCard(card.targetId, e)}
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl shadow-2xl bg-slate-900 border border-white/20 flex flex-col justify-between"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={card.src}
                        alt={card.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080c24] via-[#080c24]/50 to-black/60 pointer-events-none" />

                    {/* Top Bar */}
                    <div className="relative z-10 flex items-center justify-between p-3">
                        <span className="font-mono font-extrabold text-xs text-[#C5FF3D]">/{card.number}</span>
                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-white/15 text-white uppercase">
                            {card.badge}
                        </span>
                    </div>

                    {/* Bottom Info & Arrow */}
                    <div className="relative z-10 p-3 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-xs font-extrabold text-white leading-tight truncate">{card.title}</p>
                            <span className="text-[10px] font-semibold text-[#C5FF3D] block truncate">{card.subtitle}</span>
                        </div>
                        {/* Interactive Clickable Arrow Button */}
                        <button
                            type="button"
                            onClick={(e) => onScrollToCard(card.targetId, e)}
                            className="w-7 h-7 rounded-full bg-[#C5FF3D] text-[#101947] flex items-center justify-center font-black shadow-md hover:scale-110 hover:bg-white transition-transform flex-shrink-0"
                            title={`Jump to ${card.title} details below`}
                        >
                            ↘
                        </button>
                    </div>
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl shadow-2xl bg-[#101947] flex flex-col justify-between p-3.5 text-center border border-[#2939D9]"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div>
                        <span className="inline-block text-[9px] font-bold text-[#C5FF3D] bg-white/10 px-2 py-0.5 rounded mb-1">
                            {card.badge}
                        </span>
                        <h4 className="text-xs font-extrabold text-white leading-tight mb-1">{card.title}</h4>
                        <p className="text-[10px] text-slate-300 mb-2">{card.subtitle}</p>
                        <div className="text-[9px] font-mono font-bold text-cyan-300 bg-white/5 py-1 px-1.5 rounded mb-2">
                            {card.specs}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {card.tech.map((t) => (
                            <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* Back Jump Button */}
                    <button
                        type="button"
                        onClick={(e) => onScrollToCard(card.targetId, e)}
                        className="w-full bg-[#C5FF3D] hover:bg-white text-[#101947] font-extrabold text-[10px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                        <span>VIEW DETAILS</span>
                        <span>↓</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function IntroAnimation() {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);

        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    const virtualScroll = useMotionValue(0);
    const scrollRef = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
            scrollRef.current = newScroll;
            virtualScroll.set(newScroll);
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };
        const handleTouchMove = (e: TouchEvent) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            touchStartY = touchY;

            const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
            scrollRef.current = newScroll;
            virtualScroll.set(newScroll);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        container.addEventListener("touchstart", handleTouchStart, { passive: false });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
        };
    }, [virtualScroll]);

    const morphProgress = useTransform(virtualScroll, [0, 550], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

    const scrollRotate = useTransform(virtualScroll, [550, 2400], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 60);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 600);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 2200);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    const scatterPositions = useMemo(() => [
        { x: -280, y: -160, rotation: -12, scale: 0.8, opacity: 0.9 },
        { x: 280, y: -150, rotation: 10, scale: 0.8, opacity: 0.9 },
        { x: -240, y: 160, rotation: 8, scale: 0.8, opacity: 0.9 },
        { x: 260, y: 170, rotation: -10, scale: 0.8, opacity: 0.9 },
    ], []);

    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
        const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubscribeMorph();
            unsubscribeRotate();
            unsubscribeParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    const contentOpacity = useTransform(smoothMorph, [0.6, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.6, 1], [20, 0]);

    const handleScrollToCard = (targetId: string, ev?: React.MouseEvent) => {
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        const el = document.getElementById(targetId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("card-jump-highlight");
            setTimeout(() => el.classList.remove("card-jump-highlight"), 2400);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-[560px] bg-[#080c24] text-white overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(41,57,217,0.45),transparent_75%)] pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#080c24] to-transparent pointer-events-none z-10" />

            <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">
                {/* Intro Center Text */}
                <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={introPhase === "circle" && morphValue < 0.6 ? { opacity: 1 - morphValue * 1.8, y: 0 } : { opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-3"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#C5FF3D] animate-ping" />
                        <span className="text-[10px] font-mono tracking-widest text-[#C5FF3D] uppercase">4 Core Full-Stack Architectures</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={introPhase === "circle" && morphValue < 0.6 ? { opacity: 1 - morphValue * 1.8, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 1 }}
                        className="text-2xl md:text-4xl font-extrabold tracking-tight text-white"
                    >
                        Mastering every layer from <br />
                        <span className="text-[#C5FF3D]">Frontend to Database.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={introPhase === "circle" && morphValue < 0.6 ? { opacity: 0.7 - morphValue } : { opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-3 text-xs font-mono font-bold tracking-[0.2em] text-cyan-300"
                    >
                        SCROLL / DRAG &middot; CLICK ARROW TO JUMP TO CARD
                    </motion.p>
                </div>

                {/* Arc Active Content */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[8%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
                >
                    <span className="text-[11px] font-mono tracking-widest text-[#C5FF3D] uppercase mb-1">
                        ✦ PRODUCTION ARCHITECTURAL SUITE
                    </span>
                    <h2 className="text-xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
                        Explore Our 4 Core Full-Stack Pillars
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 max-w-lg leading-relaxed">
                        Click the arrow on any card to navigate directly to its detailed specifications below.
                    </p>
                </motion.div>

                {/* 4 Flip Cards Stage */}
                <div className="relative flex items-center justify-center w-full h-full">
                    {FOUR_SOLUTION_CARDS.map((card, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            const isMobile = containerSize.width < 768;
                            const lineSpacing = isMobile ? 120 : 165;
                            const totalWidth = (TOTAL_CARDS - 1) * lineSpacing;
                            const lineX = i * lineSpacing - totalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            const circleRadius = Math.min(minDimension * 0.36, 240);
                            const circleAngle = (i / TOTAL_CARDS) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            const baseRadius = Math.min(containerSize.width * 0.85, containerSize.height * 1.4);
                            const arcRadius = baseRadius * (isMobile ? 1.2 : 1.05);
                            const arcApexY = containerSize.height * (isMobile ? 0.34 : 0.24);
                            const arcCenterY = arcApexY + arcRadius;

                            const spreadAngle = isMobile ? 75 : 90;
                            const startAngle = -90 - spreadAngle / 2;
                            const step = spreadAngle / (TOTAL_CARDS - 1);

                            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                            const maxRotation = spreadAngle * 0.5;
                            const boundedRotation = -scrollProgress * maxRotation;

                            const currentArcAngle = startAngle + i * step + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.05 : 1.15,
                            };

                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(1, arcPos.scale, morphValue),
                                opacity: 1,
                            };
                        }

                        return (
                            <FlipCard
                                key={card.id}
                                card={card}
                                index={i}
                                phase={introPhase}
                                target={target}
                                onScrollToCard={handleScrollToCard}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
