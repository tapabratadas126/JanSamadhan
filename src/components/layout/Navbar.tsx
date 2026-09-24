"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

interface NavItem {
  href: string;
  label: string;
}

interface NavbarProps {
  role?: string;
  userName?: string;
}

const ROLE_INFO: Record<string, { label: string; emoji: string; badgeClass: string }> = {
  CITIZEN: { label: "Citizen", emoji: "🧑", badgeClass: "bg-teal-50 text-teal-700 border-teal-200" },
  UNIVERSITY: { label: "University", emoji: "🎓", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  INDUSTRY: { label: "Industry", emoji: "🏭", badgeClass: "bg-amber-50 text-amber-800 border-amber-200" },
  ADMIN: { label: "Admin", emoji: "🛡️", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" },
};

const publicNavItems: NavItem[] = [
  { href: "/problems", label: "Problems" },
  { href: "/solutions", label: "Solutions" },
  { href: "/partnerships", label: "Partnerships" },
];

const navItems: Record<string, NavItem[]> = {
  CITIZEN: [
    { href: "/citizen/dashboard", label: "Home" },
    { href: "/problems", label: "Problems" },
    { href: "/solutions", label: "Solutions" },
    { href: "/partnerships", label: "Partnerships" },
    { href: "/citizen/problems/new", label: "Report Problem" },
    { href: "/citizen/my-problems", label: "My Reports" },
  ],
  UNIVERSITY: [
    { href: "/university/dashboard", label: "Home" },
    { href: "/problems", label: "Problems" },
    { href: "/solutions", label: "Solutions" },
    { href: "/partnerships", label: "Partnerships" },
    { href: "/university/my-solutions", label: "My Solutions" },
  ],
  INDUSTRY: [
    { href: "/industry/dashboard", label: "Home" },
    { href: "/problems", label: "Problems" },
    { href: "/solutions", label: "Solutions" },
    { href: "/partnerships", label: "Partnerships" },
    { href: "/industry/my-partnerships", label: "My Partnerships" },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/problems", label: "Problems" },
    { href: "/solutions", label: "Solutions" },
    { href: "/partnerships", label: "Partnerships" },
  ],
};

export default function Navbar({ role, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!role;
  const items = role ? navItems[role] || [] : publicNavItems;
  const roleInfo = role ? ROLE_INFO[role] : null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#14B8A6] to-[#6366F1] rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <MapPin className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-gray-900 tracking-tight leading-tight">
                JanSamadhan
              </span>
              <span className="text-[10px] font-medium text-gray-400 -mt-0.5 tracking-wide hidden sm:inline">
                Civic Solution Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all no-underline ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Items */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <div className="hidden md:flex items-center gap-3 pl-2 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    {roleInfo && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleInfo.badgeClass}`}
                      >
                        <span>{roleInfo.emoji}</span>
                        <span>{roleInfo.label}</span>
                      </span>
                    )}
                    <span className="text-sm font-semibold text-gray-800 max-w-[140px] truncate">
                      {userName}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="btn-ghost text-xs py-1.5 px-2.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Log out"
                  >
                    <LogOut size={15} />
                    <span className="hidden lg:inline">Log out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="btn-ghost text-sm py-2 px-4 no-underline font-semibold text-gray-700 hover:text-gray-900"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm py-2 px-5 no-underline font-semibold"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1.5 shadow-xl animate-dropdown">
          {roleInfo && (
            <div className="px-3 py-2 mb-2 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Signed in as</span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleInfo.badgeClass}`}
              >
                <span>{roleInfo.emoji}</span>
                <span>{roleInfo.label}</span>
                <span className="ml-1 text-gray-800 font-bold">({userName})</span>
              </span>
            </div>
          )}

          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold no-underline transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            );
          })}

          <div className="border-t border-gray-100 mt-3 pt-3">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 no-underline"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl btn-primary text-sm font-semibold text-white no-underline"
                >
                  Create an Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
