import { ThumbsUp, MapPin, Lightbulb } from "lucide-react";
import Link from "next/link";

interface Problem {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  upvoteCount: number;
  createdAt: string | Date;
  postedBy: { name: string };
  _count?: { solutions: number };
}

export const CATEGORY_DATA: Record<string, { label: string; emoji: string; color: string; bgColor: string; borderColor: string }> = {
  EDUCATION: { label: "Education", emoji: "📚", color: "#6366F1", bgColor: "#EEF2FF", borderColor: "#E0E7FF" },
  HEALTHCARE: { label: "Healthcare", emoji: "🏥", color: "#EF4444", bgColor: "#FEF2F2", borderColor: "#FEE2E2" },
  AGRICULTURE: { label: "Agriculture", emoji: "🌾", color: "#22C55E", bgColor: "#F0FDF4", borderColor: "#DCFCE7" },
  WATER: { label: "Water", emoji: "💧", color: "#3B82F6", bgColor: "#EFF6FF", borderColor: "#DBEAFE" },
  SANITATION: { label: "Sanitation", emoji: "🚻", color: "#14B8A6", bgColor: "#F0FDFA", borderColor: "#CCFBF1" },
  ENVIRONMENT: { label: "Environment", emoji: "🌱", color: "#16A34A", bgColor: "#F0FDF4", borderColor: "#DCFCE7" },
  RURAL_LIVELIHOODS: { label: "Rural Livelihoods", emoji: "🧑‍🌾", color: "#F59E0B", bgColor: "#FFFBEB", borderColor: "#FEF3C7" },
  ACCESSIBILITY: { label: "Accessibility", emoji: "♿", color: "#8B5CF6", bgColor: "#F5F3FF", borderColor: "#EDE9FE" },
  URBAN_INFRASTRUCTURE: { label: "Urban Infrastructure", emoji: "🏙️", color: "#64748B", bgColor: "#F8FAFC", borderColor: "#E2E8F0" },
  PUBLIC_ADMINISTRATION: { label: "Public Administration", emoji: "🏛️", color: "#0EA5E9", bgColor: "#F0F9FF", borderColor: "#E0F2FE" },
};

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string; emoji: string }> = {
    OPEN: { className: "status-open", label: "Open", emoji: "🆕" },
    SOLUTION_PROPOSED: { className: "status-solution", label: "Solution Proposed", emoji: "💡" },
    PARTNERSHIP_APPROVED: { className: "status-partnership", label: "Partnership Approved", emoji: "🤝" },
    RESOLVED: { className: "status-resolved", label: "Resolved", emoji: "✅" },
    PROPOSED: { className: "status-proposed", label: "Proposed", emoji: "⏳" },
    APPROVED: { className: "status-approved", label: "Approved", emoji: "🤝" },
    REJECTED: { className: "status-rejected", label: "Rejected", emoji: "❌" },
  };
  const s = map[status] || map.OPEN;
  return (
    <span className={`badge ${s.className}`}>
      <span>{s.emoji}</span>
      <span>{s.label}</span>
    </span>
  );
}

export function ApprovalStatusPill({ status }: { status?: string }) {
  if (!status || status === "APPROVED") return null;
  const map: Record<string, { className: string; label: string; emoji: string }> = {
    PENDING: { className: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending Approval", emoji: "⏳" },
    UNDER_REVIEW: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Under Review", emoji: "🔍" },
    REJECTED: { className: "bg-red-50 text-red-700 border-red-200", label: "Rejected", emoji: "❌" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.className}`}>
      <span>{s.emoji}</span>
      <span>{s.label}</span>
    </span>
  );
}

interface ProblemCardProps {
  problem: Problem & { approvalStatus?: string };
  href: string;
}

export default function ProblemCard({ problem, href }: ProblemCardProps) {
  const timeAgo = (dateStr: string | Date) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const cat = CATEGORY_DATA[problem.category] || {
    label: problem.category,
    emoji: "📌",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    borderColor: "#E0E7FF",
  };

  return (
    <Link href={href} className="no-underline block group">
      <div className="card card-hover flex flex-col justify-between h-full group-hover:border-indigo-200/80">
        <div>
          {/* Header Tag and Status */}
          <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: cat.bgColor,
                color: cat.color,
                borderColor: cat.borderColor,
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <ApprovalStatusPill status={problem.approvalStatus} />
              <StatusPill status={problem.status} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {problem.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
            <MapPin size={13} className="text-gray-400 shrink-0" />
            <span className="truncate">{problem.location}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-700 font-bold bg-gray-50 px-2 py-0.5 rounded-md">
              <ThumbsUp size={13} className="text-indigo-600" />
              <span>{problem.upvoteCount}</span>
            </span>

            {problem._count && problem._count.solutions > 0 && (
              <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-md font-semibold">
                <Lightbulb size={13} />
                <span>{problem._count.solutions} sol</span>
              </span>
            )}
          </div>

          <span className="text-gray-400">{timeAgo(problem.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
