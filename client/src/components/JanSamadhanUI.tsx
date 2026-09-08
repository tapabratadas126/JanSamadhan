import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, Building2, ChevronRight, Handshake, MapPin, Menu, ShieldCheck, University, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="JanSamadhan home">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2d8b62] text-white shadow-[0_8px_20px_rgba(45,139,98,.22)] transition-transform group-hover:-rotate-3">
        <span className="relative block h-5 w-5">
          <span className="absolute left-2 top-0 h-3 w-2 rotate-45 rounded-full bg-white/95" />
          <span className="absolute bottom-0 left-1 h-3 w-2 -rotate-45 rounded-full bg-white/80" />
          <span className="absolute left-1/2 top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-[35deg] bg-white/90" />
        </span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[1.05rem] font-extrabold tracking-tight text-[#173b72]">JanSamadhan</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.18em] text-[#6b7784]">shared solutions</span>
        </span>
      )}
    </Link>
  );
}

export function PublicHeader({ onReport }: { onReport?: () => void }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#dfe5e4]/80 bg-[#f7f8f5]/85 backdrop-blur-xl">
      <div className="container flex h-[72px] items-center justify-between">
        <LogoMark />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          <a href="#discover" className="text-sm font-semibold text-[#65717e] transition-colors hover:text-[#173b72]">Discover</a>
          <a href="#how-it-works" className="text-sm font-semibold text-[#65717e] transition-colors hover:text-[#173b72]">How it works</a>
          {user ? (
            <Link href="/dashboard" className="text-sm font-semibold text-[#65717e] transition-colors hover:text-[#173b72]">My workspace</Link>
          ) : null}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="mr-2 max-w-32 truncate text-xs font-semibold text-[#65717e]">Hi, {user.name?.split(" ")[0]}</span>
              <Button onClick={onReport} variant="default" className="bg-[#2d8b62] text-white hover:bg-[#226e4d]">Report an issue <ArrowRight /></Button>
              <Button onClick={() => logout()} variant="ghost" className="text-[#65717e]">Sign out</Button>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in"><Button variant="ghost" className="text-[#173b72]">Sign in</Button></Link>
              <Button onClick={onReport} className="bg-[#2d8b62] text-white hover:bg-[#226e4d]">Report an issue <ArrowRight /></Button>
            </>
          )}
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe5e4] bg-white text-[#173b72] md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="container border-t border-[#dfe5e4] py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a href="#discover" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#65717e]">Discover</a>
            <a href="#how-it-works" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#65717e]">How it works</a>
            {user ? <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#65717e]">My workspace</Link> : <Link href="/auth/sign-in" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#65717e]">Sign in</Link>}
            <Button onClick={() => { setOpen(false); onReport?.(); }} className="mt-1 w-full bg-[#2d8b62] text-white">Report an issue <ArrowRight /></Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function RoleIcon({ role, className = "h-5 w-5" }: { role: string; className?: string }) {
  if (role === "university") return <University className={className} />;
  if (role === "industry") return <Building2 className={className} />;
  return <ShieldCheck className={className} />;
}

export function ChallengeCard({ challenge, compact = false }: { challenge: any; compact?: boolean }) {
  const image = challenge.photos?.[0]?.url;
  return (
    <Link href={`/challenge/${challenge.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-[#dfe5e4] bg-white shadow-[0_12px_35px_rgba(22,45,65,.06)] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_42px_rgba(22,45,65,.12)]">
        {image ? <img src={image} alt="" className={`w-full object-cover ${compact ? "h-32" : "h-44"}`} /> : <div className={`civic-grid flex w-full items-center justify-center bg-[#edf3f4] ${compact ? "h-32" : "h-44"}`}><MapPin className="h-9 w-9 text-[#9ab7ad]" /></div>}
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3"><Badge variant="outline" className="border-[#cfe0d8] bg-[#f1f8f3] text-[#246447]">Open for ideas</Badge><span className="text-xs text-[#7a8792]">{formatDate(challenge.createdAt)}</span></div>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#173b72] transition-colors group-hover:text-[#2d8b62]">{challenge.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#65717e]">{challenge.description}</p>
          <div className="mt-4 flex items-center justify-between gap-2 text-xs font-semibold text-[#65717e]"><span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#2d8b62]" />{challenge.location}</span><span className="flex items-center gap-1 text-[#173b72]">{challenge.proposalCount ?? 0} ideas <ChevronRight className="h-3.5 w-3.5" /></span></div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProposalCard({ proposal, industry = false }: { proposal: any; industry?: boolean }) {
  return (
    <Card className="border-[#dfe5e4] bg-white shadow-[0_12px_35px_rgba(22,45,65,.06)]">
      <CardHeader className="gap-3 p-5 pb-3"><div className="flex items-start justify-between gap-3"><Badge variant="outline" className="border-[#d8d8ed] bg-[#f3f4ff] text-[#4e5291]">University proposal</Badge><span className="text-xs text-[#7a8792]">{formatDate(proposal.createdAt)}</span></div><CardTitle className="text-lg leading-snug text-[#173b72]">{proposal.challenge?.title}</CardTitle></CardHeader>
      <CardContent className="p-5 pt-1"><p className="line-clamp-3 text-sm leading-6 text-[#65717e]">{proposal.proposalText}</p><div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf0ef] pt-4"><span className="text-xs font-semibold text-[#65717e]">{proposal.university?.organization || proposal.university?.name || "University partner"}</span>{industry && <Link href={`/proposals/${proposal.id}/partner`}><Button size="sm" className="bg-[#173b72] text-white hover:bg-[#102b52]">Offer partnership <Handshake /></Button></Link>}</div></CardContent>
    </Card>
  );
}

export function PartnershipCard({ partnership }: { partnership: any }) {
  return <Card className="border-[#dfe5e4] bg-white shadow-[0_12px_35px_rgba(22,45,65,.06)]"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><Badge className="border-transparent bg-[#fff3df] text-[#9b5d0a]">Industry initiative</Badge><span className="text-xs text-[#7a8792]">{formatDate(partnership.createdAt)}</span></div><h3 className="mt-3 text-lg font-bold text-[#173b72]">{partnership.challenge?.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#65717e]">{partnership.partnershipDetails}</p><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#65717e]"><Handshake className="h-4 w-4 text-[#d97706]" />{partnership.industry?.organization || partnership.industry?.name || "Industry partner"}</div></CardContent></Card>;
}

export function formatDate(value: Date | string | number | null | undefined) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
