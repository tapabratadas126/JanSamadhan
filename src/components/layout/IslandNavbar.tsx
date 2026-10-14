"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PillNavItem } from "./PillNav";

interface IslandNavbarProps {
  items: PillNavItem[];
  activeHref?: string;
  lang?: string;
  role?: string;
  userName?: string;
}

export default function IslandNavbar({
  items,
  activeHref,
  lang = "en",
  role,
  userName,
}: IslandNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Find active navigation item
  const activeItem = items.find(
    (item) =>
      activeHref === item.href ||
      (item.href !== "/" &&
        (activeHref?.startsWith(item.href + "/") || activeHref === item.href))
  );

  const displayTitle = activeItem
    ? activeItem.label
    : lang === "hi"
      ? "मेन्यू"
      : "Explore";

  // Auto-close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center select-none"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* ── Top Anchor: Camera Cutout Notch / Dynamic Island Trigger ── */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative z-40 flex items-center h-10 px-4 rounded-full bg-[#17254A] text-white shadow-md hover:shadow-lg transition-all duration-200 border border-[#2a3c6b] group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7D4F]"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >




        {/* Current Active Page Label */}
        <span className="text-xs font-semibold tracking-wide text-[#FAF7F0] mr-1.5 font-sans">
          {displayTitle}
        </span>

        {/* Dynamic Chevron that rotates on dropdown */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="text-white/60 flex items-center"
        >
          <ChevronDown size={14} />
        </motion.span>
      </motion.button>

      {/* ── Dropdown Pill Navbar: Pops/slides down smoothly from the cutout island ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 30,
              mass: 0.8,
            }}
            className="absolute top-full pt-2 z-50 flex items-center justify-center"
          >
            <div
              className="flex items-center gap-1.5 p-1.5 bg-[#17254A] rounded-full shadow-2xl border border-white/15 backdrop-blur-xl"
              style={{
                boxShadow:
                  "0 20px 40px -12px rgba(23, 37, 74, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
              }}
            >
              {items.map((item) => {
                const isActive =
                  activeHref === item.href ||
                  (item.href !== "/" &&
                    (activeHref?.startsWith(item.href + "/") ||
                      activeHref === item.href));

                const trackingClass =
                  lang === "hi"
                    ? "tracking-normal normal-case"
                    : "tracking-wider uppercase";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`relative group/pill inline-flex items-center justify-center h-8 px-4 rounded-full text-xs font-semibold no-underline transition-all duration-200 cursor-pointer ${trackingClass} ${isActive
                        ? "bg-white text-[#17254A] shadow-sm font-bold"
                        : "text-[#FAF7F0]/80 hover:text-white hover:bg-white/15"
                      }`}
                  >
                    <span className="relative z-10">{item.label}</span>

                    {/* Active page green dot indicator */}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
