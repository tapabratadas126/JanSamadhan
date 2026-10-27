"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitleExtra?: string;
  className?: string;
  isWhiteText?: boolean;
  href?: string;
}

export function JanSamadhanSvgIcon({
  className = "w-9 h-9",
  isWhite = false,
}: {
  className?: string;
  isWhite?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="JanSamadhan Icon"
    >
      {/* Outer Connecting Ring of People */}
      {/* Top Blue Person */}
      <circle cx="50" cy="18" r="8" fill={isWhite ? "#ffe17c" : "#1034A6"} stroke="#171e19" strokeWidth="2.5" />
      
      {/* Left Orange Person */}
      <circle cx="18" cy="50" r="8" fill="#F59E0B" stroke="#171e19" strokeWidth="2.5" />
      
      {/* Right Teal Person */}
      <circle cx="82" cy="50" r="8" fill="#0D9488" stroke="#171e19" strokeWidth="2.5" />
      
      {/* Connecting Orbital Arc Lines */}
      <path
        d="M26 40 A36 36 0 0 1 42 22"
        stroke={isWhite ? "#ffe17c" : "#1034A6"}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M58 22 A36 36 0 0 1 74 40"
        stroke={isWhite ? "#60A5FA" : "#1D4ED8"}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M78 60 A36 36 0 0 1 64 78"
        stroke="#0D9488"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M36 78 A36 36 0 0 1 22 60"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Bottom Teal Person & Bridge Handshake Base */}
      <path
        d="M30 76 Q50 68 70 76"
        stroke="#0D9488"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M40 73 L50 82 L60 73"
        stroke="#0D9488"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="85" r="7.5" fill="#0D9488" stroke="#171e19" strokeWidth="2.5" />

      {/* Central Geo-Location Pin with Center Hole */}
      <path
        d="M50 32 C41 32 34 39 34 48 C34 60 50 72 50 72 C50 72 66 60 66 48 C66 39 59 32 50 32 Z"
        fill={isWhite ? "#ffffff" : "#0A2540"}
        stroke="#171e19"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="46" r="6" fill={isWhite ? "#171e19" : "#ffffff"} stroke="#171e19" strokeWidth="2" />
    </svg>
  );
}

export default function BrandLogo({
  size = "md",
  showWordmark = true,
  showSubtitle = true,
  subtitleExtra,
  className = "",
  isWhiteText = false,
  href = "/",
}: BrandLogoProps) {
  const sizeMap = {
    sm: {
      iconSize: "w-8 h-8",
      titleSize: "text-lg",
      subSize: "text-[10px]",
    },
    md: {
      iconSize: "w-10 h-10",
      titleSize: "text-2xl",
      subSize: "text-[11px]",
    },
    lg: {
      iconSize: "w-13 h-13",
      titleSize: "text-3xl",
      subSize: "text-xs",
    },
    xl: {
      iconSize: "w-16 h-16",
      titleSize: "text-4xl",
      subSize: "text-sm",
    },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* SVG Icon Emblem with Neo-brutalist Shadow */}
      <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
        <JanSamadhanSvgIcon
          className={sizeMap.iconSize}
          isWhite={isWhiteText}
        />
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          {/* Main Brand Title */}
          <div className="flex items-baseline tracking-tight font-black">
            <span
              className={
                isWhiteText
                  ? "text-[#ffe17c]"
                  : "text-[#002699] font-black"
              }
              style={{ fontSize: "1.25em" }}
            >
              Jan
            </span>
            <span
              className={
                isWhiteText
                  ? "text-white"
                  : "text-[#0d7d74] font-black"
              }
              style={{ fontSize: "1.25em" }}
            >
              Samadhan
            </span>
          </div>

          {/* Subtitle / Tagline */}
          {showSubtitle && (
            <span
              className={`font-sans tracking-tight font-bold mt-0.5 ${
                isWhiteText ? "text-gray-300" : "text-[#475569]"
              } ${sizeMap.subSize}`}
            >
              Local voices. Shared solutions.
            </span>
          )}

          {subtitleExtra && (
            <span
              className={`text-[10px] font-mono uppercase tracking-wider mt-0.5 ${
                isWhiteText ? "text-[#ffe17c]/80" : "text-[#171e19]/70"
              }`}
            >
              {subtitleExtra}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
