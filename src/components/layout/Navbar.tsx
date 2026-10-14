"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sprout,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  GraduationCap,
  Building2,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import LanguageToggle from "./LanguageToggle";
import { PillNavItem } from "./PillNav";
import BrandLogo from "./BrandLogo";
import IslandNavbar from "./IslandNavbar";
import { useLanguage } from "@/context/LanguageContext";

interface NavbarProps {
  role?: string;
  userName?: string;
}

export default function Navbar({ role, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { tr, lang } = useLanguage();

  const isLoggedIn = !!role;

  // Track 8px scroll for bottom border
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Role metadata without emojis, using Lucide icons
  const ROLE_CONFIG: Record<
    string,
    { label: string; icon: LucideIcon; badgeClass: string }
  > = {
    CITIZEN: {
      label: tr("role_citizen"),
      icon: User,
      badgeClass: "bg-[#E3F0E7] text-[#2E7D4F] border-[#2E7D4F]/30",
    },
    UNIVERSITY: {
      label: tr("role_university"),
      icon: GraduationCap,
      badgeClass: "bg-[#E4E9F5] text-[#17254A] border-[#17254A]/30",
    },
    INDUSTRY: {
      label: tr("role_industry"),
      icon: Building2,
      badgeClass: "bg-[#FBEBD3] text-[#98590A] border-[#D98324]/30",
    },
    ADMIN: {
      label: tr("role_admin"),
      icon: ShieldCheck,
      badgeClass: "bg-[#F1ECDF] text-[#1C1B18] border-[#CBC3AE]",
    },
  };

  // Memoise navigation items by role and language
  const navItems: PillNavItem[] = useMemo(() => {
    const publicItems: PillNavItem[] = [
      { href: "/problems", label: tr("nav_problems") },
      { href: "/solutions", label: tr("nav_solutions") },
      { href: "/partnerships", label: tr("nav_partnerships") },
    ];

    if (!role) return publicItems;

    switch (role) {
      case "CITIZEN":
        return [
          { href: "/citizen/dashboard", label: tr("nav_home") },
          { href: "/problems", label: tr("nav_problems") },
          { href: "/solutions", label: tr("nav_solutions") },
          { href: "/partnerships", label: tr("nav_partnerships") },
          { href: "/citizen/problems/new", label: tr("nav_report_problem") },
          { href: "/citizen/my-problems", label: tr("nav_my_reports") },
        ];
      case "UNIVERSITY":
        return [
          { href: "/university/dashboard", label: tr("nav_home") },
          { href: "/problems", label: tr("nav_problems") },
          { href: "/solutions", label: tr("nav_solutions") },
          { href: "/partnerships", label: tr("nav_partnerships") },
          { href: "/university/my-solutions", label: tr("nav_my_solutions") },
        ];
      case "INDUSTRY":
        return [
          { href: "/industry/dashboard", label: tr("nav_home") },
          { href: "/problems", label: tr("nav_problems") },
          { href: "/solutions", label: tr("nav_solutions") },
          { href: "/partnerships", label: tr("nav_partnerships") },
          { href: "/industry/my-partnerships", label: tr("nav_my_partnerships") },
        ];
      case "ADMIN":
        return [
          { href: "/admin/dashboard", label: tr("nav_dashboard") },
          { href: "/problems", label: tr("nav_problems") },
          { href: "/solutions", label: tr("nav_solutions") },
          { href: "/partnerships", label: tr("nav_partnerships") },
        ];
      default:
        return publicItems;
    }
  }, [role, tr, lang]);

  const currentRoleInfo = role ? ROLE_CONFIG[role] : null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  // Get user initials
  const initials = userName
    ? userName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 bg-[#FAF7F0] ${
        scrolled ? "border-b border-[#E5DFD0]" : "border-b border-transparent"
      }`}
      style={{ height: "76px" }}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Zone: Unified Brand Logo matching Login portal */}
        <BrandLogo
          size="md"
          subtitleExtra={tr("nav_civic_network")}
          href="/"
        />

        {/* Centre Zone: Camera Cutout Dynamic Island Navbar (Desktop) */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl px-2">
          <IslandNavbar
            items={navItems}
            activeHref={pathname}
            lang={lang}
            role={role}
            userName={userName}
          />
        </div>

        {/* Right Zone: Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <LanguageToggle />

          {isLoggedIn ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Chip */}
              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#E5DFD0]">
                <div className="w-8 h-8 rounded-full bg-[#E4E9F5] text-[#17254A] font-bold text-xs flex items-center justify-center border border-[#E5DFD0]">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#1C1B18] max-w-[120px] truncate leading-tight">
                    {userName}
                  </span>
                  {currentRoleInfo && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${currentRoleInfo.badgeClass} mt-0.5 leading-none w-fit`}
                    >
                      <currentRoleInfo.icon className="w-2.5 h-2.5" />
                      <span>{currentRoleInfo.label}</span>
                    </span>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  type="button"
                  className="btn-ghost text-xs p-2 rounded-lg text-[#5E5C54] hover:text-[#A33A2B] hover:bg-[#F8E1DC] transition-colors ml-1"
                  title={tr("nav_logout")}
                  aria-label={tr("nav_logout")}
                >
                  <LogOut size={16} />
                  <span className="hidden xl:inline">{tr("nav_logout")}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="btn-ghost text-xs sm:text-sm font-semibold text-[#17254A] px-3.5 py-2 rounded-[10px]"
              >
                {tr("nav_login")}
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-xs sm:text-sm font-semibold px-4 py-2 rounded-[10px]"
              >
                {tr("nav_get_started")}
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger (Below lg) */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#17254A] hover:bg-[#F1ECDF] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Below lg) */}
      {menuOpen && (
        <div className="lg:hidden bg-[#FAF7F0] border-b border-[#E5DFD0] px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          {isLoggedIn && currentRoleInfo && (
            <div className="px-3.5 py-2.5 mb-2 bg-[#FFFFFF] rounded-xl border border-[#E5DFD0] flex items-center justify-between">
              <span className="text-xs font-medium text-[#5E5C54]">
                {tr("nav_signed_in_as")}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${currentRoleInfo.badgeClass}`}
                >
                  <currentRoleInfo.icon className="w-3 h-3" />
                  <span>{currentRoleInfo.label}</span>
                </span>
                <span className="text-xs font-bold text-[#1C1B18]">
                  {userName}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  (pathname.startsWith(item.href + "/") ||
                    pathname === item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold no-underline transition-colors ${
                    isActive
                      ? "bg-[#17254A] text-[#FFFFFF]"
                      : "text-[#1C1B18] hover:bg-[#F1ECDF]"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight
                    size={16}
                    className={isActive ? "text-white" : "text-[#5E5C54]"}
                  />
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[#E5DFD0] mt-3 pt-3">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-[#A33A2B] hover:bg-[#F8E1DC] rounded-xl transition-colors"
              >
                <LogOut size={16} />
                <span>{tr("nav_logout")}</span>
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-[10px] border border-[#E5DFD0] bg-[#FFFFFF] text-sm font-semibold text-[#17254A] hover:bg-[#F1ECDF] no-underline"
                >
                  {tr("nav_login")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-[10px] btn-primary text-sm font-semibold text-white no-underline"
                >
                  {tr("nav_create_account")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
