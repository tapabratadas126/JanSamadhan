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
            className={`group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-center transition-all duration-150 min-h-[96px] ${
              isSelected
                ? "border-[#2E7D4F] bg-[#E3F0E7] text-[#2E7D4F] font-semibold"
                : "border-[#E5DFD0] bg-[#FFFFFF] hover:border-[#CBC3AE] hover:bg-[#FAF7F0] text-[#1C1B18]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                isSelected ? "bg-[#2E7D4F] text-[#FFFFFF]" : "bg-[#F1ECDF] text-[#17254A] group-hover:bg-[#E5DFD0]"
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <span className="text-xs leading-snug line-clamp-2">
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
