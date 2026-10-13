interface Category {
  value: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: Category[] = [
  { value: "EDUCATION", label: "Education", emoji: "📚", color: "#6366F1", bgColor: "#EEF2FF", borderColor: "#E0E7FF" },
  { value: "HEALTHCARE", label: "Healthcare", emoji: "🏥", color: "#EF4444", bgColor: "#FEF2F2", borderColor: "#FEE2E2" },
  { value: "AGRICULTURE", label: "Agriculture", emoji: "🌾", color: "#22C55E", bgColor: "#F0FDF4", borderColor: "#DCFCE7" },
  { value: "WATER", label: "Water", emoji: "💧", color: "#3B82F6", bgColor: "#EFF6FF", borderColor: "#DBEAFE" },
  { value: "SANITATION", label: "Sanitation", emoji: "🚻", color: "#14B8A6", bgColor: "#F0FDFA", borderColor: "#CCFBF1" },
  { value: "ENVIRONMENT", label: "Environment", emoji: "🌱", color: "#16A34A", bgColor: "#F0FDF4", borderColor: "#DCFCE7" },
  { value: "RURAL_LIVELIHOODS", label: "Rural Livelihoods", emoji: "🧑‍🌾", color: "#F59E0B", bgColor: "#FFFBEB", borderColor: "#FEF3C7" },
  { value: "ACCESSIBILITY", label: "Accessibility", emoji: "♿", color: "#8B5CF6", bgColor: "#F5F3FF", borderColor: "#EDE9FE" },
  { value: "URBAN_INFRASTRUCTURE", label: "Urban Infrastructure", emoji: "🏙️", color: "#64748B", bgColor: "#F8FAFC", borderColor: "#E2E8F0" },
  { value: "PUBLIC_ADMINISTRATION", label: "Public Administration", emoji: "🏛️", color: "#0EA5E9", bgColor: "#F0F9FF", borderColor: "#E0F2FE" },
];

interface CategoryPickerProps {
  selected: string;
  onChange: (value: string) => void;
}

export { CATEGORIES };

export default function CategoryPicker({ selected, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {CATEGORIES.map((cat) => {
        const isSelected = selected === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            style={{
              borderColor: isSelected ? cat.color : undefined,
              backgroundColor: isSelected ? cat.bgColor : "#FFFFFF",
            }}
            className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 min-h-[96px] text-center ${
              isSelected
                ? "shadow-md scale-[1.02]"
                : "border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/70 hover:scale-[1.01]"
            }`}
          >
            <span className="text-3xl mb-1.5 transition-transform group-hover:scale-110" role="img" aria-label={cat.label}>
              {cat.emoji}
            </span>
            <span
              className="text-xs font-bold leading-tight line-clamp-1"
              style={{ color: isSelected ? cat.color : "#374151" }}
            >
              {cat.label}
            </span>
            {isSelected && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
