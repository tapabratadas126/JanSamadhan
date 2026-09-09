import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { upload } from "@vercel/blob/client";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type PhotoDraft = {
  file: File;
  fileName: string;
  preview: string;
};

export default function ChallengeFormPage() {
  return <DashboardLayout><ChallengeForm /></DashboardLayout>;
}

function ChallengeForm() {
  const { user } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/auth/sign-in" });
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocationField] = useState("");
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const create = trpc.challenges.create.useMutation({
    onSuccess: async result => {
      await utils.challenges.list.invalidate();
      await utils.challenges.mine.invalidate();
      toast.success("Your challenge is now visible to the network.");
      setLocation(`/challenge/${result.id}`);
    },
    onError: error => toast.error(error.message),
  });

  if (!user) return null;

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 5 - photos.length);
    const next: PhotoDraft[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} must be JPG, PNG, or WEBP.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5 MB.`);
        continue;
      }
      next.push({ file, fileName: file.name, preview: URL.createObjectURL(file) });
    }
    setPhotos(current => [...current, ...next].slice(0, 5));
    event.target.value = "";
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (create.isPending) return;

    try {
      const uploaded: Array<{ url: string; fileKey: string }> = [];
      for (const photo of photos) {
        const safeName = photo.fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-100);
        const pathname = `challenge-photos/${user.id}/${crypto.randomUUID()}-${safeName}`;
        const blob = await upload(pathname, photo.file, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
          multipart: true,
        });
        uploaded.push({ url: blob.url, fileKey: blob.pathname });
      }

      create.mutate({ title, description, location, photos: uploaded });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed.");
    }
  }

  return <div className="mx-auto max-w-3xl"><Link href="/dashboard" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#65717e] hover:text-[#173b72]"><ArrowLeft className="h-4 w-4" /> Back to workspace</Link><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#2d8b62]">Citizen report</p><h1 className="display-serif mt-3 text-4xl font-semibold tracking-tight text-[#173b72] sm:text-5xl">What needs attention?</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#65717e]">A clear description helps universities and industry partners understand where they can contribute.</p></div><Card className="border-[#dfe5e4] bg-white shadow-[0_18px_50px_rgba(22,45,65,.07)]"><CardHeader className="p-6 pb-3 sm:p-8 sm:pb-4"><CardTitle className="text-xl text-[#173b72]">Describe the challenge</CardTitle></CardHeader><CardContent className="p-6 pt-3 sm:p-8 sm:pt-4"><form onSubmit={submit} className="space-y-6"><div><Label htmlFor="challenge-title">Challenge title</Label><Input id="challenge-title" value={title} onChange={event => setTitle(event.target.value)} className="mt-2 h-11" placeholder="e.g. Reliable drinking water for our school" required minLength={8} maxLength={200} /></div><div><Label htmlFor="challenge-location">Location</Label><div className="relative mt-2"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2d8b62]" /><Input id="challenge-location" value={location} onChange={event => setLocationField(event.target.value)} className="h-11 pl-10" placeholder="Village, block, district, or city" required maxLength={255} /></div><p className="mt-2 text-xs text-[#84909b]">A simple text location is enough for now.</p></div><div><Label htmlFor="challenge-description">What is happening?</Label><Textarea id="challenge-description" value={description} onChange={event => setDescription(event.target.value)} className="mt-2 min-h-36 resize-y" placeholder="Share what people are experiencing, who is affected, and what would make a difference." required minLength={20} maxLength={5000} /><p className="mt-2 text-right text-xs text-[#84909b]">{description.length}/5000</p></div><div><div className="flex items-end justify-between gap-3"><div><Label htmlFor="challenge-photos">Photos or visual context <span className="font-normal text-[#84909b]">(optional)</span></Label><p className="mt-1 text-xs text-[#84909b]">Up to 5 images, 5 MB each.</p></div><span className="text-xs font-bold text-[#84909b]">{photos.length}/5</span></div><div className="mt-3 grid gap-3 sm:grid-cols-3">{photos.map((photo, index) => <div key={`${photo.fileName}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#dfe5e4]"><img src={photo.preview} alt={photo.fileName} className="h-full w-full object-cover" /><button type="button" onClick={() => { URL.revokeObjectURL(photo.preview); setPhotos(current => current.filter((_, photoIndex) => photoIndex !== index)); }} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#102f57]/80 text-white" aria-label={`Remove ${photo.fileName}`}><X className="h-3.5 w-3.5" /></button></div>)}{photos.length < 5 && <label htmlFor="challenge-photos" className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#a9c8b7] bg-[#f4faf6] text-center transition-colors hover:bg-[#eaf5ee]"><ImagePlus className="h-7 w-7 text-[#2d8b62]" /><span className="mt-2 text-xs font-bold text-[#2d8b62]">Add photos</span><span className="mt-1 text-[10px] text-[#84909b]">JPG, PNG, WEBP</span><input id="challenge-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={handleFiles} /></label>}</div></div><div className="flex flex-col justify-end gap-3 border-t border-[#edf0ef] pt-6 sm:flex-row"><Link href="/dashboard"><Button type="button" variant="outline" className="border-[#cddbd5] text-[#65717e]">Cancel</Button></Link><Button disabled={create.isPending} type="submit" className="bg-[#2d8b62] text-white hover:bg-[#226e4d]">{create.isPending ? <><Loader2 className="animate-spin" /> Sharing challenge…</> : <>Share challenge <ArrowRight /></>}</Button></div></form></CardContent></Card></div>;
}
