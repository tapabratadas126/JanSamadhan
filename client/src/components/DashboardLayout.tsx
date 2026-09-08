import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/JanSamadhanUI";
import { BarChart3, FilePlus2, Handshake, LayoutDashboard, LogOut, Menu, MessagesSquare, ShieldCheck, University, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f7f8f5]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#dce7e1] border-t-[#2d8b62]" /></div>;
  if (!user) return <div className="grid min-h-screen place-items-center bg-[#f7f8f5] px-6 text-center"><div><ShieldCheck className="mx-auto h-12 w-12 text-[#2d8b62]" /><h1 className="mt-4 text-2xl font-bold text-[#173b72]">Sign in to open your workspace</h1><p className="mt-2 text-sm text-[#65717e]">Your role-specific tools are waiting for you.</p><Link href="/auth/sign-in"><Button className="mt-6 bg-[#173b72] text-white">Sign in</Button></Link></div></div>;

  const role = user.role;
  const primary = role === "citizen" ? { label: "Report a challenge", href: "/challenges/new", icon: FilePlus2 } : role === "university" ? { label: "Browse challenges", href: "/dashboard#challenges", icon: MessagesSquare } : { label: "Browse proposals", href: "/dashboard#proposals", icon: Handshake };
  const nav = [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }, primary];

  return <div className="min-h-screen bg-[#f7f8f5] lg:flex">
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[#102f57] px-5 py-6 text-white shadow-2xl transition-transform duration-200 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between"><div className="rounded-2xl bg-white px-3 py-2"><LogoMark compact /></div><button className="rounded-lg p-2 text-white/75 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button></div>
      <div className="mt-10"><p className="px-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#8db5a5]">Your workspace</p><nav className="mt-3 space-y-1">{nav.map(item => { const active = location === item.href; return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? "bg-[#2d8b62] text-white shadow-lg" : "text-[#d8e7ef] hover:bg-[#1c487a]"}`}><item.icon className="h-4 w-4" />{item.label}</Link>; })}</nav></div>
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#8db5a5]">Signed in as</p><p className="mt-2 truncate font-bold">{user.name}</p><p className="mt-1 truncate text-xs text-[#b9cedb]">{user.organization || roleLabel(role)}</p></div>
      <button onClick={() => logout()} className="absolute bottom-7 left-8 flex items-center gap-2 text-sm font-semibold text-[#c3d8e1] transition-colors hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button>
    </aside>
    {open && <button className="fixed inset-0 z-40 bg-[#102f57]/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
    <main className="min-w-0 flex-1"><div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#dfe5e4] bg-[#f7f8f5]/90 px-4 backdrop-blur-xl lg:hidden"><button className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe5e4] bg-white text-[#173b72]" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button><LogoMark compact /><Link href={primary.href}><Button size="sm" className="bg-[#2d8b62] text-white">{role === "citizen" ? "Report" : "Explore"}</Button></Link></div><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div></main>
  </div>;
}

function roleLabel(role: string) {
  if (role === "university") return "University partner";
  if (role === "industry") return "Industry partner";
  return "Citizen contributor";
}
