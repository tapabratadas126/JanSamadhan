"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  FileText,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Loader2,
  Mic,
  MicOff,
  FolderOpen,
} from "lucide-react";
import CategoryPicker, { CATEGORIES } from "@/components/problems/CategoryPicker";
import GoogleMapLocationPicker from "@/components/problems/GoogleMapLocationPicker";
import { AnimatedStepper, Step } from "@/components/ui/AnimatedStepper";
import { useLanguage } from "@/context/LanguageContext";

export default function NewProblemPage() {
  const router = useRouter();
  const { tr, lang } = useLanguage();

  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedProblemId, setSubmittedProblemId] = useState<string | null>(null);

  const [listening, setListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  // Validation
  const isStep1Valid = Boolean(category);
  const isTitleValid = title.trim().length > 0 && title.length <= 100;
  const isDescriptionValid = description.trim().length >= 30 && description.length <= 6000;
  const isLocationValid = location.trim().length > 0;
  const isStep2Valid = isTitleValid && isDescriptionValid && isLocationValid;

  const canNavigateToStep = (targetStep: number) => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return isStep1Valid;
    if (targetStep === 3) return isStep1Valid && isStep2Valid;
    return false;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    // Filter max 5MB and total limit 5
    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    const updatedFiles = [...photos, ...validFiles].slice(0, 5);
    setPhotos(updatedFiles);

    // Create previews
    const newPreviews = updatedFiles.map((f) => URL.createObjectURL(f));
    // Revoke old previews
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotoPreviews(newPreviews);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    const updatedFiles = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(updatedFiles);
    setPhotoPreviews(updatedPreviews);
  };

  // Web Speech API Voice Dictation
  const toggleVoice = () => {
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice dictation is not supported in this browser.");
      return;
    }

    const recognition = new SR();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    setListening(true);
    recognition.start();

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setDescription((prev) => (prev ? prev + " " + transcript : transcript));
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  // Submission
  const handleSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid) {
      setSubmitError("Please fill out all required fields before submitting.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const uploadedUrls: string[] = [];
      for (const file of photos) {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to upload photo");
        }
        const data = await uploadRes.json();
        uploadedUrls.push(data.url);
      }

      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          mediaUrls: uploadedUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit problem report");
      }

      const created = await res.json();
      setSubmittedProblemId(created.id);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.value === category);
  const CategoryIcon = selectedCategoryObj ? selectedCategoryObj.icon : FolderOpen;

  // ── Success Panel ─────────────────────────────────────────────────────────
  if (submittedProblemId) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
        <div className="card text-center p-8 sm:p-10 space-y-6 border border-[#E5DFD0]">
          <div className="w-16 h-16 rounded-full bg-[#E3F0E7] text-[#2E7D4F] flex items-center justify-center mx-auto border border-[#2E7D4F]/30">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#17254A]">
              Problem Submitted
            </h2>
            <p className="text-sm text-[#5E5C54] leading-relaxed max-w-md mx-auto">
              Your civic report has been received. An administrator will review your submission before it appears on the public feed.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/citizen/my-problems"
              className="btn-primary text-sm font-semibold w-full sm:w-auto px-6 py-2.5 no-underline"
            >
              View My Reports
            </Link>
            <button
              type="button"
              onClick={() => {
                setSubmittedProblemId(null);
                setCurrentStep(1);
                setCategory("");
                setTitle("");
                setDescription("");
                setLocation("");
                setPhotos([]);
                setPhotoPreviews([]);
              }}
              className="btn-secondary text-sm font-semibold w-full sm:w-auto px-6 py-2.5"
            >
              Report Another Problem
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Next button disable logic per step
  const isCurrentStepValid = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-1">
        <div className={lang === "hi" ? "eyebrow-hi text-[#2E7D4F]" : "eyebrow-en text-[#2E7D4F]"}>
          Citizen Grievance Submission
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#17254A]">
          Report a Civic Problem
        </h1>
        <p className="text-xs sm:text-sm text-[#5E5C54]">
          Submit community challenges to connect with researchers, universities, and CSR partners.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-[#F8E1DC] border border-[#A33A2B] text-[#A33A2B] text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Animated Stepper Container */}
      <AnimatedStepper
        initialStep={1}
        currentStepControlled={currentStep}
        onStepChange={(s) => setCurrentStep(s)}
        onFinalStepCompleted={handleSubmit}
        canNavigateToStep={canNavigateToStep}
        nextButtonText={lang === "hi" ? "आगे बढ़ें" : "Continue"}
        backButtonText={lang === "hi" ? "पीछे" : "Back"}
        completeButtonText={
          submitting ? "Submitting..." : lang === "hi" ? "समस्या दर्ज करें" : "Submit problem"
        }
        nextButtonProps={{
          disabled: !isCurrentStepValid || submitting,
        }}
      >
        {/* Step 1: Category Picker */}
        <Step
          title="1. What type of problem?"
          subtitle="Choose the 1 category that best classifies the community issue"
        >
          <div className="space-y-4 pt-2">
            <CategoryPicker
              selected={category}
              onChange={(val) => setCategory(val)}
            />
            {!isStep1Valid && (
              <p className="text-xs text-[#5E5C54]">
                Please select a category to continue.
              </p>
            )}
          </div>
        </Step>

        {/* Step 2: Describe the problem */}
        <Step
          title="2. Describe the problem"
          subtitle="Provide clear details and location to help university researchers analyze the challenge"
        >
          <div className="space-y-5 pt-2">
            {/* Title with live counter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="label text-xs sm:text-sm">Problem Title *</label>
                <span
                  className={`text-xs tabular-nums ${
                    title.length > 100 ? "text-[#A33A2B] font-bold" : "text-[#5E5C54]"
                  }`}
                >
                  {title.length}/100
                </span>
              </div>
              <input
                type="text"
                className="input"
                maxLength={100}
                placeholder="e.g. Contaminated drinking water from fractured supply pipe in Ward 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {title.length === 0 && (
                <p className="text-[11px] text-[#5E5C54]">Title is required.</p>
              )}
            </div>

            {/* Description with live counter + Voice Dictation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="label text-xs sm:text-sm">Detailed Description *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                      listening
                        ? "bg-[#F8E1DC] text-[#A33A2B] border-[#A33A2B] animate-pulse"
                        : "bg-[#F1ECDF] text-[#17254A] border-[#E5DFD0] hover:bg-[#E5DFD0]"
                    }`}
                  >
                    {listening ? <MicOff size={12} /> : <Mic size={12} />}
                    <span>{listening ? "Listening…" : "Voice Input"}</span>
                  </button>
                  <span
                    className={`text-xs tabular-nums ${
                      description.length < 30 || description.length > 6000
                        ? "text-[#A33A2B]"
                        : "text-[#5E5C54]"
                    }`}
                  >
                    {description.length}/6000 (min 30)
                  </span>
                </div>
              </div>
              <textarea
                className="input h-32 resize-none"
                maxLength={6000}
                placeholder="Explain the background, how many households are affected, how long this issue has persisted, and what immediate support is requested."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {description.length > 0 && description.length < 30 && (
                <p className="text-[11px] text-[#A33A2B]">
                  Please write at least 30 characters ({30 - description.length} more needed).
                </p>
              )}
            </div>

            {/* Location (required) */}
            <div className="space-y-1">
              <label className="label text-xs sm:text-sm">
                Location / Ward / Village Area *
              </label>
              <GoogleMapLocationPicker
                value={location}
                onChange={(val) => setLocation(val)}
                placeholder="Search village, ward, district or pin location on map..."
              />
              {location.trim().length === 0 && (
                <p className="text-[11px] text-[#5E5C54]">Location is required.</p>
              )}
            </div>
          </div>
        </Step>

        {/* Step 3: Photos and Review */}
        <Step
          title="3. Add photos and review"
          subtitle="Add up to 5 photos (max 5 MB each) and verify your submission"
        >
          <div className="space-y-6 pt-2">
            {/* Photo Upload Area */}
            <div className="space-y-2">
              <label className="label text-xs sm:text-sm">
                Photographic Evidence (Optional, max 5 images)
              </label>
              <div
                className="border-2 border-dashed border-[#E5DFD0] hover:border-[#2E7D4F] rounded-2xl p-6 text-center cursor-pointer bg-[#FAF7F0] hover:bg-[#F1ECDF]/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={32} className="mx-auto mb-2 text-[#5E5C54]" />
                <p className="text-xs sm:text-sm font-semibold text-[#1C1B18]">
                  Click or drag photos to attach
                </p>
                <p className="text-[11px] text-[#5E5C54] mt-0.5">
                  PNG, JPG or WEBP up to 5 MB per file ({5 - photos.length} remaining)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {/* Photo Previews with Remove button */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {photoPreviews.map((previewUrl, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-[#E5DFD0] aspect-square bg-[#FFFFFF]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(idx);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#17254A]/80 hover:bg-[#A33A2B] text-white flex items-center justify-center transition-colors"
                        title="Remove photo"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Summary */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] border border-[#E5DFD0] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E5DFD0] pb-2">
                <span className="text-xs font-semibold text-[#17254A] uppercase tracking-wider">
                  Summary & Verification
                </span>
                <span className="text-[11px] text-[#5E5C54]">Ready to submit</span>
              </div>

              {/* Category summary item */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4 text-[#2E7D4F]" />
                  <span className="text-[#5E5C54]">Category:</span>
                  <span className="font-semibold text-[#1C1B18]">
                    {selectedCategoryObj?.label || category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#2E7D4F] hover:underline font-semibold flex items-center gap-0.5"
                >
                  <Edit3 size={11} /> Edit
                </button>
              </div>

              {/* Title summary item */}
              <div className="flex items-start justify-between text-xs gap-3">
                <div className="flex-1">
                  <span className="text-[#5E5C54]">Title: </span>
                  <span className="font-semibold text-[#1C1B18]">{title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#2E7D4F] hover:underline font-semibold flex items-center gap-0.5 shrink-0"
                >
                  <Edit3 size={11} /> Edit
                </button>
              </div>

              {/* Location summary item */}
              <div className="flex items-start justify-between text-xs gap-3">
                <div className="flex-1">
                  <span className="text-[#5E5C54]">Location: </span>
                  <span className="font-semibold text-[#1C1B18]">{location}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-[#2E7D4F] hover:underline font-semibold flex items-center gap-0.5 shrink-0"
                >
                  <Edit3 size={11} /> Edit
                </button>
              </div>

              {/* Photos count */}
              <div className="text-xs text-[#5E5C54] pt-1 border-t border-[#E5DFD0]">
                <span>Attached Photos: </span>
                <span className="font-semibold text-[#1C1B18]">{photos.length}</span>
              </div>
            </div>
          </div>
        </Step>
      </AnimatedStepper>
    </div>
  );
}
