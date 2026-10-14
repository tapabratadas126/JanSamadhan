"use client";

import React from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
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
  const sizeClasses = {
    sm: {
      box: "w-8 h-8 rounded-xl",
      icon: "w-4 h-4",
      title: "text-base",
      hindi: "text-[10px]",
    },
    md: {
      box: "w-10 h-10 rounded-2xl",
      icon: "w-5 h-5",
      title: "text-lg",
      hindi: "text-[11px]",
    },
    lg: {
      box: "w-14 h-14 rounded-2xl shadow-lg shadow-indigo-500/20",
      icon: "w-7 h-7",
      title: "text-3xl",
      hindi: "text-sm",
    },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3 group shrink-0 ${className}`}>
      {/* The iconic gradient logo from login/signup: teal-500 to indigo-500 rounded-2xl */}
      <div
        className={`inline-flex items-center justify-center bg-gradient-to-br from-[#14B8A6] to-[#6366F1] text-white shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0 ${sizeClasses.box}`}
      >
        <MapPin className={`${sizeClasses.icon} text-white`} />
      </div>

      {showWordmark && (
        <div className="flex flex-col text-left">
          <span
            className={`font-serif font-bold leading-tight tracking-tight ${
              isWhiteText ? "text-white" : "text-[#17254A]"
            } ${sizeClasses.title}`}
          >
            JanSamadhan
          </span>
          {showSubtitle && (
            <span
              className={`font-medium leading-none ${
                isWhiteText ? "text-[#CBC3AE]" : "text-[#5E5C54]"
              } ${sizeClasses.hindi}`}
            >
              जन समाधान
            </span>
          )}
          {subtitleExtra && (
            <span
              className={`text-[10px] hidden xl:inline mt-0.5 ${
                isWhiteText ? "text-white/70" : "text-[#5E5C54]"
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
      <Link href={href} className="no-underline inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
