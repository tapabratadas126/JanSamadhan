"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import CategoryPicker from "@/components/problems/CategoryPicker";
import GoogleMapLocationPicker from "@/components/problems/GoogleMapLocationPicker";
import { MapPin, FileText, Camera, ChevronRight, ChevronLeft, Check, Mic, MicOff, Sparkles } from "lucide-react";

const STEPS = [
  { title: "What type of problem?", subtitle: "Choose the category that best describes the issue", icon: "📋" },
  { title: "Where is this problem located?", subtitle: "Help researchers and responders pinpoint the area", icon: "📍" },
  { title: "Describe the details", subtitle: "Add details, photos, or use voice input to explain", icon: "📝" },
];

export default function NewProblemPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function nextStep() {
    if (step === 0 && !category) { setError("Please select a problem category to proceed"); return; }
    if (step === 1 && !location.trim()) { setError("Please enter a location or village name"); return; }
    setError("");
    setStep((s) => s + 1);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotos(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPhotoUrls(urls);
  }

  // Web Speech API voice input
  function toggleVoice() {
    const win = window as any;
    if (!win.webkitSpeechRecognition && !win.SpeechRecognition) {
      alert("Voice input is not supported in this browser");
      return;
    }
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    setListening(true);
    recognition.start();
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setDescription((d) => d + (d ? " " : "") + transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError("Please provide a title and description for your report");
      return;
    }
    setLoading(true);
    setError("");

    // Upload photos
    const uploadedUrls: string[] = [];
    for (const file of photos) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
    }

    const res = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, location, mediaUrls: uploadedUrls }),
    });

    if (res.ok) {
      const problem = await res.json();
      router.push(`/citizen/problems/${problem.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit report");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  i < step
                    ? "bg-gradient-to-br from-[#14B8A6] to-[#6366F1] text-white shadow-sm"
                    : i === step
                    ? "bg-[#6366F1] text-white shadow-md shadow-indigo-500/30 scale-105"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? <Check size={16} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${i === step ? "text-gray-900" : "text-gray-400"}`}>
                Step {i + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#14B8A6] to-[#6366F1] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] animate-feed-enter">
        <div className="border-b border-gray-100 pb-5">
          <span className="text-3xl" role="img" aria-hidden="true">
            {STEPS[step].icon}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2933] mt-2">{STEPS[step].title}</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">{STEPS[step].subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Step 0: Category Picker */}
        {step === 0 && (
          <div className="space-y-4">
            <CategoryPicker selected={category} onChange={(val) => { setCategory(val); setError(""); }} />
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="label text-base mb-2">
                <MapPin size={18} className="inline mr-1 text-[#6366F1]" />
                Location / Village / City Area *
              </label>
              <GoogleMapLocationPicker
                value={location}
                onChange={(val) => {
                  setLocation(val);
                  setError("");
                }}
                placeholder="Search places, villages, landmark or pin on map..."
              />
              <p className="text-xs text-gray-400 mt-2">
                Search via Google Places, click/drag the pin on the map, use current GPS location, or type manually.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Description + photos */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="label text-base">
                <FileText size={18} className="inline mr-1 text-[#6366F1]" />
                Problem Title *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Drinking water contamination from local pipeline leakage"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label text-base mb-0">Detailed Description *</label>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                    listening
                      ? "bg-red-100 text-red-700 animate-pulse border border-red-300"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                  }`}
                >
                  {listening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{listening ? "Listening (Speak now)…" : "Speak (Voice input)"}</span>
                </button>
              </div>
              <textarea
                className="input h-36 resize-none"
                placeholder="Describe the issue in detail — how long has it been happening, who is affected, and what kind of help is needed?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="label text-base">
                <Camera size={18} className="inline mr-1 text-[#6366F1]" />
                Add Photos (Optional)
              </label>
              <div
                className="border-2 border-dashed border-gray-300 hover:border-[#6366F1] rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-indigo-50/30 transition-all"
                onClick={() => fileRef.current?.click()}
              >
                {photoUrls.length > 0 ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {photoUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url}
                        alt="preview"
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <Camera size={36} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-700">Tap to upload photos or take a picture</p>
                    <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-ghost font-semibold"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              <span>Next Step</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Submitting Report…" : "Submit Problem Report"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
