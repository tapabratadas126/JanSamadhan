"use client";

import React from "react";
import { motion } from "framer-motion";

interface MorphingShapeProps {
  className?: string;
}

export default function MorphingShape({ className = "" }: MorphingShapeProps) {
  // Smooth organic SVG path morphing keyframes
  // All paths are cubic Bezier closed loops (C / S commands) with the same topology
  const path1 =
    "M 300,100 C 430,90 520,180 510,310 C 500,440 410,510 290,520 C 160,530 80,430 90,300 C 100,170 170,110 300,100 Z";
  const path2 =
    "M 320,120 C 470,140 540,240 500,360 C 460,480 370,530 250,500 C 130,470 90,360 110,230 C 130,100 210,100 320,120 Z";
  const path3 =
    "M 280,110 C 400,80 510,160 520,290 C 530,420 440,520 310,510 C 180,500 100,400 110,270 C 120,140 160,140 280,110 Z";
  const path4 =
    "M 310,95 C 445,115 535,210 515,335 C 495,460 395,525 275,515 C 145,505 85,395 105,265 C 125,135 185,85 310,95 Z";

  return (
    <div
      className={`relative pointer-events-none select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full filter drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle multi-stop civic gradient with soft teal, warm saffron, and navy glow */}
          <linearGradient id="morphGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.14" />
            <stop offset="45%" stopColor="#6366F1" stopOpacity="0.10" />
            <stop offset="80%" stopColor="#D98324" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2E7D4F" stopOpacity="0.16" />
          </linearGradient>

          <linearGradient id="morphStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#D98324" stopOpacity="0.30" />
          </linearGradient>
        </defs>

        {/* Outer glowing morphing blob */}
        <motion.path
          d={path1}
          animate={{
            d: [path1, path2, path3, path4, path1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            d: {
              duration: 16,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            },
            rotate: {
              duration: 32,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            },
          }}
          style={{ transformOrigin: "300px 300px" }}
          fill="url(#morphGrad1)"
          stroke="url(#morphStroke)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />

        {/* Secondary inner counter-rotating accent ring for rich depth */}
        <motion.path
          d={path3}
          animate={{
            d: [path3, path4, path1, path2, path3],
            rotate: [360, 270, 180, 90, 0],
            scale: [0.85, 0.92, 0.88, 0.94, 0.85],
          }}
          transition={{
            d: {
              duration: 18,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            },
            rotate: {
              duration: 38,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            },
            scale: {
              duration: 12,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
          }}
          style={{ transformOrigin: "300px 300px" }}
          fill="none"
          stroke="#17254A"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
