import { useAuth } from "@/_core/hooks/useAuth";
import { LogoMark, RoleIcon } from "@/components/JanSamadhanUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type Role = "citizen" | "university" | "industry";
const roles: Array<{ value: Role; title: string; description: string }> = [
  { value: "citizen", title: "Citizen", description: "Report what your community needs." },
  { value: "university", title: "University", description: "Bring research and solutions to the table." },
  { value: "industry", title: "Industry partner", description: "Support promising ideas with action." },
];

export function SignInPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const signIn = trpc.auth.signIn.useMutation({ onSuccess: result => { utils.auth.me.setData(undefined, result); toast.success("Welcome back to JanSamadhan."); setLocation("/dashboard"); }, onError: error => toast.error(error.message) });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { if (user) setLocation("/dashboard"); }, [user, setLocation]);

  return <AuthShell eyebrow="Welcome back" title="Sign in to keep the work moving." description="Your workspace brings your reports, proposals, or partnerships together in one view.">
    <form onSubmit={event => { event.preventDefault(); signIn.mutate({ email, password }); }} className="space-y-5">
      <div><Label htmlFor="email">Email address</Label><div className="relative mt-2"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b969f]" /><Input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.org" className="h-11 pl-10" required autoComplete="email" /></div></div>
      <div><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><span className="text-xs font-semibold text-[#84909b]">8+ characters</span></div><div className="relative mt-2"><LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b969f]" /><Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" className="h-11 pl-10 pr-11" required minLength={8} autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#84909b]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
      <Button disabled={signIn.isPending} type="submit" size="lg" className="h-12 w-full bg-[#173b72] text-white hover:bg-[#102b52]">{signIn.isPending ? "Signing in…" : "Sign in"} <ArrowRight /></Button>
    </form>
    <p className="mt-7 text-center text-sm text-[#65717e]">New to JanSamadhan? <Link href="/auth/sign-up" className="font-bold text-[#2d8b62] hover:underline">Create an account</Link></p>
  </AuthShell>;
}

export function SignUpPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [role, setRole] = useState<Role | null>(() => { const value = new URLSearchParams(window.location.search).get("role"); return value === "citizen" || value === "university" || value === "industry" ? value : null; });
  const [step, setStep] = useState<1 | 2>(role ? 2 : 1);
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const signUp = trpc.auth.signUp.useMutation({ onSuccess: result => { utils.auth.me.setData(undefined, result); toast.success("Your JanSamadhan workspace is ready."); setLocation("/dashboard"); }, onError: error => toast.error(error.message) });
  useEffect(() => { if (user) setLocation("/dashboard"); }, [user, setLocation]);
  const chosen = roles.find(item => item.value === role);

  const roleArticle = chosen?.value === "industry" ? "an" : "a";
  return <AuthShell eyebrow={step === 1 ? "Join the network" : `Joining as ${roleArticle} ${chosen?.title.toLowerCase()}`} title={step === 1 ? "Choose how you want to contribute." : "Create your JanSamadhan account."} description={step === 1 ? "Every role has a clear part to play in turning local observations into shared progress." : "Keep it simple. You can add more context to your work as the collaboration grows."}>
    {step === 1 ? <div className="space-y-3">{roles.map(item => <button type="button" key={item.value} onClick={() => { setRole(item.value); setStep(2); }} className="flex w-full items-center gap-4 rounded-2xl border border-[#dfe5e4] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#8fc3a7] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#2d8b62]"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf5f0] text-[#2d8b62]"><RoleIcon role={item.value} /></span><span className="flex-1"><span className="block font-bold text-[#173b72]">{item.title}</span><span className="mt-1 block text-xs leading-5 text-[#65717e]">{item.description}</span></span><ArrowRight className="h-4 w-4 text-[#8b969f]" /></button>)}</div> : <>
      <button type="button" onClick={() => setStep(1)} className="mb-5 flex items-center gap-2 text-xs font-bold text-[#65717e] hover:text-[#173b72]"><ArrowLeft className="h-3.5 w-3.5" /> Change role</button>
      <form onSubmit={event => { event.preventDefault(); if (!role) return; signUp.mutate({ name, organization, email, password, role }); }} className="space-y-4">
        <div><Label htmlFor="name">Your name</Label><Input id="name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Asha Kumari" className="mt-2 h-11" required minLength={2} maxLength={120} autoComplete="name" /></div>
        <div><Label htmlFor="organization">Organization <span className="font-normal text-[#8b969f]">(optional)</span></Label><Input id="organization" value={organization} onChange={event => setOrganization(event.target.value)} placeholder={role === "citizen" ? "Village, ward, or community group" : "University, startup, CSR team…"} className="mt-2 h-11" maxLength={255} autoComplete="organization" /></div>
        <div><Label htmlFor="signup-email">Email address</Label><Input id="signup-email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.org" className="mt-2 h-11" required autoComplete="email" /></div>
        <div><Label htmlFor="signup-password">Create a password</Label><div className="relative mt-2"><Input id="signup-password" type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" className="h-11 pr-11" required minLength={8} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#84909b]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        <Button disabled={signUp.isPending} type="submit" size="lg" className="mt-2 h-12 w-full bg-[#2d8b62] text-white hover:bg-[#226e4d]">{signUp.isPending ? "Creating your workspace…" : "Create account"} <ArrowRight /></Button>
      </form>
      <p className="mt-6 text-center text-sm text-[#65717e]">Already have an account? <Link href="/auth/sign-in" className="font-bold text-[#2d8b62] hover:underline">Sign in</Link></p>
    </>}
  </AuthShell>;
}

function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#edf4f1] lg:grid lg:grid-cols-[.95fr_1.05fr]"><div className="relative hidden overflow-hidden bg-[#173b72] px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute inset-0 civic-grid opacity-10" /><div className="relative"><LogoMark /><div className="mt-24 max-w-lg"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#8bd0a8]">A better handoff</p><h1 className="display-serif mt-5 text-6xl font-semibold leading-[1.02]">Good ideas need a place to meet.</h1><p className="mt-6 max-w-md text-base leading-8 text-[#b8c9d8]">JanSamadhan gives local knowledge, research, and resources a shared starting point.</p></div></div><div className="relative flex items-center gap-3 text-xs font-semibold text-[#b8c9d8]"><ShieldCheck className="h-4 w-4 text-[#8bd0a8]" /> Clear roles. Practical action. Shared ownership.</div></div><div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8"><div className="w-full max-w-md"><div className="mb-8 flex items-center justify-between lg:hidden"><LogoMark /><Link href="/"><Button variant="ghost" className="text-[#173b72]">Home</Button></Link></div><Card className="border-[#dfe5e4] bg-white shadow-[0_24px_70px_rgba(23,59,114,.10)]"><CardHeader className="p-7 pb-3 sm:p-9 sm:pb-4"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#2d8b62]">{eyebrow}</p><CardTitle className="display-serif mt-3 text-3xl leading-tight text-[#173b72] sm:text-4xl">{title}</CardTitle><p className="mt-3 text-sm leading-6 text-[#65717e]">{description}</p></CardHeader><CardContent className="p-7 pt-4 sm:p-9 sm:pt-5">{children}</CardContent></Card></div></div></div>;
}
