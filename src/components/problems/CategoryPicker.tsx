import React from "react";
import {
  GraduationCap,
  HeartPulse,
  Wheat,
  Droplets,
  Sparkles,
  Trees,
  Briefcase,
  Accessibility,
  Building2,
  Landmark,
  LucideIcon,
} from "lucide-react";

export interface Category {
  value: string;
  label: string;
  emoji: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORIES: Category[] = [
  {
    value: "EDUCATION",
    label: "Education",
    emoji: "📚",
    icon: GraduationCap,
    color: "#17254A",
    bgColor: "#FAF7F0",
    borderColor: "#E5DFD0",
  },
  {
    value: "HEALTHCARE",
    label: "Healthcare",
    emoji: "🏥",
    icon: HeartPulse,
    color: "#A33A2B",
    bgColor: "#F8E1DC",
    borderColor: "#E5DFD0",
  },
  {
    value: "AGRICULTURE",
    label: "Agriculture",
    emoji: "🌾",
    icon: Wheat,
    color: "#2E7D4F",
    bgColor: "#E3F0E7",
    borderColor: "#E5DFD0",
  },
  {
    value: "WATER",
    label: "Water",
    emoji: "💧",
    icon: Droplets,
    color: "#17254A",
    bgColor: "#E4E9F5",
    borderColor: "#E5DFD0",
  },
  {
    value: "SANITATION",
    label: "Sanitation",
    emoji: "🚻",
    icon: Sparkles,
    color: "#2E7D4F",
    bgColor: "#FAF7F0",
    borderColor: "#E5DFD0",
  },
  {
    value: "ENVIRONMENT",
    label: "Environment",
    emoji: "🌱",
    icon: Trees,
    color: "#2E7D4F",
    bgColor: "#E3F0E7",
    borderColor: "#E5DFD0",
  },
  {
    value: "RURAL_LIVELIHOODS",
    label: "Rural Livelihoods",
    emoji: "🧑‍🌾",
    icon: Briefcase,
    color: "#D98324",
    bgColor: "#FBEBD3",
    borderColor: "#E5DFD0",
  },
  {
    value: "ACCESSIBILITY",
    label: "Accessibility",
    emoji: "♿",
    icon: Accessibility,
    color: "#17254A",
    bgColor: "#FAF7F0",
    borderColor: "#E5DFD0",
  },
  {
    value: "URBAN_INFRASTRUCTURE",
    label: "Urban Infrastructure",
    emoji: "🏙️",
    icon: Building2,
    color: "#17254A",
    bgColor: "#F1ECDF",
    borderColor: "#E5DFD0",
  },
  {
    value: "PUBLIC_ADMINISTRATION",
    label: "Public Administration",
    emoji: "🏛️",
    icon: Landmark,
    color: "#17254A",
    bgColor: "#E4E9F5",
    borderColor: "#E5DFD0",
  },
];

interface CategoryPickerProps {
  selected: string;
  onChange: (value: string) => void;
}

export default function CategoryPicker({ selected, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.value;
        const IconComponent = cat.icon;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 border-2 border-[#171e19] text-center transition-all duration-100 min-h-[104px] cursor-pointer ${
              isSelected
                ? "bg-[#ffe17c] shadow-[4px_4px_0_0_#171e19] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white hover:bg-[#b7c6c2]/20 shadow-[2px_2px_0_0_#171e19]"
            }`}
          >
            <div
              className={`w-11 h-11 border-2 border-[#171e19] flex items-center justify-center mb-2 transition-colors ${
                isSelected
                  ? "bg-[#171e19] text-[#ffe17c] shadow-[1px_1px_0_0_#171e19]"
                  : "bg-[#faf9f6] text-[#171e19] shadow-[1px_1px_0_0_#171e19]"
              }`}
            >
              <IconComponent className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-mono text-xs font-bold uppercase text-[#171e19] leading-snug line-clamp-2">
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
