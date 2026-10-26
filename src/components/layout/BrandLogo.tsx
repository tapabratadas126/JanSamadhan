"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitleExtra?: string;
  className?: string;
  isWhiteText?: boolean;
  href?: string;
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
  // If isWhiteText (like the dark navy footer), use the white text variant of the full logo
  // For standard light headers & pages, use the official logo
  const logoSrc = isWhiteText ? "/logo-white.png" : "/logo-full.png";

  const sizeClasses = {
    sm: {
      height: 32,
      iconOnlySize: 32,
      fullLogoClass: "h-8 w-auto",
      iconBox: "w-8 h-8",
      title: "text-base",
      hindi: "text-[10px]",
    },
    md: {
      height: 42,
      iconOnlySize: 42,
      fullLogoClass: "h-10 w-auto",
      iconBox: "w-10 h-10",
      title: "text-lg",
      hindi: "text-[11px]",
    },
    lg: {
      height: 52,
      iconOnlySize: 52,
      fullLogoClass: "h-13 w-auto",
      iconBox: "w-14 h-14",
      title: "text-2xl",
      hindi: "text-xs",
    },
    xl: {
      height: 64,
      iconOnlySize: 64,
      fullLogoClass: "h-16 w-auto",
      iconBox: "w-18 h-18",
      title: "text-3xl",
      hindi: "text-sm",
    },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group shrink-0 ${className}`}>
      {/* If full wordmark is requested, render the official logo graphic */}
      {showWordmark ? (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="JanSamadhan — Local voices. Shared solutions."
            className={`${sizeClasses.fullLogoClass} object-contain transition-transform duration-300 group-hover:scale-[1.02]`}
          />
          {subtitleExtra && (
            <span
              className={`text-[10px] hidden xl:inline-block pl-2 border-l border-current/20 leading-tight ${
                isWhiteText ? "text-white/70" : "text-[#5E5C54]"
              }`}
            >
              {subtitleExtra}
            </span>
          )}
        </div>
      ) : (
        /* Icon only emblem */
        <div
          className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${sizeClasses.iconBox}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt="JanSamadhan Icon"
            className="w-full h-full object-contain"
          />
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
