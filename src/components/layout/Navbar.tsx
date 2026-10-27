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
import BrandLogo from "./BrandLogo";
import { useLanguage } from "@/context/LanguageContext";

interface NavItem {
  label: string;
  href: string;
}

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

  // Track scroll position to enhance glass intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Role metadata using Lucide icons
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

  // Navigation links based on role
  const navItems: NavItem[] = useMemo(() => {
    const publicItems: NavItem[] = [
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
          { href: "/citizen/problems/new", label: tr("nav_report_problem") },
        ];
      default:
        return publicItems;
    }
  }, [role, tr]);

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#faf9f6] border-b-2 border-[#171e19] shadow-[0_4px_0_0_#171e19]"
          : "bg-[#faf9f6]/95 border-b-2 border-[#171e19]"
      }`}
      style={{ height: "72px" }}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Zone: Brand Logo */}
        <BrandLogo
          size="md"
          subtitleExtra={tr("nav_civic_network")}
          href="/"
        />

        {/* Centre Zone: Standard Neo-Brutalist Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19]"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" &&
                (pathname?.startsWith(item.href + "/") || pathname === item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-3.5 py-1.5 font-mono text-xs font-bold uppercase no-underline transition-all duration-150 border border-transparent ${
                  isActive
                    ? "bg-[#ffe17c] text-[#171e19] border-2 border-[#171e19] shadow-[1px_1px_0_0_#171e19]"
                    : "text-[#171e19] hover:bg-[#b7c6c2]/30 hover:border-[#171e19]"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Zone: Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <LanguageToggle />

          {isLoggedIn ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Chip */}
              <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l-2 border-[#171e19]">
                <div className="w-8 h-8 rounded-none bg-[#ffe17c] text-[#171e19] font-bold font-mono text-xs flex items-center justify-center border-2 border-[#171e19] shadow-[1px_1px_0_0_#171e19]">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#171e19] max-w-[120px] truncate leading-tight">
                    {userName}
                  </span>
                  {currentRoleInfo && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border-2 border-[#171e19] shadow-[1px_1px_0_0_#171e19] mt-0.5 leading-none w-fit bg-[#b7c6c2] text-[#171e19]`}
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
                  className="font-mono text-xs font-bold px-2 py-1 border-2 border-[#171e19] bg-white text-[#171e19] hover:bg-[#ff6b6b] hover:text-white transition-all shadow-[2px_2px_0_0_#171e19] active:translate-x-[1px] active:translate-y-[1px] ml-1 flex items-center gap-1 cursor-pointer"
                  title={tr("nav_logout")}
                  aria-label={tr("nav_logout")}
                >
                  <LogOut size={14} />
                  <span className="hidden xl:inline">{tr("nav_logout")}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="font-mono text-xs sm:text-sm font-bold uppercase px-3.5 py-2 border-2 border-[#171e19] bg-white text-[#171e19] shadow-[2px_2px_0_0_#171e19] hover:bg-[#ffe17c] transition-all no-underline"
              >
                {tr("nav_login")}
              </Link>
              <Link
                href="/signup"
                className="font-mono text-xs sm:text-sm font-bold uppercase px-4 py-2 border-2 border-[#171e19] bg-[#ffe17c] text-[#171e19] shadow-[2px_2px_0_0_#171e19] hover:bg-[#ffdb5c] hover:shadow-[3px_3px_0_0_#171e19] transition-all no-underline"
              >
                {tr("nav_get_started")}
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger (Below lg) */}
          <button
            className="lg:hidden p-2 border-2 border-[#171e19] bg-white text-[#171e19] shadow-[2px_2px_0_0_#171e19] hover:bg-[#ffe17c] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            type="button"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Below lg) */}
      {menuOpen && (
        <div className="lg:hidden bg-[#faf9f6] border-b-2 border-[#171e19] px-4 py-4 space-y-2 shadow-[0_4px_0_0_#171e19] animate-fade-in">
          {isLoggedIn && currentRoleInfo && (
            <div className="px-3.5 py-2.5 mb-2 bg-white border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#171e19]">
                {tr("nav_signed_in_as")}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 border-2 border-[#171e19] bg-[#b7c6c2] text-[#171e19]"
                >
                  <currentRoleInfo.icon className="w-3 h-3" />
                  <span>{currentRoleInfo.label}</span>
                </span>
                <span className="text-xs font-bold text-[#171e19]">
                  {userName}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
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
                  className={`flex items-center justify-between px-4 py-2.5 text-sm font-mono font-bold uppercase no-underline transition-colors border-2 border-[#171e19] ${
                    isActive
                      ? "bg-[#ffe17c] text-[#171e19] shadow-[2px_2px_0_0_#171e19]"
                      : "bg-white text-[#171e19] hover:bg-[#b7c6c2]/30"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight
                    size={16}
                    className="text-[#171e19]"
                  />
                </Link>
              );
            })}
          </div>

          <div className="border-t-2 border-[#171e19] mt-3 pt-3">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-mono font-bold uppercase text-white bg-[#ff6b6b] border-2 border-[#171e19] shadow-[2px_2px_0_0_#171e19] transition-all"
              >
                <LogOut size={16} />
                <span>{tr("nav_logout")}</span>
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 border-2 border-[#171e19] bg-white text-sm font-mono font-bold uppercase text-[#171e19] shadow-[2px_2px_0_0_#171e19] hover:bg-[#ffe17c] no-underline"
                >
                  {tr("nav_login")}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 border-2 border-[#171e19] bg-[#ffe17c] text-[#171e19] text-sm font-mono font-bold uppercase shadow-[2px_2px_0_0_#171e19] hover:bg-[#ffdb5c] no-underline"
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
