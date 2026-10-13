import { Star } from "lucide-react";

interface StarRatingProps {
  score: number; // 0 to 5
  maxStars?: number;
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function StarRating({
  score,
  maxStars = 5,
  size = 18,
  showText = true,
  className = "",
}: StarRatingProps) {
  const rounded = Math.round(score * 10) / 10;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`${rounded} out of ${maxStars} stars`}>
        {Array.from({ length: maxStars }).map((_, i) => {
          const starValue = i + 1;
          const isFull = score >= starValue;
          const isHalf = !isFull && score >= starValue - 0.5;

          return (
            <span key={i} className="relative inline-block">
              {isFull ? (
                <Star
                  size={size}
                  className="text-amber-400 fill-amber-400 drop-shadow-xs"
                />
              ) : isHalf ? (
                <span className="relative inline-block">
                  <Star size={size} className="text-gray-200 fill-gray-200" />
                  <span className="absolute inset-0 overflow-hidden w-1/2">
                    <Star size={size} className="text-amber-400 fill-amber-400" />
                  </span>
                </span>
              ) : (
                <Star size={size} className="text-gray-200 fill-gray-100" />
              )}
            </span>
          );
        })}
      </div>
      {showText && (
        <span className="font-extrabold text-gray-800 text-sm tracking-tight ml-1">
          {score > 0 ? rounded.toFixed(1) : "N/A"}
        </span>
      )}
    </div>
  );
}

export function CriteriaScoreBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (score / 5) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </span>
        <span className="font-bold text-gray-900">
          {score > 0 ? `${score.toFixed(1)} / 5.0` : "Not rated"}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
