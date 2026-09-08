import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { formatDate } from "@/components/JanSamadhanUI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Building2, Handshake, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function PartnershipFormPage() { return <DashboardLayout><PartnershipForm /></DashboardLayout>; }
function PartnershipForm() {
  const [, params] = useRoute<{ id: string }>("/proposals/:id/partner");
  const proposalId = Number(params?.id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const proposals = trpc.proposals.list.useQuery();
  const proposal = proposals.data?.find(item => item.id === proposalId);
  const utils = trpc.useUtils();
  const [partnershipDetails, setPartnershipDetails] = useState("");
  const create = trpc.partnerships.create.useMutation({ onSuccess: async () => { await utils.proposals.list.invalidate(); await utils.partnerships.list.invalidate(); await utils.partnerships.mine.invalidate(); toast.success("Your partnership offer is now visible on the proposal."); setLocation(`/challenge/${proposal?.challenge.id || ""}`); }, onError: error => toast.error(error.message) });
  if (!user) return null;
  return <div className="mx-auto max-w-3xl"><Link href="/dashboard#proposals" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#65717e] hover:text-[#173b72]"><ArrowLeft className="h-4 w-4" /> Back to proposals</Link>{proposals.isLoading ? <Skeleton className="h-96 rounded-2xl" /> : !proposal ? <p className="text-[#65717e]">Proposal not found.</p> : <><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a16716]">Industry partnership</p><h1 className="display-serif mt-3 text-4xl font-semibold tracking-tight text-[#173b72] sm:text-5xl">Add the support that unlocks action.</h1><p className="mt-3 text-sm leading-6 text-[#65717e]">A specific offer helps a good idea understand what can happen next.</p></div><Card className="mb-5 border-[#ecd9b6] bg-[#fff8ed]"><CardContent className="p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#d97706]"><Building2 className="h-5 w-5" /></span><div><Badge variant="outline" className="border-[#ecd9b6] bg-white text-[#9b5d0a]">You are responding to</Badge><h2 className="mt-2 text-lg font-bold text-[#173b72]">{proposal.challenge.title}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#73541e]">{proposal.proposalText}</p><div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#65717e]"><MapPin className="h-3.5 w-3.5 text-[#2d8b62]" />{proposal.challenge.location}<span className="text-[#c0c9c8]">·</span>{proposal.university?.organization || proposal.university?.name || "University partner"}<span className="text-[#c0c9c8]">·</span>{formatDate(proposal.createdAt)}</div></div></div></CardContent></Card><Card className="border-[#dfe5e4] bg-white shadow-[0_18px_50px_rgba(22,45,65,.07)]"><CardHeader className="p-6 pb-3 sm:p-8 sm:pb-4"><CardTitle className="text-xl text-[#173b72]">What can you offer?</CardTitle></CardHeader><CardContent className="p-6 pt-3 sm:p-8 sm:pt-4"><form onSubmit={event => { event.preventDefault(); create.mutate({ proposalId, partnershipDetails }); }} className="space-y-5"><Textarea value={partnershipDetails} onChange={event => setPartnershipDetails(event.target.value)} className="min-h-56 resize-y" placeholder="Share the support you can provide — funding, mentorship, technical expertise, equipment, a field pilot, or something else specific." required minLength={30} maxLength={6000} /><p className="text-right text-xs text-[#84909b]">{partnershipDetails.length}/6000</p><div className="flex flex-col justify-end gap-3 border-t border-[#edf0ef] pt-6 sm:flex-row"><Link href="/dashboard#proposals"><Button type="button" variant="outline" className="border-[#cddbd5] text-[#65717e]">Cancel</Button></Link><Button disabled={create.isPending} type="submit" className="bg-[#173b72] text-white hover:bg-[#102b52]">{create.isPending ? <><Loader2 className="animate-spin" /> Sharing offer…</> : <>Offer partnership <Handshake /></>}</Button></div></form></CardContent></Card></>}</div>;
}
