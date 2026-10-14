"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export interface PillNavItem {
  label: string;
  href: string;
  ariaLabel?: string;
}

export interface PillNavProps {
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  pillTextColor?: string;
  hoveredPillTextColor?: string;
  activeDotColor?: string;
  initialLoadAnimation?: boolean;
  lang?: string;
}

export const PillNav: React.FC<PillNavProps> = ({
  items,
  activeHref,
  className = "",
  ease = "power3.out",
  baseColor = "#17254A",
  pillColor = "#FFFFFF",
  pillTextColor = "#1C1B18",
  hoveredPillTextColor = "#FFFFFF",
  activeDotColor = "#2E7D4F",
  initialLoadAnimation = true,
  lang = "en",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) return;

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        // Calculate radius for expanding circle to fill the pill
        const R = (w * w / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(
          circle,
          {
            scale: 1.25,
            xPercent: -50,
            duration: 0.5,
            ease,
            overwrite: "auto",
          },
          0
        );

        if (label) {
          tl.to(
            label,
            {
              y: -(h + 8),
              duration: 0.4,
              ease,
              overwrite: "auto",
            },
            0
          );
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 16), opacity: 0 });
          tl.to(
            white,
            {
              y: 0,
              opacity: 1,
              duration: 0.4,
              ease,
              overwrite: "auto",
            },
            0
          );
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    // Initial load animation only once per session
    if (initialLoadAnimation && typeof window !== "undefined") {
      const hasAnimated = sessionStorage.getItem("jansamadhan_nav_animated");
      if (!hasAnimated && containerRef.current) {
        const pills = containerRef.current.querySelectorAll("li");
        gsap.set(pills, { opacity: 0, y: -8 });
        gsap.to(pills, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
          delay: 0.1,
          onComplete: () => {
            sessionStorage.setItem("jansamadhan_nav_animated", "true");
          },
        });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation, lang, prefersReducedMotion]);

  const handleEnter = (i: number) => {
    if (prefersReducedMotion) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.35,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = (i: number) => {
    if (prefersReducedMotion) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.25,
      ease,
      overwrite: "auto",
    });
  };

  return (
    <div
      ref={containerRef}
      className={`flex items-center rounded-full p-1 border border-[#E5DFD0] ${className}`}
      style={{
        background: baseColor,
        height: "46px",
      }}
    >
      <ul className="list-none flex items-center m-0 p-0 h-full gap-1">
        {items.map((item, i) => {
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
            <li key={item.href} className="flex items-center h-full">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.ariaLabel || item.label}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={() => handleLeave(i)}
                className={`relative overflow-hidden inline-flex items-center justify-center h-[36px] px-3.5 rounded-full text-xs font-semibold no-underline transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E7D4F] cursor-pointer ${trackingClass}`}
                style={{
                  background: pillColor,
                  color: pillTextColor,
                }}
              >
                {!prefersReducedMotion && (
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{
                      background: baseColor,
                      willChange: "transform",
                    }}
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                )}

                <span className="label-stack relative inline-block leading-none z-[2] overflow-hidden py-1">
                  <span
                    className="pill-label relative z-[2] inline-block"
                    style={{ willChange: "transform" }}
                  >
                    {item.label}
                  </span>
                  {!prefersReducedMotion && (
                    <span
                      className="pill-label-hover absolute left-0 top-1 z-[3] inline-block w-full text-center"
                      style={{
                        color: hoveredPillTextColor,
                        willChange: "transform, opacity",
                      }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  )}
                </span>

                {/* Active page dot */}
                {isActive && (
                  <span
                    className="absolute left-1/2 bottom-1 -translate-x-1/2 w-1.5 h-1.5 rounded-full z-[4]"
                    style={{ background: activeDotColor }}
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PillNav;
