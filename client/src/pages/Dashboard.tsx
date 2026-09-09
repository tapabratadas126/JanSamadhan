import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { ChallengeCard, PartnershipCard, ProposalCard } from "@/components/JanSamadhanUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BarChart3, FilePlus2, Handshake, Lightbulb, MapPin, MessagesSquare, Plus, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  return <DashboardLayout><DashboardContent /></DashboardLayout>;
}

function DashboardContent() {
  const { user } = useAuth();
  const role = user?.role;
  const challenges = trpc.challenges.list.useQuery();
  const proposals = trpc.proposals.list.useQuery();
  const partnerships = trpc.partnerships.list.useQuery();
  const mineChallenges = trpc.challenges.mine.useQuery(undefined, { enabled: role === "citizen", retry: false });
  const mineProposals = trpc.proposals.mine.useQuery(undefined, { enabled: role === "university", retry: false });
  const minePartnerships = trpc.partnerships.mine.useQuery(undefined, { enabled: role === "industry", retry: false });
  if (!user) return null;
  const firstName = user.name?.split(" ")[0] || "there";
  const roleCopy = role === "citizen" ? "Your reports help surface what needs attention first." : role === "university" ? "Turn community needs into research-backed next steps." : "Find ideas where your support can make a practical difference.";
  const primary = role === "citizen" ? { label: "Report a challenge", href: "/challenges/new", icon: FilePlus2 } : role === "university" ? { label: "Browse challenges", href: "#challenges", icon: MessagesSquare } : { label: "Browse proposals", href: "#proposals", icon: Handshake };
  const mineCount = role === "citizen" ? mineChallenges.data?.length ?? 0 : role === "university" ? mineProposals.data?.length ?? 0 : minePartnerships.data?.length ?? 0;

  return <div>
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#2d8b62]">{roleLabel(role)}</p><h1 className="display-serif mt-3 text-4xl font-semibold tracking-tight text-[#173b72] sm:text-5xl">Good morning, {firstName}{firstName.endsWith(".") ? "" : "."}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#65717e]">{roleCopy}</p></div><Link href={primary.href}><Button size="lg" className="w-full bg-[#2d8b62] text-white shadow-[0_10px_25px_rgba(45,139,98,.17)] hover:bg-[#226e4d] sm:w-auto">{primary.label} <primary.icon /></Button></Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Your contributions" value={mineCount} icon={role === "citizen" ? MapPin : role === "university" ? Lightbulb : Handshake} accent="green" /><Metric label="Open challenges" value={challenges.data?.filter(item => item.status === "open").length ?? 0} icon={MessagesSquare} accent="blue" /><Metric label="Ideas submitted" value={proposals.data?.length ?? 0} icon={Lightbulb} accent="purple" /><Metric label="Partnerships offered" value={partnerships.data?.length ?? 0} icon={Handshake} accent="amber" /></div>
    <div className="mt-10 grid gap-8 xl:grid-cols-[1.45fr_.55fr]">
      <div className="space-y-12">
        {(role === "citizen" || role === "university" || role === "industry") && <section id="challenges" className="scroll-mt-24"><SectionHeading eyebrow="Community board" title="Challenges seeking attention" action="See all" href="#challenges" /><div className="mt-5 grid gap-5 md:grid-cols-2">{challenges.isLoading ? <LoadingCards /> : challenges.data?.slice(0, 4).map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} compact />)}</div></section>}
        {(role === "university" || role === "industry") && <section id="proposals" className="scroll-mt-24"><SectionHeading eyebrow="Solution studio" title="Ideas taking shape" action="Explore proposals" href="#proposals" /><div className="mt-5 grid gap-5 md:grid-cols-2">{proposals.isLoading ? <LoadingCards /> : proposals.data?.slice(0, 4).map(proposal => <ProposalCard key={proposal.id} proposal={proposal} industry={role === "industry"} />)}</div></section>}
        {role === "industry" && <section id="partnerships" className="scroll-mt-24"><SectionHeading eyebrow="Implementation" title="Partnerships in motion" action="View initiatives" href="#partnerships" /><div className="mt-5 grid gap-5 md:grid-cols-2">{partnerships.isLoading ? <LoadingCards /> : partnerships.data?.slice(0, 4).map(partnership => <PartnershipCard key={partnership.id} partnership={partnership} />)}</div></section>}
      </div>
      <aside className="space-y-5"><Card className="overflow-hidden border-0 bg-[#173b72] text-white shadow-[0_18px_50px_rgba(23,59,114,.17)]"><CardContent className="relative p-6"><div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" /><div className="absolute -right-4 -top-4 h-20 w-20 rounded-full border border-white/10" /><Sparkles className="h-6 w-6 text-[#8bd0a8]" /><h2 className="mt-5 text-xl font-bold">One useful next step</h2><p className="mt-2 text-sm leading-6 text-[#b8c9d8]">{role === "citizen" ? "Share a challenge with enough context for someone else to understand it." : role === "university" ? "Browse open challenges and find one that matches your team’s strengths." : "Explore a proposal and offer the support that could unlock a pilot."}</p><Link href={primary.href}><Button className="mt-6 bg-[#8bd0a8] text-[#123f2d] hover:bg-[#a5e2bd]">{role === "citizen" ? "Start a report" : "Start exploring"} <ArrowRight /></Button></Link></CardContent></Card><Card className="border-[#dfe5e4] bg-white"><CardHeader className="p-5 pb-2"><CardTitle className="flex items-center gap-2 text-base text-[#173b72]"><BarChart3 className="h-4 w-4 text-[#2d8b62]" /> Your workspace</CardTitle></CardHeader><CardContent className="space-y-3 p-5 pt-2"><div className="flex items-center justify-between rounded-xl bg-[#f5f8f6] p-3"><span className="text-xs text-[#65717e]">Account type</span><span className="text-xs font-bold text-[#173b72]">{roleLabel(role)}</span></div><div className="flex items-center justify-between rounded-xl bg-[#f5f8f6] p-3"><span className="text-xs text-[#65717e]">Visible to the network</span><span className="text-xs font-bold text-[#2d8b62]">Active</span></div></CardContent></Card></aside>
    </div>
  </div>;
}

function roleLabel(role: string | undefined) { if (role === "university") return "University"; if (role === "industry") return "Industry partner"; return "Citizen"; }
function Metric({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) { const styles: Record<string, string> = { green: "bg-[#e8f5ec] text-[#2d8b62]", blue: "bg-[#eaf0f9] text-[#173b72]", purple: "bg-[#f0effa] text-[#6565a2]", amber: "bg-[#fff3df] text-[#a16716]" }; return <Card className="border-[#dfe5e4] bg-white shadow-[0_8px_24px_rgba(22,45,65,.04)]"><CardContent className="flex items-center gap-3 p-4"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${styles[accent]}`}><Icon className="h-5 w-5" /></span><div><p className="text-2xl font-extrabold tracking-tight text-[#173b72]">{value}</p><p className="text-xs font-semibold text-[#7a8792]">{label}</p></div></CardContent></Card>; }
function SectionHeading({ eyebrow, title, action, href }: { eyebrow: string; title: string; action: string; href: string }) { return <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#84909b]">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-[#173b72]">{title}</h2></div><a href={href} className="hidden items-center gap-1 text-xs font-bold text-[#2d8b62] hover:text-[#173b72] sm:flex">{action} <ArrowRight className="h-3.5 w-3.5" /></a></div>; }
function LoadingCards() { return <>{[1,2].map(item => <Skeleton key={item} className="h-64 rounded-2xl" />)}</>; }
