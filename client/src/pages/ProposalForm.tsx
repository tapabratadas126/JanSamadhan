import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { formatDate } from "@/components/JanSamadhanUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Lightbulb, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function ProposalFormPage() { return <DashboardLayout><ProposalForm /></DashboardLayout>; }
function ProposalForm() {
  const [, params] = useRoute<{ id: string }>("/challenges/:id/propose");
  const challengeId = Number(params?.id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const challenge = trpc.challenges.getById.useQuery({ id: challengeId }, { enabled: Number.isFinite(challengeId) });
  const utils = trpc.useUtils();
  const [proposalText, setProposalText] = useState("");
  const create = trpc.proposals.create.useMutation({ onSuccess: async () => { await utils.challenges.getById.invalidate({ id: challengeId }); await utils.proposals.list.invalidate(); await utils.proposals.mine.invalidate(); toast.success("Your solution proposal is now connected to this challenge."); setLocation(`/challenge/${challengeId}`); }, onError: error => toast.error(error.message) });
  if (!user) return null;
  return <div className="mx-auto max-w-3xl"><Link href={`/challenge/${challengeId}`} className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#65717e] hover:text-[#173b72]"><ArrowLeft className="h-4 w-4" /> Back to challenge</Link>{challenge.isLoading ? <Skeleton className="h-96 rounded-2xl" /> : !challenge.data ? <p className="text-[#65717e]">Challenge not found.</p> : <><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#6565a2]">University proposal</p><h1 className="display-serif mt-3 text-4xl font-semibold tracking-tight text-[#173b72] sm:text-5xl">Bring a path forward.</h1><p className="mt-3 text-sm leading-6 text-[#65717e]">Connect your team’s knowledge to a challenge that matters on the ground.</p></div><Card className="mb-5 border-[#d8d8ed] bg-[#f7f7ff]"><CardContent className="p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#6565a2]"><Lightbulb className="h-5 w-5" /></span><div><Badge variant="outline" className="border-[#d8d8ed] bg-white text-[#4e5291]">You are responding to</Badge><h2 className="mt-2 text-lg font-bold text-[#173b72]">{challenge.data.title}</h2><div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#65717e]"><MapPin className="h-3.5 w-3.5 text-[#2d8b62]" />{challenge.data.location}<span className="text-[#c0c9c8]">·</span>{formatDate(challenge.data.createdAt)}</div></div></div></CardContent></Card><Card className="border-[#dfe5e4] bg-white shadow-[0_18px_50px_rgba(22,45,65,.07)]"><CardHeader className="p-6 pb-3 sm:p-8 sm:pb-4"><CardTitle className="text-xl text-[#173b72]">Describe the solution</CardTitle></CardHeader><CardContent className="p-6 pt-3 sm:p-8 sm:pt-4"><form onSubmit={event => { event.preventDefault(); create.mutate({ challengeId, proposalText }); }} className="space-y-5"><div><Textarea value={proposalText} onChange={event => setProposalText(event.target.value)} className="min-h-56 resize-y" placeholder="What is your proposed solution? Share the approach, who it could serve, and what makes it feasible in this context." required minLength={30} maxLength={6000} /><p className="mt-2 text-right text-xs text-[#84909b]">{proposalText.length}/6000</p></div><div className="flex flex-col justify-end gap-3 border-t border-[#edf0ef] pt-6 sm:flex-row"><Link href={`/challenge/${challengeId}`}><Button type="button" variant="outline" className="border-[#cddbd5] text-[#65717e]">Cancel</Button></Link><Button disabled={create.isPending} type="submit" className="bg-[#173b72] text-white hover:bg-[#102b52]">{create.isPending ? <><Loader2 className="animate-spin" /> Submitting proposal…</> : <>Submit proposal <ArrowRight /></>}</Button></div></form></CardContent></Card></> }</div>;
}
